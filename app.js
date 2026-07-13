
// ========================================
// SPOTIFY API
// ========================================


import { getToken } from "./spotify.js";


// ========================================
// BUSCAR ÁLBUNS PELO NOME
// ========================================

// Função para buscar álbuns no Spotify a partir de um texto digitado pelo usuário
async function searchAlbums(token, query) {

    // Monta a URL de busca, codificando o texto pra funcionar como parâmetro de URL
    const url =
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=8`;

    // Faz a requisição de busca usando o token de acesso
    const response = await fetch(url, {
        // Cabeçalhos da requisição com o token de acesso
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // Verifica se a busca deu certo antes de continuar
    if (!response.ok) {
        // Interrompe a execução e avisa qual foi o erro
        throw new Error(`Erro na busca: ${response.status}`);
    }

    // Converte a resposta para JSON
    const data = await response.json();

    // Retorna apenas a lista de álbuns encontrados na busca
    return data.albums.items;
}


// ========================================
// BUSCAR ÁLBUM ESPECÍFICO
// ========================================

// Função para buscar informações completas de um álbum, a partir do ID escolhido
async function getAlbum(token, albumId) {

    // Faz a requisição para obter informações do álbum
    const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
            // Cabeçalhos da requisição com o token de acesso
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    // Verifica se a requisição deu certo antes de continuar
    if (!response.ok) {
        // Interrompe a execução e avisa qual foi o erro
        throw new Error(`Erro ao buscar álbum: ${response.status}`);
    }

    // Converte a resposta para JSON e retorna
    return await response.json();
}


// ========================================
// MOSTRAR RESULTADOS DA BUSCA
// ========================================

// Função para exibir a lista de álbuns encontrados, como itens clicáveis
function renderSearchResults(albums, token) {

    // Seleciona o elemento onde os resultados serão exibidos
    const resultsContainer =
        document.querySelector("#search-results");

    // Limpa resultados de uma busca anterior
    resultsContainer.innerHTML = "";

    // Itera sobre cada álbum encontrado e cria um item de lista para cada um
    albums.forEach(album => {

        // Cria o elemento de item de lista
        const li = document.createElement("li");

        // Define o texto mostrando nome do álbum e artista
        li.textContent =
            `${album.name} — ${album.artists[0].name}`;

        // Adiciona o evento de clique nesse resultado específico
        li.addEventListener("click", async () => {

            // Esconde a lista de resultados assim que um álbum é escolhido
            resultsContainer.innerHTML = "";

            // Busca as informações completas do álbum escolhido
            const albumCompleto =
                await getAlbum(token, album.id);

            // Renderiza as informações do álbum na tela
            renderAlbum(albumCompleto);

            // Renderiza a lista de faixas do álbum na tela
            renderTracks(albumCompleto);

        });

        // Adiciona o item de lista ao container de resultados
        resultsContainer.appendChild(li);
    });
}


// ========================================
// MOSTRAR INFORMAÇÕES DO ÁLBUM
// ========================================

function renderAlbum(album) {

    // Mostra informações do álbum no console
    console.log("Nome:", album.name);

    console.log(
        "Artista:",
        album.artists[0].name
    );

    console.log(
        "Data:",
        album.release_date
    );

    console.log(
        "Faixas:",
        album.total_tracks
    );

    console.log(`Popularidade do álbum: ${album.popularity}`);


    // Mostra informações e capa na página

    // Seleciona o elemento de título e define o nome do álbum
    document.querySelector("#album-name").textContent =
        album.name;

    // Seleciona o elemento de artista e define o nome do artista
    document.querySelector("#album-artist").textContent =
        album.artists[0].name;

    // Seleciona a imagem já existente no HTML (dentro do #album-info)
    const img =
        document.querySelector("#album-image");

    // Define a URL da imagem como a primeira imagem do álbum
    img.src = album.images[0].url;

    // Define um texto alternativo para acessibilidade
    img.alt = `Capa do álbum ${album.name}`;

    // Dispara a animação de entrada no bloco de informações do álbum
    document
        .querySelector("#album-info")
        .classList.add("animar");

        // Insere o player oficial do Spotify pra esse álbum específico
        renderSpotifyPlayer(album.id);
}


// ========================================
// MOSTRAR MÚSICAS
// ========================================

function renderTracks(album) {

    // Seleciona o elemento da lista de faixas
    const tracksContainer =
        document.querySelector("#tracks");

    // Limpa o conteúdo anterior da lista de faixas    
    tracksContainer.innerHTML = "";

    // Itera sobre cada faixa do álbum e cria um player compacto para cada uma
    album.tracks.items.forEach((track, index) => {

        const li =
            document.createElement("li");

        li.classList.add("ai-track");

        // Player oficial compacto do Spotify, um por faixa
        li.innerHTML = `
            <iframe
                src="https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0"
                width="100%"
                height="80"
                frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>
        `;

        // Mantém a animação de entrada em cascata
        li.classList.add("animar");
        li.style.animationDelay = `${index * 0.08}s`;

        tracksContainer.appendChild(li);
    });
}


// ========================================
// TOKEN GLOBAL
// ========================================

// Guarda o token de acesso pra ser reutilizado em várias buscas,
// sem precisar pedir um novo a cada clique
let tokenAtual = null;


// ========================================
// INICIALIZAÇÃO
// ========================================

async function init() {

    try {

        console.log("Obtendo token...");

        // Busca o token uma única vez, assim que a página carrega
        tokenAtual =
            await getToken();

        console.log("Token recebido");

    }
    catch(error) {

        console.error(error);
    }
}

// Chama a inicialização assim que o script é carregado
init();


// ========================================
// BOTÃO DE BUSCA
// ========================================

document
    // seleciona o botão de busca e adiciona um evento de clique
    .querySelector("#search-button")
    .addEventListener("click", async () => {

        // Pega o texto digitado pelo usuário, removendo espaços extras
        const query =
            document.querySelector("#search-input").value.trim();

        // Não faz nada se o campo estiver vazio
        if (!query) return;

        try {

            // Busca os álbuns que correspondem ao texto digitado
            const albuns =
                await searchAlbums(tokenAtual, query);

            // Mostra os resultados encontrados na tela
            renderSearchResults(albuns, tokenAtual);

        }
        catch (error) {

            console.error(error);
        }
    });


// ========================================
// BUSCA COM A TECLA ENTER
// ========================================

document
    // seleciona o campo de busca e adiciona um evento de teclado
    .querySelector("#search-input")
    .addEventListener("keydown", (event) => {

        // Verifica se a tecla pressionada foi Enter
        if (event.key === "Enter") {

            // Simula um clique no botão de busca
            document.querySelector("#search-button").click();
        }
    });