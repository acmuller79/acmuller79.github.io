// IA-ACMULLER - Versão Mínima Funcional
let config = { geminiKey: '' };

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    if (modal.style.display === 'flex') {
        document.getElementById('gemini-key').value = config.geminiKey;
    }
}

function saveSettings() {
    config.geminiKey = document.getElementById('gemini-key').value.trim();
    localStorage.setItem('acmuller-settings', JSON.stringify(config));
    toggleSettings();
    document.getElementById('model-status').textContent = config.geminiKey ? '🟢 Pronto' : '⚠️ Sem API Key';
    alert('✅ Salvo!');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    if (!config.geminiKey) {
        alert('Configure a API Key!');
        toggleSettings();
        return;
    }
    addMessage(msg, 'user');
    input.value = '';
    const typing = showTyping();
    
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + config.geminiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: msg }] }] })
    })
    .then(r => r.json())
    .then(d => {
        removeTyping(typing);
        addMessage(d.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta', 'ai');
    })
    .catch(e => {
        removeTyping(typing);
        addMessage('❌ Erro: ' + e.message, 'ai');
    });
}

function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = 'message ' + type;
    div.innerHTML = '<div class="message-avatar">' + (type === 'user' ? '👤' : '🤖') + '</div>' +
                   '<div class="message-content">' + text.replace(/\n/g, '<br>') + '</div>';
    document.getElementById('chat-messages').appendChild(div);
    div.scrollIntoView({ behavior: 'smooth' });
}

function showTyping() {
    const id = 't' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'message ai';
    div.innerHTML = '<div class="message-avatar">🤖</div><div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    document.getElementById('chat-messages').appendChild(div);
    return id;
}

function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('acmuller-settings');
    if (saved) config = JSON.parse(saved);
    document.getElementById('model-status').textContent = config.geminiKey ? '🟢 Pronto' : '⚠️ Sem API Key';
    document.getElementById('chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
});
