// IA-ACMULLER - Versao com Modelo Correto
var config={geminiKey:""};

function carregarConfig(){
    try{
        var s=localStorage.getItem("acmuller-settings");
        if(s)config=JSON.parse(s);
    }catch(e){}
}

function salvarConfig(){
    config.geminiKey=document.getElementById("gemini-key").value.trim();
    localStorage.setItem("acmuller-settings",JSON.stringify(config));
    fecharModal();
    atualizarStatus();
    alert("Configuracoes salvas!");
}

function abrirModal(){
    document.getElementById("settings-modal").style.display="flex";
    document.getElementById("gemini-key").value=config.geminiKey;
}

function fecharModal(){
    document.getElementById("settings-modal").style.display="none";
}

function atualizarStatus(){
    document.getElementById("model-status").textContent=config.geminiKey?"Pronto":"Configure API Key";
}

function enviarMensagem(){
    var input=document.getElementById("chat-input");
    var msg=input.value.trim();
    if(!msg)return;

    if(!config.geminiKey){
        alert("Configure a API Key primeiro!");
        abrirModal();
        return;
    }

    adicionarMensagem(msg,"user");
    input.value="";

    var typingId=mostrarDigitando();

    // MODELO CORRETO: gemini-1.5-flash-8b (funciona com API key gratuita)
    var url="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key="+config.geminiKey;

    fetch(url,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:msg}]}]})
    })
    .then(function(r){
        if(!r.ok){
            return r.json().then(function(e){throw new Error(e.error?e.error.message:"Erro "+r.status);});
        }
        return r.json();
    })
    .then(function(d){
        removerDigitando(typingId);
        var texto=d.candidates&&d.candidates[0]&&d.candidates[0].content&&d.candidates[0].content.parts&&d.candidates[0].content.parts[0]?d.candidates[0].content.parts[0].text:"Sem resposta";
        adicionarMensagem(texto,"ai");
    })
    .catch(function(e){
        removerDigitando(typingId);
        // Se der erro 404, tenta com gemini-pro
        if(e.message.includes("404")||e.message.includes("not found")){
            adicionarMensagem("Erro: Modelo nao encontrado. Tente recriar a API key em https://makersuite.google.com/app/apikey","ai");
        }else{
            adicionarMensagem("Erro: "+e.message,"ai");
        }
    });
}

function adicionarMensagem(texto,tipo){
    var container=document.getElementById("chat-messages");
    var div=document.createElement("div");
    div.className="message "+tipo;
    div.innerHTML='<div class="message-avatar">'+(tipo==="user"?"👤":"🤖")+'</div><div class="message-content">'+texto.replace(/\n/g,"<br>")+'</div>';
    container.appendChild(div);
    container.scrollTop=container.scrollHeight;
}

function mostrarDigitando(){
    var container=document.getElementById("chat-messages");
    var id="typing-"+Date.now();
    var div=document.createElement("div");
    div.id=id;
    div.className="message ai";
    div.innerHTML='<div class="message-avatar">🤖</div><div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    container.appendChild(div);
    container.scrollTop=container.scrollHeight;
    return id;
}

function removerDigitando(id){
    var el=document.getElementById(id);
    if(el)el.remove();
}

function mostrarSecao(secao){
    document.querySelectorAll(".section").forEach(function(s){s.classList.remove("active");});
    document.querySelectorAll(".nav-item").forEach(function(n){n.classList.remove("active");});
    document.getElementById(secao+"-section").classList.add("active");
    document.querySelector('[data-section="'+secao+'"]').classList.add("active");
    var titulos={chat:"Chat Inteligente",code:"Editor de Codigo",voice:"Comandos de Voz",video:"Analise de Video",agent:"Agente Autonomo"};
    document.getElementById("section-title").textContent=titulos[secao];
}

function executarCodigo(){
    var codigo=document.getElementById("code-editor").value;
    var output=document.getElementById("output-content");
    try{
        var logs=[];
        var originalLog=console.log;
        console.log=function(){logs.push(Array.prototype.slice.call(arguments).join(" "));};        
        var resultado=eval(codigo);
        console.log=originalLog;
        output.textContent=logs.join("\n")||String(resultado)||"Executado";
    }catch(e){
        output.textContent="Erro: "+e.message;
    }
}

function limparChat(){
    document.getElementById("chat-messages").innerHTML="";
}

function exportarConversa(){
    var dados={data:new Date().toISOString(),config:config};
    var blob=new Blob([JSON.stringify(dados,null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url;
    a.download="acmuller-chat.json";
    a.click();
}

document.addEventListener("DOMContentLoaded",function(){
    carregarConfig();
    atualizarStatus();

    document.getElementById("chat-input").addEventListener("keydown",function(e){
        if(e.key==="Enter"&&!e.shiftKey){
            e.preventDefault();
            enviarMensagem();
        }
    });

    document.querySelectorAll(".nav-item").forEach(function(item){
        item.addEventListener("click",function(){
            mostrarSecao(this.dataset.section);
        });
    });

    console.log("IA-ACMULLER carregado! Modelo: gemini-1.5-flash-8b");
});
