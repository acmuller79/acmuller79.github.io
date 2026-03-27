// IA-ACMULLER - Versão Simples e Funcional

// Configurações
let config = { geminiKey: '', openaiKey: '' };
let modeloAtual = 'gemini';

// Carregar configurações
function carregarConfig() {
    try {
        const salvo = localStorage.getItem('acmuller-settings');
        if (salvo) {
            config = JSON.parse(salvo);
        }
    } catch (e) {
        console.log('Erro ao carregar:', e);
    }
}

// Salvar configurações  
function salvarConfig() {
    const gemini = document.getElementById('gemini-key').value.trim();
    const openai = document.getElementById('openai-key').value.trim();

    config = { geminiKey: gemini, openaiKey: openai };
    localStorage.setItem('acmuller-settings', JSON.stringify(config));

    fecharModal();
    atualizarStatus();
    alert('✅ Configurações salvas!');
}

// Abrir/fechar modal
function abrirModal() {
    document.getElementById('settings-modal').style.display = 'flex';
    document.getElementById('gemini-key').value = config.geminiKey;
    document.getElementById('openai-key').value = config.openaiKey;
}

function fecharModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

// Atualizar status
function atualizarStatus() {
    const temChave = modeloAtual === 'gemini' ? config.geminiKey : config.openaiKey;
    const status = temChave ? '🟢 Pronto' : '⚠️ Configure API Key';
    document.getElementById('model-status').textContent = status;
}

// Mudar modelo
function mudarModelo() {
    modeloAtual = document.getElementById('ai-model').value;
    atualizarStatus();
}

// Enviar mensagem
async function enviarMensagem() {
    const input = document.getElementById('chat-input');
    const mensagem = input.value.trim();

    if (!mensagem) return;

    const chave = modeloAtual === 'gemini' ? config.geminiKey : config.openaiKey;
    if (!chave) {
        alert('❌ Configure a API Key primeiro!');
        abrirModal();
        return;
    }

    // Adicionar mensagem do usuário
    adicionarMensagem(mensagem, 'user');
    input.value = '';

    // Mostrar "digitando"
    const typingId = mostrarDigitando();

    try {
        let resposta;
        if (modeloAtual === 'gemini') {
            resposta = await chamarGemini(mensagem, chave);
        } else {
            resposta = 'OpenAI desativado (requer backend). Use Google Gemini!';
        }

        removerDigitando(typingId);
        adicionarMensagem(resposta, 'ai');
    } catch (erro) {
        removerDigitando(typingId);
        adicionarMensagem('❌ Erro: ' + erro.message, 'ai');
    }
}

// Chamar API Gemini
async function chamarGemini(mensagem, chave) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + chave;

    const resposta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: mensagem }] }]
        })
    });

    if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.error?.message || 'Erro na API');
    }

    const dados = await resposta.json();
    return dados.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
}

// Adicionar mensagem na tela
function adicionarMensagem(texto, tipo) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'message ' + tipo;
    div.innerHTML = '<div class="message-avatar">' + (tipo === 'user' ? '👤' : '🤖') + '</div>' +
                   '<div class="message-content">' + formatarTexto(texto) + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// Formatar texto
function formatarTexto(texto) {
    return texto
        .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// Mostrar indicador de digitação
function mostrarDigitando() {
    const container = document.getElementById('chat-messages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'message ai';
    div.innerHTML = '<div class="message-avatar">🤖</div>' +
                   '<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

function removerDigitando(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Navegação entre seções
function mostrarSecao(secao) {
    // Esconder todas
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Mostrar selecionada
    document.getElementById(secao + '-section').classList.add('active');
    document.querySelector('[data-section="' + secao + '"]').classList.add('active');

    // Atualizar título
    const titulos = {
        'chat': 'Chat Inteligente',
        'code': 'Editor de Código',
        'voice': 'Comandos de Voz',
        'video': 'Análise de Vídeo',
        'agent': 'Agente Autônomo'
    };
    document.getElementById('section-title').textContent = titulos[secao];
}

// Executar código
function executarCodigo() {
    const codigo = document.getElementById('code-editor').value;
    const output = document.getElementById('output-content');

    try {
        let logs = [];
        const originalLog = console.log;
        console.log = function(...args) { logs.push(args.join(' ')); };

        const resultado = eval(codigo);
        console.log = originalLog;

        output.textContent = logs.join('\n') || String(resultado) || '✅ Executado';
    } catch (e) {
        output.textContent = '❌ ' + e.message;
    }
}

// Limpar chat
function limparChat() {
    document.getElementById('chat-messages').innerHTML = '';
}

// Exportar conversa
function exportarConversa() {
    const dados = { data: new Date().toISOString(), modelo: modeloAtual };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acmuller-chat.json';
    a.click();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarConfig();
    atualizarStatus();

    // Configurar eventos
    document.getElementById('chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagem();
        }
    });

    document.getElementById('ai-model').addEventListener('change', mudarModelo);

    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            mostrarSecao(this.dataset.section);
        });
    });

    console.log('✅ IA-ACMULLER carregado!');
});
