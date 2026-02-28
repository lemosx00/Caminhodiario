let pontos = parseInt(localStorage.getItem('pontos')) || 0;
let versaoAtual = localStorage.getItem('versao') || 'nvi';
let bibliaCache = null;

// --- COMPONENTES DA IA PARA GERAR DESAFIOS ---
const iaAcoes = ["Ore por", "Mande uma mensagem para", "Ajude hoje", "Demonstre amor a", "Interceda por", "Abençoe", "Compartilhe uma palavra com", "Encoraje"];
const iaAlvos = ["um vizinho", "um familiar", "alguém do trabalho", "um amigo esquecido", "uma autoridade", "alguém que te feriu", "alguém que você viu na rua"];
const iaTemas = ["com paciência", "com gratidão", "falando sobre a paz", "com humildade", "com alegria", "demonstrando generosidade"];

// Versículos base para a IA (Livro, Capítulo, Versículo)
const versiculosIA = [
    { l: 18, c: 22, v: 0 }, { l: 39, c: 4, v: 43 }, { l: 44, c: 11, v: 1 }, 
    { l: 19, c: 2, v: 4 }, { l: 58, c: 0, v: 4 }, { l: 47, c: 4, v: 21 },
    { l: 18, c: 33, v: 17 }, { l: 49, c: 3, v: 12 }, { l: 50, c: 2, v: 12 },
    { l: 19, c: 14, v: 0 }, { l: 53, c: 1, v: 0 }, { l: 39, c: 5, v: 2 }
];

window.onload = async () => {
    document.getElementById('select-versao').value = versaoAtual;
    await carregarBiblia();
    popularLivros();
    atualizarTudo();
    atualizarPlacar();
};

// --- CARREGAMENTO DE DADOS ---
async function carregarBiblia() {
    try {
        const res = await fetch(`${versaoAtual}.json`);
        bibliaCache = await res.json();
    } catch (e) {
        alert("Erro ao carregar versão: " + versaoAtual + ". Verifique se o arquivo existe.");
    }
}

async function trocarVersao() {
    versaoAtual = document.getElementById('select-versao').value;
    localStorage.setItem('versao', versaoAtual);
    document.getElementById('texto-biblico').innerText = "Carregando tradução...";
    await carregarBiblia();
    popularLivros();
    atualizarTudo();
}

// --- LÓGICA DA IA E ATUALIZAÇÃO ---
function atualizarTudo() {
    if (!bibliaCache) return;

    // Sorteio da IA
    const acao = iaAcoes[Math.floor(Math.random() * iaAcoes.length)];
    const alvo = iaAlvos[Math.floor(Math.random() * iaAlvos.length)];
    const tema = iaTemas[Math.floor(Math.random() * iaTemas.length)];
    const ref = versiculosIA[Math.floor(Math.random() * versiculosIA.length)];

    // Define os textos na tela
    document.getElementById('titulo-desafio').innerText = "Desafio do dia";
    document.getElementById('desc-desafio').innerText = `${acao} ${alvo} ${tema}.`;
    
    // Puxa o versículo do cache da Bíblia
    const livro = bibliaCache[ref.l];
    const texto = livro.chapters[ref.c][ref.v];
    
    document.getElementById('texto-biblico').innerText = `"${texto}"`;
    document.getElementById('referencia-biblica').innerText = `${livro.abbrev.toUpperCase()} ${ref.c + 1}:${ref.v + 1}`;
}

// --- HISTÓRICO E APRENDIZADO ---
function postarAprendizado() {
    const textoInsight = document.getElementById('comentario-texto').value;
    const versiculoEstudado = document.getElementById('texto-biblico').innerText;
    const referenciaEstudada = document.getElementById('referencia-biblica').innerText;

    if (!textoInsight.trim()) {
        alert("Por favor, escreva sua reflexão antes de salvar.");
        return;
    }

    const novoAprendizado = {
        insight: textoInsight,
        versiculo: versiculoEstudado,
        ref: `${referenciaEstudada} (${versaoAtual.toUpperCase()})`,
        data: new Date().toLocaleDateString()
    };

    let histA = JSON.parse(localStorage.getItem('histAprendizados')) || [];
    histA.unshift(novoAprendizado);
    localStorage.setItem('histAprendizados', JSON.stringify(histA));

    document.getElementById('comentario-texto').value = "";
    ganharPontos(5);
    carregarHistorico(); 
    alert("Aprendizado vinculado ao versículo com sucesso!");
}

