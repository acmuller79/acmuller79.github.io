
# Corrigir para usar o modelo correto: gemini-1.5-flash

app_js_correto = '''// IA-ACMULLER - Versão Corrigida

// Configurações
let config = { geminiKey: 'AIzaSyBnoh4wuksrYfklcrsCB56uBjVPw44IIWQ', openaiKey: '' };
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

// Chamar API Gemini - CORREÇÃO: modelo gemini-1.5-flash
async function chamarGemini(mensagem, chave) {
    // Modelo correto que funciona com API key gratuita
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + chave;
    
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
        .replace(/\\n/g, '<br>');
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
        
        output.textContent = logs.join('\\n') || String(resultado) || '✅ Executado';
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
    
    console.log('✅ IA-ACMULLER carregado! Modelo: gemini-1.5-flash');
});
'''

# Salvar
with open('/mnt/kimi/output/acmuller-web-simple/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js_correto)

# Criar ZIP
import zipfile
import os

zip_path = '/mnt/kimi/output/acmuller-web-simple.zip'
source_dir = '/mnt/kimi/output/acmuller-web-simple'

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, source_dir)
            zipf.write(file_path, arcname)

print("✅ CORREÇÃO FINAL!")
print(f"📦 ZIP: {zip_path}")
print(f"📦 Tamanho: {os.path.getsize(zip_path) / 1024:.1f} KB")
print("\n🔧 CORREÇÕES:")
print("1. ✅ Modelo: gemini-1.5-flash (o correto!)")
print("2. ✅ Funções renomeadas para português (evita conflito)")
print("3. ✅ Código mais simples e direto")
