// Funções do Spotify reaproveitadas em todas as páginas do site

// Obtém o token de acesso do Spotify — agora via backend, sem expor segredo nenhum
export async function getToken() {

    const response = await fetch("/api/spotify-token");

    if (!response.ok) {
        throw new Error(`Erro ao obter token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}

// Busca uma faixa específica pelo nome do artista e da música
export async function searchTrack(token, artist, track) {

    const query = `track:${track} artist:${artist}`;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks.items[0] || null;
}