function concluirTarefa() {
    const titulo = document.getElementById('desc-desafio').innerText; // Usamos a descrição como chave única
    const data = new Date().toLocaleDateString();
    
    let hist = JSON.parse(localStorage.getItem('histDesafios')) || [];
    if(!hist.find(h => h.titulo === titulo && h.data === data)) {
        hist.unshift({ titulo, data });
        localStorage.setItem('histDesafios', JSON.stringify(hist));
        ganharPontos(10);
        alert("Desafio concluído! +10 pontos.");
        carregarHistorico();
    } else {
        alert("Você já concluiu este desafio específico hoje!");
    }
}

function carregarHistorico() {
    const histD = JSON.parse(localStorage.getItem('histDesafios')) || [];
    const histA = JSON.parse(localStorage.getItem('histAprendizados')) || [];
    
    document.getElementById('hist-desafios').innerHTML = histD.map(h => 
        `<div class="item-hist"><strong>${h.data}:</strong> ${h.titulo}</div>`
    ).join('') || "Nenhum desafio concluído.";

    document.getElementById('hist-aprendizados').innerHTML = histA.map(a => `
        <div class="item-hist">
            <small>${a.data} - ${a.ref}</small>
            <blockquote style="font-style: italic; color: #555; border-left: 2px solid #d4af37; padding-left: 10px; margin: 5px 0;">
                ${a.versiculo}
            </blockquote>
            <p style="margin-top: 10px; font-weight: bold;">📝  ${a.insight}</p>
        </div>
    `).join('') || "Nenhum aprendizado salvo.";
}

// --- NAVEGAÇÃO ---
function mostrarAba(aba) {
    // 1. Esconde TODAS as seções primeiro
    const secoes = document.querySelectorAll('.content-section');
    secoes.forEach(s => {
        s.style.display = 'none';
    });

    // 2. Mostra apenas a seção que o usuário clicou
    const abaAlvo = document.getElementById(`aba-${aba}`);
    if (abaAlvo) {
        abaAlvo.style.display = 'block';
    }

    // 3. Gerencia o visual dos botões (cor de destaque)
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // O 'event' identifica qual botão foi clicado para colocar a cor nele
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // 4. SE a aba for histórico, força a atualização dos dados na tela
    if (aba === 'historico') {
        carregarHistorico();
    }
}

// --- BÍBLIA ---
function popularLivros() {
    const select = document.getElementById('biblia-livro');
    select.innerHTML = "";
    bibliaCache.forEach((livro, idx) => {
        let opt = document.createElement('option');
        opt.value = idx;
        opt.innerText = livro.name;
        select.appendChild(opt);
    });
}

function lerCapitulo() {
    const livroIdx = document.getElementById('biblia-livro').value;
    const capNum = parseInt(document.getElementById('biblia-cap').value) - 1;
    const container = document.getElementById('leitura-biblica');
    
    const capitulos = bibliaCache[livroIdx].chapters;
    if(capitulos[capNum]) {
        let html = `<h4>${bibliaCache[livroIdx].name} - Cap. ${capNum + 1}</h4>`;
        capitulos[capNum].forEach((verso, i) => {
            html += `<p><sup>${i+1}</sup> ${verso}</p>`;
        });
        container.innerHTML = html;
    } else {
        container.innerHTML = "Capítulo não encontrado.";
    }
}

// --- PONTOS ---
function ganharPontos(qtd) {
    pontos += qtd;
    localStorage.setItem('pontos', pontos);
    atualizarPlacar();
}

function atualizarPlacar() {
    document.getElementById('pontos').innerText = pontos;
    const status = document.getElementById('status-fiel');
    if(pontos >= 500) status.innerText = "🏆 Ancião da Fé";
    else if(pontos >= 200) status.innerText = "🛡️ Soldado de Cristo";
    else if(pontos >= 50) status.innerText = "🌱 Servo Fiel";
    else status.innerText = "🌱 Servo Esforçado";
}