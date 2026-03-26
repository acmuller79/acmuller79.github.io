// IA-ACMULLER Web - App Principal
// Integra Gemini, OpenAI, Claude e Ollama

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
        this.setupCode();
        this.setupAgent();
        this.setupSettings();
        this.updateModelStatus();
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

                // Atualizar navegação
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Mostrar seção
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(\`\${section}-section\`).classList.add('active');

                // Atualizar título
                document.getElementById('section-title').textContent = titles[section];
            });
        });

        // Seletor de modelo
        document.getElementById('ai-model').addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.updateModelStatus();
        });
    }

    updateModelStatus() {
        const modelNames = {
            'gemini': '🧠 Google Gemini',
            'openai': '🤖 OpenAI GPT',
            'claude': '📝 Anthropic Claude',
            'ollama': '🏠 Ollama Local',
            'auto': '⚡ Auto'
        };
        document.getElementById('model-status').textContent = 
            \`🟢 \${modelNames[this.currentModel]} ativo\`;
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

        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        // Mostrar indicador de digitação
        const typingId = this.showTyping();

        try {
            const response = await this.callAI(message);
            this.removeTyping(typingId);
            this.addMessage(response, 'ai');
        } catch (error) {
            this.removeTyping(typingId);
            this.addMessage(\`❌ Erro: \${error.message}\`, 'ai');
        }
    }

    addMessage(text, sender) {
        const container = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = \`message \${sender}\`;

        const avatar = sender === 'user' ? '👤' : '🤖';
        const formattedText = this.formatMessage(text);

        messageDiv.innerHTML = \`
            <div class="message-avatar">\${avatar}</div>
            <div class="message-content">\${formattedText}</div>
        \`;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;

        // Destacar código
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    formatMessage(text) {
        // Converter markdown básico
        return text
            .replace(/```(\w+)?
([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/
/g, '<br>');
    }

    showTyping() {
        const container = document.getElementById('chat-messages');
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.className = 'message ai';
        typingDiv.innerHTML = \`
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        \`;
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
        return id;
    }

    removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // ==================== API INTEGRAÇÃO ====================
    async callAI(message, options = {}) {
        const model = options.model || this.currentModel;

        // Se for "auto", escolher o melhor disponível
        if (model === 'auto') {
            return this.callAutoAI(message, options);
        }

        const endpoints = {
            'gemini': '/api/gemini',
            'openai': '/api/openai',
            'claude': '/api/claude',
            'ollama': '/api/ollama'
        };

        try {
            const response = await fetch(endpoints[model], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    history: this.conversation,
                    apiKey: this.settings[\`\${model}Key\`],
                    ...options
                })
            });

            if (!response.ok) throw new Error(\`Erro \${response.status}\`);

            const data = await response.json();

            // Salvar na conversa
            this.conversation.push({ role: 'user', content: message });
            this.conversation.push({ role: 'assistant', content: data.response });

            return data.response;
        } catch (error) {
            console.error(\`Erro \${model}:\`, error);
            throw error;
        }
    }

    async callAutoAI(message, options) {
        // Tentar na ordem: Gemini -> OpenAI -> Claude -> Ollama
        const models = ['gemini', 'openai', 'claude', 'ollama'];

        for (const model of models) {
            if (this.settings[\`\${model}Key\`] || model === 'ollama') {
                try {
                    return await this.callAI(message, { ...options, model });
                } catch (e) {
                    console.log(\`\${model} falhou, tentando próximo...\`);
                    continue;
                }
            }
        }

        throw new Error('Nenhum modelo de IA disponível. Configure as API keys nas configurações.');
    }

    // ==================== CÓDIGO ====================
    setupCode() {
        // Editor já inicializado no HTML
    }

    async runCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        const output = document.getElementById('output-content');

        output.textContent = '⏳ Executando...';

        try {
            // Para JavaScript, executar no navegador
            if (language === 'javascript') {
                const originalLog = console.log;
                let logs = [];
                console.log = (...args) => logs.push(args.join(' '));

                try {
                    const result = eval(code);
                    console.log = originalLog;
                    output.textContent = logs.join('\n') || String(result) || '✅ Executado com sucesso';
                } catch (e) {
                    console.log = originalLog;
                    output.textContent = '❌ ' + e.message;
                }
            } else {
                // Para outras linguagens, usar IA para "simular" ou explicar
                const prompt = \`Analise este código \${language} e mostre o output esperado:\n\n\${code}\`;
                const response = await this.callAI(prompt);
                output.textContent = response;
            }
        } catch (error) {
            output.textContent = '❌ Erro: ' + error.message;
        }
    }

    async explainCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;

        const prompt = \`Explique detalhadamente este código \${language}:\n\n\${code}\`;

        try {
            const response = await this.callAI(prompt);
            document.getElementById('code-chat').innerHTML = \`<div class="ai-response">\${this.formatMessage(response)}</div>\`;
        } catch (error) {
            document.getElementById('code-chat').innerHTML = \`❌ Erro: \${error.message}\`;
        }
    }

    async askCodeAI() {
        const question = document.getElementById('code-question').value;
        const code = document.getElementById('code-editor').value;

        if (!question) return;

        const prompt = \`Código atual:\n\${code}\n\nPergunta: \${question}\n\nPor favor, forneça o código completo modificado.\`;

        try {
            const response = await this.callAI(prompt);
            document.getElementById('code-chat').innerHTML += \`
                <div class="user-question" style="margin: 8px 0; color: var(--text-muted);">👤 \${question}</div>
                <div class="ai-response" style="margin: 8px 0;">\${this.formatMessage(response)}</div>
            \`;
            document.getElementById('code-question').value = '';
        } catch (error) {
            document.getElementById('code-chat').innerHTML += \`❌ Erro: \${error.message}\`;
        }
    }

    formatCode() {
        const editor = document.getElementById('code-editor');
        const code = editor.value;
        // Indentação básica
        const formatted = code.replace(/^\s+/gm, (match) => match.replace(/  /g, '\t'));
        editor.value = formatted;
    }

    // ==================== VOZ ====================
    setupVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            document.getElementById('voice-status').textContent = '❌ API de voz não suportada neste navegador';
            document.getElementById('mic-btn').disabled = true;
            return;
        }

        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.lang = 'pt-BR';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
            document.getElementById('mic-btn').classList.add('recording');
            document.getElementById('voice-status').textContent = '🎙️ Ouvindo...';
            this.startVisualizer();
        };

        this.recognition.onend = () => {
            document.getElementById('mic-btn').classList.remove('recording');
            document.getElementById('voice-status').textContent = 'Clique para falar novamente';
            this.stopVisualizer();
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                document.getElementById('voice-transcript').textContent = interimTranscript;
            }

            if (finalTranscript) {
                document.getElementById('voice-transcript').textContent = finalTranscript;

                if (document.getElementById('auto-send').checked) {
                    this.processVoiceCommand(finalTranscript);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Erro de reconhecimento:', event.error);
            document.getElementById('voice-status').textContent = '❌ Erro: ' + event.error;
        };
    }

    toggleVoice() {
        if (document.getElementById('mic-btn').classList.contains('recording')) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async processVoiceCommand(transcript) {
        document.getElementById('voice-response').innerHTML = '<div class="loading"></div> Processando...';

        try {
            const response = await this.callAI(transcript);
            document.getElementById('voice-response').innerHTML = this.formatMessage(response);

            // Ler resposta em voz alta
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.lang = 'pt-BR';
                utterance.rate = 1.2;
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            document.getElementById('voice-response').textContent = '❌ Erro: ' + error.message;
        }
    }

    startVisualizer() {
        const canvas = document.getElementById('audio-visualizer');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        this.visualizerActive = true;

        const draw = () => {
            if (!this.visualizerActive) return;

            ctx.fillStyle = '#0f0f0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const bars = 50;
            const barWidth = canvas.width / bars;

            for (let i = 0; i < bars; i++) {
                const height = Math.random() * canvas.height * 0.8;
                const hue = (i / bars) * 120 + 150; // Verde a azul
                ctx.fillStyle = \`hsl(\${hue}, 70%, 50%)\`;
                ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
            }

            requestAnimationFrame(draw);
        };

        draw();
    }

    stopVisualizer() {
        this.visualizerActive = false;
        const canvas = document.getElementById('audio-visualizer');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ==================== VÍDEO ====================
    setupVideo() {
        const dropZone = document.getElementById('video-drop-zone');
        const fileInput = document.getElementById('video-input');

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length) this.handleVideoFile(files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleVideoFile(e.target.files[0]);
        });
    }

    handleVideoFile(file) {
        if (!file.type.startsWith('video/')) {
            alert('Por favor, selecione um arquivo de vídeo válido.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('O vídeo deve ter no máximo 50MB.');
            return;
        }

        const url = URL.createObjectURL(file);
        const video = document.getElementById('video-player');
        video.src = url;

        document.getElementById('video-drop-zone').style.display = 'none';
        document.getElementById('video-preview').style.display = 'grid';
    }

    async analyzeVideo(type) {
        const video = document.getElementById('video-player');
        const results = document.getElementById('video-results');

        results.innerHTML = '<div class="loading"></div> Analisando vídeo...';

        try {
            let analysis = '';

            if (type === 'frames' || type === 'full') {
                // Capturar frames do vídeo
                const frames = await this.extractFrames(video);
                analysis += \`<strong>📸 Frames capturados:</strong> \${frames.length}\n\n\`;
            }

            if (type === 'audio' || type === 'full') {
                analysis += '<strong>🎵 Áudio:</strong> Análise de transcrição disponível via API de voz\n\n';
            }

            // Usar IA para descrever o conteúdo
            const prompt = \`Descreva detalhadamente o que provavelmente contém neste vídeo baseado na análise:\n\${analysis}\n\nForneça insights sobre o conteúdo visual e contexto.\`;

            const aiResponse = await this.callAI(prompt);
            results.innerHTML = this.formatMessage(aiResponse);

        } catch (error) {
            results.innerHTML = '❌ Erro na análise: ' + error.message;
        }
    }

    async extractFrames(video) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames = [];

        canvas.width = 320;
        canvas.height = 180;

        const duration = video.duration;
        const numFrames = 5;

        for (let i = 0; i < numFrames; i++) {
            video.currentTime = (duration / numFrames) * i;
            await new Promise(resolve => {
                video.addEventListener('seeked', resolve, { once: true });
            });

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.5));
        }

        return frames;
    }

    // ==================== AGENTE ====================
    setupAgent() {
        // Configurações já no HTML
    }

    async startAgent() {
        const goal = document.getElementById('agent-goal').value;
        const maxSteps = parseInt(document.getElementById('max-steps').value);
        const mode = document.getElementById('agent-mode').value;

        if (!goal) {
            alert('Por favor, defina um objetivo para o agente.');
            return;
        }

        document.querySelector('.agent-setup').style.display = 'none';
        document.getElementById('agent-execution').style.display = 'block';

        const stepsContainer = document.getElementById('agent-steps');
        stepsContainer.innerHTML = '';

        try {
            // Passo 1: Planejamento
            this.addAgentStep(1, 'Planejamento', 'Criando plano de ação...');

            const planPrompt = \`Como agente autônomo, crie um plano de \${maxSteps} passos para: \${goal}\`;
            const plan = await this.callAI(planPrompt);

            this.updateAgentStep(1, 'Plano criado', 'completed');

            // Executar passos
            let context = '';

            for (let i = 2; i <= maxSteps + 1; i++) {
                this.addAgentStep(i, \`Execução \${i-1}\`, 'Processando...');

                const stepPrompt = \`Execute o passo \${i-1} do plano: "\${goal}"\n\nContexto anterior:\n\${context}\n\nForneça resultado detalhado.\`;

                const result = await this.callAI(stepPrompt);
                context += "\n\nPasso \${i-1}:" + result;

                this.updateAgentStep(i, result.substring(0, 100) + '...', 'completed');
            }

            // Resultado final
            const finalPrompt = \`Baseado em todo o contexto da execução, forneça um resumo final e conclusão para: \${goal}\n\n\${context}\`;
            const finalResult = await this.callAI(finalPrompt);

            document.getElementById('agent-result').innerHTML = \`
                <h4>✅ Resultado Final</h4>
                <div>\${this.formatMessage(finalResult)}</div>
            \`;

        } catch (error) {
            stepsContainer.innerHTML += \`<div class="agent-step error">❌ Erro: \${error.message}</div>\`;
        }
    }

    addAgentStep(number, title, status) {
        const container = document.getElementById('agent-steps');
        const step = document.createElement('div');
        step.className = 'agent-step';
        step.id = \`step-\${number}\`;
        step.innerHTML = \`
            <div class="step-number">\${number}</div>
            <div class="step-content">
                <div class="step-title">\${title}</div>
                <div class="step-status">\${status}</div>
            </div>
        \`;
        container.appendChild(step);
    }

    updateAgentStep(number, status, state) {
        const step = document.getElementById(\`step-\${number}\`);
        if (step) {
            step.querySelector('.step-status').textContent = status;
            if (state === 'completed') {
                step.style.borderLeft = '4px solid var(--success)';
            }
        }
    }

    // ==================== CONFIGURAÇÕES ====================
    setupSettings() {
        // Carregar configurações salvas
        const saved = localStorage.getItem('acmuller-settings');
        if (saved) {
            this.settings = JSON.parse(saved);
            this.applySettings();
        }
    }

    loadSettings() {
        const defaultSettings = {
            geminiKey: '',
            openaiKey: '',
            claudeKey: '',
            ollamaUrl: 'http://localhost:11434',
            theme: 'dark'
        };

        const saved = localStorage.getItem('acmuller-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    applySettings() {
        document.getElementById('gemini-key').value = this.settings.geminiKey || '';
        document.getElementById('openai-key').value = this.settings.openaiKey || '';
        document.getElementById('claude-key').value = this.settings.claudeKey || '';
        document.getElementById('ollama-url').value = this.settings.ollamaUrl || '';
        document.getElementById('theme-select').value = this.settings.theme || 'dark';
    }

    saveSettings() {
        this.settings = {
            geminiKey: document.getElementById('gemini-key').value,
            openaiKey: document.getElementById('openai-key').value,
            claudeKey: document.getElementById('claude-key').value,
            ollamaUrl: document.getElementById('ollama-url').value,
            theme: document.getElementById('theme-select').value
        };

        localStorage.setItem('acmuller-settings', JSON.stringify(this.settings));
        toggleSettings();

        // Aplicar tema
        if (this.settings.theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }

        alert('✅ Configurações salvas com sucesso!');
    }

    // ==================== UTILITÁRIOS ====================
    clearCurrent() {
        const activeSection = document.querySelector('.section.active').id;

        if (activeSection === 'chat-section') {
            document.getElementById('chat-messages').innerHTML = \`
                <div class="welcome-message">
                    <h2>👋 Conversa limpa!</h2>
                    <p>Comece uma nova conversa com a IA.</p>
                </div>
            \`;
            this.conversation = [];
        } else if (activeSection === 'code-section') {
            document.getElementById('code-editor').value = '';
            document.getElementById('output-content').textContent = '// Console limpo';
        }
    }

    exportConversation() {
        const data = {
            date: new Date().toISOString(),
            model: this.currentModel,
            conversation: this.conversation
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`acmuller-chat-\${new Date().toISOString().slice(0,10)}.json\`;
        a.click();
        URL.revokeObjectURL(url);
    }

    attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                const chatInput = document.getElementById('chat-input');
                chatInput.value += "\n\n[Arquivo: \${file.name}]\n\${text.substring(0, 1000)}\`;
            }
        };
        input.click();
    }
}

// ==================== FUNÇÕES GLOBAIS ====================
function sendMessage() {
    app.sendMessage();
}

function sendQuickMessage(text) {
    document.getElementById('chat-input').value = text;
    app.sendMessage();
}

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('active');
}

function saveSettings() {
    app.saveSettings();
}

function clearCurrent() {
    app.clearCurrent();
}

function exportConversation() {
    app.exportConversation();
}

function attachFile() {
    app.attachFile();
}

function runCode() {
    app.runCode();
}

function formatCode() {
    app.formatCode();
}

function explainCode() {
    app.explainCode();
}

function askCodeAI() {
    app.askCodeAI();
}

function toggleVoice() {
    app.toggleVoice();
}

function analyzeVideo(type) {
    app.analyzeVideo(type);
}

function startAgent() {
    app.startAgent();
}

// Inicializar app
const app = new ACMullerAI();

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + , para configurações
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        toggleSettings();
    }

    // Esc para fechar modal
    if (e.key === 'Escape') {
        document.getElementById('settings-modal').classList.remove('active');
    }
});