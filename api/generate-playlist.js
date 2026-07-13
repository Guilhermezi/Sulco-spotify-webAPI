
// Função serverless: recebe um pedido de playlist, pergunta pra IA,
// e devolve sugestões de faixas. A chave da IA fica só aqui, no
// servidor — nunca é enviada pro navegador do usuário.

export default async function handler(request, response) {

    // Só aceita requisições POST
    if (request.method !== "POST") {
        return response.status(405).json({ error: "Método não permitido" });
    }

    const { prompt } = request.body;

    // Valida se o usuário mandou uma descrição de playlist
    if (!prompt || typeof prompt !== "string") {
        return response.status(400).json({ error: "Envie um 'prompt' descrevendo a playlist" });
    }

    try {

        // Chama a IA (Groq) pedindo sugestões em formato JSON
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // A chave vem de uma variável de ambiente, configurada na Vercel
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Você é um curador musical. Responda SOMENTE em JSON válido, sem texto antes ou depois, no formato: {\"tracks\":[{\"artist\":\"nome do artista\",\"track\":\"nome da faixa\"}]}. Sugira exatamente 10 faixas reais que existam no Spotify, relevantes ao pedido do usuário."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.8
            })
        });

        if (!groqResponse.ok) {
            throw new Error(`Erro na IA: ${groqResponse.status}`);
        }

        const data = await groqResponse.json();

        // Extrai e converte o JSON que a IA devolveu como texto
        const sugestoes = JSON.parse(data.choices[0].message.content);

        return response.status(200).json(sugestoes);

    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Não foi possível gerar a playlist" });
    }
}