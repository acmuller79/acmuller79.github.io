# 🤖 IA-ACMULLER Web

Inteligência Artificial 100% gratuita e multi-modelo rodando na web.

## ✨ Funcionalidades

- 💬 **Chat Inteligente** - Converse com 4 modelos de IA diferentes
- 💻 **Editor de Código** - Gere, execute e explique código
- 🎙️ **Comandos de Voz** - Fale com a IA (Web Speech API)
- 📹 **Análise de Vídeo** - Extraia informações de vídeos
- 🤖 **Agente Autônomo** - Automatize tarefas complexas

## 🧠 Modelos de IA Suportados

| Modelo | Provedor | Tipo |
|--------|----------|------|
| Gemini 1.5 Flash | Google | Gratuito (limite generoso) |
| GPT-3.5/GPT-4 | OpenAI | Free tier disponível |
| Claude 3 Haiku | Anthropic | Free tier disponível |
| Llama/Mistral | Ollama | 100% local (opcional) |

## 🚀 Deploy

### 1. Clone o repositório
```bash
git clone https://github.com/acmuller79/acmuller79.github.io.git
cd acmuller79.github.io
```

### 2. Instale o Vercel CLI
```bash
npm i -g vercel
```

### 3. Configure as API Keys (opcional)
```bash
# Se quiser usar backend próprio
vercel env add GEMINI_API_KEY
vercel env add OPENAI_API_KEY
vercel env add CLAUDE_API_KEY
```

Ou configure diretamente no app em **Configurações** ⚙️

### 4. Deploy
```bash
vercel --prod
```

## 🔑 Obter API Keys Gratuitas

### Google Gemini (Recomendado - Mais fácil)
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Clique em "Create API Key"
3. Copie a chave e cole no app

### OpenAI
1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie conta (créditos gratuitos disponíveis)
3. Gere uma API key

### Anthropic Claude
1. Acesse [Anthropic Console](https://console.anthropic.com/)
2. Cadastre-se
3. Obtenha a API key na seção de settings

## 💻 Uso Local (Ollama)

Para rodar 100% local sem depender de APIs:

```bash
# Instale o Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixe um modelo
ollama pull llama3

# Inicie o servidor
ollama serve
```

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Backend**: Vercel Serverless Functions (Node.js)
- **APIs**: Google Gemini, OpenAI, Anthropic
- **Hospedagem**: Vercel (gratuito)

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari (voz limitada)
- ✅ Mobile (iOS/Android)

## 🤝 Contribuir

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'Adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**⭐ Star no projeto se foi útil!**

Feito com ❤️ por [ACMuller79](https://github.com/acmuller79)
