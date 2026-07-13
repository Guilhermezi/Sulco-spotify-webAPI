import { getToken, searchTrack } from "../spotify.js";

const promptInput = document.querySelector("#ai-prompt");
const generateButton = document.querySelector("#generate-button");
const resultsContainer = document.querySelector("#ai-results");
const savedContainer = document.querySelector("#saved-playlists");

let tokenAtual = null;

// Busca o token do Spotify assim que a página carrega
async function init() {
    try {
        tokenAtual = await getToken();
    }
    catch (error) {
        console.error(error);
    }
}
init();

// Chama o backend, que por sua vez chama a IA, e devolve sugestões de faixas
async function gerarSugestoes(prompt) {

    const response = await fetch("/api/generate-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        throw new Error(`Erro ao gerar playlist: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks; // [{ artist, track }, ...]
}

// Para cada sugestão da IA, busca a faixa real no Spotify (capa, link, etc.)
async function enriquecerComSpotify(sugestoes) {

    const faixasEncontradas = [];

    for (const sugestao of sugestoes) {

        const faixa = await searchTrack(tokenAtual, sugestao.artist, sugestao.track);

        if (faixa) {
            faixasEncontradas.push({
                nome: faixa.name,
                artista: faixa.artists[0].name,
                capa: faixa.album.images[0]?.url,
                spotifyUrl: faixa.external_urls.spotify
            });
        }
    }

    return faixasEncontradas;
}

// Mostra as faixas geradas na tela
function renderResultados(faixas) {

    resultsContainer.innerHTML = "";

    faixas.forEach(faixa => {

        const li = document.createElement("li");
        li.classList.add("ai-track");

        li.innerHTML = `
            <img src="${faixa.capa}" alt="${faixa.nome}">
            <div class="ai-track-info">
                <p class="ai-track-name">${faixa.nome}</p>
                <p class="ai-track-artist">${faixa.artista}</p>
            </div>
            <a href="${faixa.spotifyUrl}" target="_blank" rel="noopener" class="ai-track-link">
                <i class="ri-external-link-line"></i>
            </a>
        `;

        resultsContainer.appendChild(li);
    });
}

// Salva a playlist atual no localStorage do navegador (sem backend nenhum)
function salvarPlaylist(prompt, faixas) {

    const playlists = JSON.parse(localStorage.getItem("playlists") || "[]");

    playlists.push({
        id: Date.now(),
        titulo: prompt,
        faixas
    });

    localStorage.setItem("playlists", JSON.stringify(playlists));

    renderPlaylistsSalvas();
}

// Mostra a lista de playlists já salvas anteriormente
function renderPlaylistsSalvas() {

    const playlists = JSON.parse(localStorage.getItem("playlists") || "[]");

    savedContainer.innerHTML = "";

    playlists.forEach(playlist => {

        const li = document.createElement("li");
        li.classList.add("playlist-saved");
        li.textContent = `${playlist.titulo} — ${playlist.faixas.length} faixas`;

        savedContainer.appendChild(li);
    });
}

renderPlaylistsSalvas();

// Botão "Gerar com IA"
generateButton.addEventListener("click", async () => {

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    generateButton.disabled = true;
    generateButton.textContent = "Gerando...";

    try {
        const sugestoes = await gerarSugestoes(prompt);
        const faixas = await enriquecerComSpotify(sugestoes);

        renderResultados(faixas);
        salvarPlaylist(prompt, faixas);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        generateButton.disabled = false;
        generateButton.textContent = "Gerar com IA";
    }
});