// Seleciona o botão de alternância de tema
const toggleButton = document.querySelector("#dark-mode-toggle");

// Verifica se o usuário já tinha escolhido dark mode antes
const temaSalvo = localStorage.getItem("tema");

if (temaSalvo === "dark") {
    document.body.classList.add("dark");
}

// Atualiza o ícone (lua/sol) de acordo com o tema atual
function atualizarIcone() {
    const icone = document.querySelector(".ri-moon-line, .ri-sun-line");
    const estaEscuro = document.body.classList.contains("dark");
    icone.className = estaEscuro ? "ri-sun-line" : "ri-moon-line";
}

// Aplica o ícone correto já na carga da página, refletindo o tema salvo
atualizarIcone();

// Alterna a classe "dark" no body ao clicar no botão
toggleButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    // Salva a preferência do usuário no localStorage
    const estaEscuro = document.body.classList.contains("dark");
    localStorage.setItem("tema", estaEscuro ? "dark" : "light");

    atualizarIcone();

});