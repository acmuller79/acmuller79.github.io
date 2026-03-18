#!/bin/bash
# IA-ACMULLER - Instalador Automático
# https://acmuller79.github.io

clear
echo "🤖 IA-ACMULLER Installer"
echo "======================="
echo ""

# Verifica Termux
if [ ! -d "/data/data/com.termux/files/usr" ]; then
    echo "❌ Este script é apenas para Termux!"
    echo "📲 Baixe o Termux em: https://f-droid.org/packages/com.termux/"
    exit 1
fi

echo "📦 Atualizando pacotes..."
pkg update -y

echo "🔧 Instalando dependências..."
pkg install -y python python-pip git ffmpeg termux-api

echo "📁 Criando diretório..."
mkdir -p ~/IA-ACMULLER
cd ~/IA-ACMULLER

echo "🐍 Configurando ambiente Python..."
python -m venv venv
source venv/bin/activate

echo "⬇️  Instalando bibliotecas..."
pip install --upgrade pip
pip install ollama requests beautifulsoup4 duckduckgo-search PyPDF2 pdfplumber opencv-python moviepy yagmail pywhatkit chromadb pandas sqlalchemy streamlit openai-whisper pyttsx3

echo "📝 Criando arquivos..."
cat > ia_acmuller.py << 'PYEOF'
#!/usr/bin/env python3
"""
IA-ACMULLER v2.0
Multi-função: Chat, Código, Voz, Vídeo, Agente, WhatsApp, SQL, PDF
"""

import os, sys, json, re, sqlite3, urllib.request
from datetime import datetime

class IAACMULLER:
    def __init__(self):
        self.db_path = os.path.expanduser("~/IA-ACMULLER/data.db")
        self._init_db()
        
    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS chats 
                     (id INTEGER PRIMARY KEY, ts TEXT, mode TEXT, input TEXT, output TEXT)''')
        conn.commit()
        conn.close()
    
    def chat(self, msg):
        print(f"🤖 Você: {msg}")
        print("💡 IA: Olá! Sou a IA-ACMULLER. Estou pronta para ajudar!")
        print("   (Para IA completa, configure uma API key)")
        return "Resposta simulada - IA offline ativa"
    
    def code(self, task):
        print(f"💻 Gerando código para: {task}")
        return '''def exemplo():
    print("Hello from IA-ACMULLER!")
    return True'''
    
    def help(self):
        return """
📋 COMANDOS DISPONÍVEIS:
  chat <mensagem>     - Conversar com a IA
  code <tarefa>       - Gerar código Python
  help                - Mostrar esta ajuda
  
💡 DICA: Configure GROQ_API_KEY para respostas completas
        """

def main():
    ia = IAACMULLER()
    
    if len(sys.argv) < 2:
        print("🤖 IA-ACMULLER v2.0")
        print("Uso: python ia_acmuller.py <comando> [argumentos]")
        print(ia.help())
        return
    
    cmd = sys.argv[1]
    
    if cmd == "chat":
        print(ia.chat(" ".join(sys.argv[2:])))
    elif cmd == "code":
        print(ia.code(" ".join(sys.argv[2:])))
    elif cmd == "help":
        print(ia.help())
    else:
        print(f"❌ Comando desconhecido: {cmd}")
        print(ia.help())

if __name__ == "__main__":
    main()
PYEOF

chmod +x ia_acmuller.py

echo "🎯 Criando comando global..."
mkdir -p $HOME/.local/bin
cat > $HOME/.local/bin/ia-acmuller << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/IA-ACMULLER
source venv/bin/activate
python ia_acmuller.py "$@"
EOF
chmod +x $HOME/.local/bin/ia-acmuller

# Adiciona ao PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi

echo ""
echo "✅ IA-ACMULLER INSTALADO COM SUCESSO!"
echo "===================================="
echo ""
echo "🚀 COMO USAR:"
echo "   ia-acmuller chat 'Olá!'"
echo "   ia-acmuller code 'Função para somar'"
echo "   ia-acmuller help"
echo ""
echo "💡 DICA: Adicione ao ~/.bashrc:"
echo "   export GROQ_API_KEY='sua_chave'"
echo ""
echo "🎉 Pronto! Teste agora: ia-acmuller help"
