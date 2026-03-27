// IA-ACMULLER Web - Versão Final com modelo correto

class ACMullerAI {
    constructor() {
        this.currentModel = 'gemini';
        this.conversation = [];
        this.settings = { geminiKey: 'AIzaSyBnoh4wuksrYfklcrsCB56uBjVPw44IIWQ', openaiKey: '' };
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupNavigation();
        this.setupChat();
        this.setupVoice();
        this.setupVideo();
        this.setupSettingsButton();
        this.updateModelStatus();
    }

    setupSettingsButton() {
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSettings();
            });
        }

        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.toggleSettings();
            });
        }
    }

    toggleSettings() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        const isActive = modal.classList.contains('active');
        if (isActive) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.loadSettingsToForm();
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('acmuller-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = {
                    geminiKey: parsed.geminiKey || '',
                    openaiKey: parsed.openaiKey || ''
                };
            }
        } catch (e) {
            console.error('Erro ao carregar settings:', e);
        }
    }

    loadSettingsToForm() {
        const geminiInput = document.getElementById('gemini-key');
        const openaiInput = document.getElementById('openai-key');
        if (geminiInput) geminiInput.value = this.settings.geminiKey;
        if (openaiInput) openaiInput.value = this.settings.openaiKey;
    }

    saveSettings() {
        const geminiKey = document.getElementById('gemini-key')?.value?.trim() || '';
        const openaiKey = document.getElementById('openai-key')?.value?.trim() || '';

        this.settings = { geminiKey, openaiKey };
        localStorage.setItem('acmuller-settings', JSON.stringify(this.settings));

        this.toggleSettings();
        this.updateModelStatus();
        this.showNotification('✅ Configurações salvas!', 'success');
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section');
        const titles = {
            'chat': 'Chat Inteligente',
            'code': 'Editor de Código',
            'voice': 'Comandos de Voz',
            'video': 'Análise de Vídeo',
            'agent': 'Agente Autônomo'
        };

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(section + '-section').classList.add('active');
                document.getElementById('section-title').textContent = titles[section];
            });
        });

        const modelSelect = document.getElementById('ai-model');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                this.currentModel = e.target.value;
                this.updateModelStatus();
            });
        }
    }

    updateModelStatus() {
        const hasKey = this.currentModel === 'gemini' 
            ? this.settings.geminiKey 
            : this.settings.openaiKey;
        const status = hasKey ? '🟢 Pronto' : '⚠️ Sem API Key';
        const statusEl = document.getElementById('model-status');
        if (statusEl) statusEl.textContent = status;
    }

    setupChat() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = input.scrollHeight + 'px';
        });
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        const apiKey = this.currentModel === 'gemini' 
            ? this.settings.geminiKey 
            : this.settings.openaiKey;

        if (!apiKey) {
            this.showNotification('❌ Configure a API Key primeiro!', 'error');
            this.toggleSettings();
            return;
        }

        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        const typingId = this.showTyping();

        try {
            let response;
            if (this.currentModel === 'gemini') {
                response = await this.callGemini(message, apiKey);
            } else {
                response = await this.callOpenAI(message, apiKey);
            }
            this.removeTyping(typingId);
            this.addMessage(response, 'ai');
        } catch (error) {
            this.removeTyping(typingId);
            this.addMessage('❌ Erro: ' + error.message, 'ai');
        }
    }

    async callGemini(message, apiKey) {
        // CORREÇÃO: Usar gemini-pro que funciona com API key gratuita
        const model = 'gemini-pro';
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: message }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Erro na API Gemini');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
    }

    async callOpenAI(message, apiKey) {
        // OpenAI pode ter problema de CORS no frontend
        // Vamos usar um proxy ou mostrar mensagem informativa
        throw new Error('OpenAI requer backend (CORS). Use Google Gemini que é gratuito e funciona direto!');
    }

    addMessage(text, sender) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const welcome = container.querySelector('.welcome-message');
        if (welcome && sender === 'user') welcome.remove();

        const div = document.createElement('div');
        div.className = 'message ' + sender;
        div.innerHTML = '<div class="message-avatar">' + (sender === 'user' ? '👤' : '🤖') + '</div>' +
                       '<div class="message-content">' + this.formatMessage(text) + '</div>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    formatMessage(text) {
        return text
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    showTyping() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

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

    removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    runCode() {
        const code = document.getElementById('code-editor')?.value || '';
        const output = document.getElementById('output-content');
        if (!output) return;

        output.textContent = '⏳ Executando...';
        try {
            let logs = [];
            const originalLog = console.log;
            console.log = (...args) => logs.push(args.join(' '));
            const result = eval(code);
            console.log = originalLog;
            output.textContent = logs.join('\n') || String(result) || '✅ Executado';
        } catch (e) {
            output.textContent = '❌ ' + e.message;
        }
    }

    async explainCode() {
        const code = document.getElementById('code-editor')?.value || '';
        if (!this.settings.geminiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            return;
        }
        try {
            const response = await this.callGemini('Explique este código:\n\n' + code, this.settings.geminiKey);
            alert('💡 Explicação:\n\n' + response);
        } catch (error) {
            alert('❌ Erro: ' + error.message);
        }
    }

    setupVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            const status = document.getElementById('voice-status');
            if (status) status.textContent = '❌ Navegador não suporta voz';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
            const btn = document.getElementById('mic-btn');
            const status = document.getElementById('voice-status');
            if (btn) btn.classList.add('recording');
            if (status) status.textContent = '🎙️ Ouvindo...';
        };

        this.recognition.onend = () => {
            const btn = document.getElementById('mic-btn');
            const status = document.getElementById('voice-status');
            if (btn) btn.classList.remove('recording');
            if (status) status.textContent = 'Clique para falar';
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            const transcriptEl = document.getElementById('voice-transcript');
            if (transcriptEl) transcriptEl.textContent = transcript;
            if (event.results[0].isFinal) this.processVoice(transcript);
        };
    }

    toggleVoice() {
        if (!this.recognition) {
            this.showNotification('Seu navegador não suporta reconhecimento de voz', 'error');
            return;
        }
        const btn = document.getElementById('mic-btn');
        if (btn && btn.classList.contains('recording')) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async processVoice(text) {
        if (!this.settings.geminiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            return;
        }
        const responseEl = document.getElementById('voice-response');
        if (responseEl) responseEl.innerHTML = '<div class="loading"></div> Processando...';

        try {
            const response = await this.callGemini(text, this.settings.geminiKey);
            if (responseEl) responseEl.textContent = response;
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.lang = 'pt-BR';
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            if (responseEl) responseEl.textContent = 'Erro: ' + error.message;
        }
    }

    setupVideo() {
        const dropZone = document.getElementById('video-drop-zone');
        const fileInput = document.getElementById('video-input');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) this.handleVideo(e.dataTransfer.files[0]);
            });
            fileInput.addEventListener('change', (e) => { 
                if (e.target.files.length) this.handleVideo(e.target.files[0]); 
            });
        }
    }

    handleVideo(file) {
        const url = URL.createObjectURL(file);
        const player = document.getElementById('video-player');
        const dropZone = document.getElementById('video-drop-zone');
        const preview = document.getElementById('video-preview');
        if (player) player.src = url;
        if (dropZone) dropZone.style.display = 'none';
        if (preview) preview.style.display = 'grid';
    }

    async analyzeVideo() {
        if (!this.settings.geminiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            return;
        }
        const results = document.getElementById('video-results');
        if (results) results.innerHTML = '<div class="loading"></div> Analisando...';
        setTimeout(() => {
            if (results) results.innerHTML = '<p>📸 Vídeo carregado!</p><p>Funcionalidade completa em breve.</p>';
        }, 1000);
    }

    async startAgent() {
        const goal = document.getElementById('agent-goal')?.value;
        if (!goal) {
            this.showNotification('Digite um objetivo primeiro!', 'error');
            return;
        }
        if (!this.settings.geminiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            this.toggleSettings();
            return;
        }
        const setup = document.querySelector('.agent-setup');
        const execution = document.getElementById('agent-execution');
        const steps = document.getElementById('agent-steps');
        if (setup) setup.style.display = 'none';
        if (execution) execution.style.display = 'block';
        if (steps) steps.innerHTML = '<div class="loading"></div> Executando...';

        try {
            const response = await this.callGemini('Execute como agente: ' + goal, this.settings.geminiKey);
            if (steps) steps.innerHTML = '';
            const result = document.getElementById('agent-result');
            if (result) result.innerHTML = '<h4>✅ Resultado</h4><div>' + this.formatMessage(response) + '</div>';
        } catch (error) {
            if (steps) steps.innerHTML = '❌ Erro: ' + error.message;
        }
    }

    showNotification(msg, type) {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px 24px;border-radius:8px;color:white;z-index:9999;font-family:Inter,sans-serif;animation:fadeIn 0.3s;max-width:300px;word-wrap:break-word;';
        div.style.background = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10a37f';
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    clearCurrent() {
        const container = document.getElementById('chat-messages');
        if (container) container.innerHTML = '';
        this.conversation = [];
    }

    exportConversation() {
        const data = { date: new Date().toISOString(), conversation: this.conversation };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' };
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acmuller-chat.json';
        a.click();
    }
}

// Inicialização
const app = new ACMullerAI();

// Funções globais
function sendMessage() { app.sendMessage(); }
function toggleVoice() { app.toggleVoice(); }
function runCode() { app.runCode(); }
function explainCode() { app.explainCode(); }
function analyzeVideo() { app.analyzeVideo(); }
function startAgent() { app.startAgent(); }
function toggleSettings() { app.toggleSettings(); }
function saveSettings() { app.saveSettings(); }
function clearCurrent() { app.clearCurrent(); }
function exportConversation() { app.exportConversation(); }

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('settings-modal');
        if (modal && modal.classList.contains('active')) toggleSettings();
    }
});

console.log('✅ IA-ACMULLER v3.0 - Modelo: gemini-pro');
