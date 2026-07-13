// Função serverless: busca o token do Spotify usando o Client Secret,
// que fica só aqui no servidor — nunca é enviado pro navegador.

export default async function handler(request, response) {

    try {

        const authString = Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64");

        const spotifyResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${authString}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });

        if (!spotifyResponse.ok) {
            throw new Error(`Erro ao obter token: ${spotifyResponse.status}`);
        }

        const data = await spotifyResponse.json();

        return response.status(200).json({ access_token: data.access_token });

    }
    catch (error) {
        console.error(error);
        return response.status(500).json({ error: "Não foi possível obter o token do Spotify" });
    }
}