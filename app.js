// IA-ACMULLER Web - Versão Frontend Only
// Chama APIs diretamente do navegador (Gemini e OpenAI)

class ACMullerAI {
    constructor() {
        this.currentModel = 'gemini';
        this.conversation = [];
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupChat();
        this.setupVoice();
        this.setupVideo();
        this.setupSettingsButton(); // NOVO: configurar botão de settings
        this.updateModelStatus();

        // Preencher campos de configuração
        this.loadSettingsToForm();

        // Verificar se tem API key
        if (!this.settings.geminiKey && !this.settings.openaiKey) {
            setTimeout(() => this.showNotification('⚠️ Configure sua API Key nas configurações!', 'warning'), 1000);
        }
    }

    // NOVO: Configurar botão de settings explicitamente
    setupSettingsButton() {
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSettings();
            });
            console.log('✅ Botão de configurações configurado');
        } else {
            console.error('❌ Botão .settings-btn não encontrado');
        }

        // Fechar modal ao clicar fora
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.toggleSettings();
                }
            });
        }
    }

    // NOVO: Função toggleSettings dentro da classe
    toggleSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            const isActive = modal.classList.contains('active');
            if (isActive) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            } else {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                // Preencher campos ao abrir
                this.loadSettingsToForm();
            }
            console.log('Modal de configurações:', isActive ? 'fechado' : 'aberto');
        }
    }

    // NOVO: Carregar settings para o formulário
    loadSettingsToForm() {
        const geminiInput = document.getElementById('gemini-key');
        const openaiInput = document.getElementById('openai-key');

        if (geminiInput) geminiInput.value = this.settings.geminiKey || '';
        if (openaiInput) openaiInput.value = this.settings.openaiKey || '';
    }

    // ==================== NAVEGAÇÃO ====================
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

        document.getElementById('ai-model').addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.updateModelStatus();
        });
    }

    updateModelStatus() {
        const hasKey = this.currentModel === 'gemini' ? this.settings.geminiKey : this.settings.openaiKey;
        const status = hasKey ? '🟢 Pronto' : '⚠️ Sem API Key';
        document.getElementById('model-status').textContent = status;
    }

    // ==================== CHAT ====================
    setupChat() {
        const input = document.getElementById('chat-input');
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

        // Verificar API key
        const apiKey = this.currentModel === 'gemini' ? this.settings.geminiKey : this.settings.openaiKey;
        if (!apiKey) {
            this.showNotification('❌ Configure a API Key primeiro!', 'error');
            this.toggleSettings(); // Abre configurações automaticamente
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
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: message }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Erro na API Gemini');
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
    }

    async callOpenAI(message, apiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Você é o IA-ACMULLER, assistente brasileiro útil.' },
                    { role: 'user', content: message }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Erro na API OpenAI');
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Sem resposta';
    }

    addMessage(text, sender) {
        const container = document.getElementById('chat-messages');
        // Remover mensagem de boas-vindas se existir
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

    // ==================== CÓDIGO ====================
    runCode() {
        const code = document.getElementById('code-editor').value;
        const output = document.getElementById('output-content');
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
        const code = document.getElementById('code-editor').value;
        const apiKey = this.settings.geminiKey || this.settings.openaiKey;
        if (!apiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            this.toggleSettings();
            return;
        }

        try {
            const prompt = 'Explique este código:\n\n' + code;
            const response = this.currentModel === 'gemini' 
                ? await this.callGemini(prompt, apiKey)
                : await this.callOpenAI(prompt, apiKey);
            alert('💡 Explicação:\n\n' + response);
        } catch (error) {
            alert('❌ Erro: ' + error.message);
        }
    }

    // ==================== VOZ ====================
    setupVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            document.getElementById('voice-status').textContent = '❌ Navegador não suporta voz';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
            document.getElementById('mic-btn').classList.add('recording');
            document.getElementById('voice-status').textContent = '🎙️ Ouvindo...';
        };

        this.recognition.onend = () => {
            document.getElementById('mic-btn').classList.remove('recording');
            document.getElementById('voice-status').textContent = 'Clique para falar';
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('voice-transcript').textContent = transcript;

            if (event.results[0].isFinal) {
                this.processVoice(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Erro de voz:', event.error);
            document.getElementById('voice-status').textContent = '❌ Erro: ' + event.error;
        };
    }

    toggleVoice() {
        if (!this.recognition) {
            this.showNotification('Seu navegador não suporta reconhecimento de voz', 'error');
            return;
        }

        if (document.getElementById('mic-btn').classList.contains('recording')) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async processVoice(text) {
        const apiKey = this.settings.geminiKey || this.settings.openaiKey;
        if (!apiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            return;
        }

        document.getElementById('voice-response').innerHTML = '<div class="loading"></div> Processando...';

        try {
            const response = this.currentModel === 'gemini'
                ? await this.callGemini(text, apiKey)
                : await this.callOpenAI(text, apiKey);
            document.getElementById('voice-response').textContent = response;

            // Falar resposta
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.lang = 'pt-BR';
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            document.getElementById('voice-response').textContent = 'Erro: ' + error.message;
        }
    }

    // ==================== VÍDEO ====================
    setupVideo() {
        const dropZone = document.getElementById('video-drop-zone');
        const fileInput = document.getElementById('video-input');

        if (dropZone) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => { 
                e.preventDefault(); 
                dropZone.classList.add('dragover'); 
            });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) this.handleVideo(e.dataTransfer.files[0]);
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => { 
                if (e.target.files.length) this.handleVideo(e.target.files[0]); 
            });
        }
    }

    handleVideo(file) {
        const url = URL.createObjectURL(file);
        document.getElementById('video-player').src = url;
        document.getElementById('video-drop-zone').style.display = 'none';
        document.getElementById('video-preview').style.display = 'grid';
    }

    async analyzeVideo() {
        const apiKey = this.settings.geminiKey || this.settings.openaiKey;
        if (!apiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            return;
        }

        document.getElementById('video-results').innerHTML = '<div class="loading"></div> Analisando...';

        setTimeout(() => {
            document.getElementById('video-results').innerHTML = 
                '<p>📸 Vídeo carregado!</p><p>Funcionalidade completa em breve.</p>';
        }, 1000);
    }

    // ==================== AGENTE ====================
    async startAgent() {
        const goal = document.getElementById('agent-goal').value;
        if (!goal) {
            this.showNotification('Digite um objetivo primeiro!', 'error');
            return;
        }

        const apiKey = this.settings.geminiKey || this.settings.openaiKey;
        if (!apiKey) {
            this.showNotification('Configure API Key primeiro!', 'error');
            this.toggleSettings();
            return;
        }

        document.querySelector('.agent-setup').style.display = 'none';
        document.getElementById('agent-execution').style.display = 'block';
        document.getElementById('agent-steps').innerHTML = '<div class="loading"></div> Executando...';

        try {
            const response = this.currentModel === 'gemini'
                ? await this.callGemini('Execute como agente: ' + goal, apiKey)
                : await this.callOpenAI('Execute como agente: ' + goal, apiKey);

            document.getElementById('agent-steps').innerHTML = '';
            document.getElementById('agent-result').innerHTML = '<h4>✅ Resultado</h4><div>' + this.formatMessage(response) + '</div>';
        } catch (error) {
            document.getElementById('agent-steps').innerHTML = '❌ Erro: ' + error.message;
        }
    }

    // ==================== CONFIGURAÇÕES ====================
    loadSettings() {
        try {
            const saved = localStorage.getItem('acmuller-settings');
            return saved ? JSON.parse(saved) : { geminiKey: '', openaiKey: '' };
        } catch (e) {
            return { geminiKey: '', openaiKey: '' };
        }
    }

    saveSettings() {
        const geminiKey = document.getElementById('gemini-key')?.value || '';
        const openaiKey = document.getElementById('openai-key')?.value || '';

        this.settings = { geminiKey, openaiKey };
        localStorage.setItem('acmuller-settings', JSON.stringify(this.settings));

        this.toggleSettings();
        this.updateModelStatus();
        this.showNotification('✅ Configurações salvas!', 'success');

        console.log('Settings saved:', { geminiKey: geminiKey ? '***' : '', openaiKey: openaiKey ? '***' : '' });
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
        document.getElementById('chat-messages').innerHTML = '';
        this.conversation = [];
    }

    exportConversation() {
        const data = { date: new Date().toISOString(), conversation: this.conversation };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acmuller-chat.json';
        a.click();
    }
}

// ==================== FUNÇÕES GLOBAIS ====================
const app = new ACMullerAI();

// Garantir que as funções globais existam
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

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('settings-modal');
        if (modal && modal.classList.contains('active')) {
            toggleSettings();
        }
    }
});

console.log('✅ IA-ACMULLER carregado com sucesso!');
