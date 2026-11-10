(function(){
  const key=document.body.dataset.form, F=window.FORMS[key], root=document.getElementById("app");
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ans={}, hist=[];
  // pós: preenche o código salvo neste aparelho (do formulário inicial)
  let saved=""; try{saved=localStorage.getItem("oficina_codigo")||""}catch(_){}
  if(key==="pos"&&saved) ans.codigo=saved;
  let steps=[{type:"intro"}].concat(F.steps), i=0;
  const shell=inner=>`<div class="brand"><i></i>UEPA · Semana Acadêmica</div><div class="panel fade">${inner}</div>`;
  const prog=()=>{const n=steps.length-1;return `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${i}"><b style="width:${i/n*100}%"></b></div><div class="count">${i} de ${n}</div>`};
  const nav=(canBack,label,extra)=>`<div class="nav">${canBack?`<button type="button" class="ghost" id="back">Voltar</button>`:""}${extra||""}<button type="button" class="go" id="next">${label||"Continuar"}</button></div>`;

  function show(){
    const s=steps[i]; let h="";
    if(s.type==="intro"){
      h=`<h1>${esc(F.title)}</h1><p class="sub">${esc(F.subtitle)}</p><p>${esc(F.intro)}</p>
      <p class="hint">Ao continuar, você concorda em participar.</p><div class="nav"><button type="button" class="go" id="next">Começar</button></div>`;
    } else if(s.type==="text"){
      h=prog()+`<h2>${esc(s.title)}</h2><p class="help">${esc(s.help||"")}</p>
      <input id="in" type="text" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC12" value="${esc(ans[s.id]||"")}">
      <p class="err" id="err" role="alert"></p>${nav(i>1)}`;
    } else if(s.type==="radio"){
      h=prog()+(s.tag?`<span class="tag">${esc(s.tag)}</span>`:"")+`<h2>${esc(s.title)}</h2><div class="opts" role="radiogroup">`+
        s.options.map(o=>`<label class="opt"><input type="radio" name="r" value="${esc(o)}"${ans[s.id]===o?" checked":""}><span>${esc(o)}</span></label>`).join("")+`</div>${nav(i>1,"Continuar")}`;
    } else if(s.type==="likert"){
      h=prog()+`<h2>${esc(s.title)}</h2><p class="hint">${esc(s.hint)}</p>`+s.items.map(it=>`<div class="row"><p>${esc(it[1])}</p><div class="scale">`+
        [1,2,3,4,5].map(v=>`<label class="opt"><input type="radio" name="${it[0]}" value="${v}"${ans[it[0]]==v?" checked":""}><span>${v}</span></label>`).join("")+
        `</div><div class="ends"><span>${esc(s.ends[0])}</span><span>${esc(s.ends[1])}</span></div></div>`).join("")+`${nav(true)}`;
    } else if(s.type==="textarea"){
      h=prog()+`<h2>${esc(s.title)}</h2><textarea id="in" rows="4" placeholder="${esc(s.placeholder||"")}">${esc(ans[s.id]||"")}</textarea>
      ${nav(true,i===steps.length-1?"Enviar":"Continuar")}`;
    }
    root.innerHTML=shell(h); bind(s);
    const f=root.querySelector("#in"); if(f&&s.type==="text") f.focus();
  }

  function go(d){ if(d>0){hist.push(i);i++} else {i=hist.pop()??Math.max(0,i-1)} 
    // pula o código no pós se já veio preenchido
    if(i>=steps.length) return finish();
    if(key==="pos"&&steps[i].id==="codigo"&&ans.codigo&&d>0){hist.push(i);i++} show(); window.scrollTo(0,0); }

  function bind(s){
    const next=document.getElementById("next"), back=document.getElementById("back");
    if(back) back.onclick=()=>go(-1);
    if(s.type==="intro"){next.onclick=()=>go(1);return}
    if(s.type==="text"){
      const inp=document.getElementById("in"),err=document.getElementById("err");
      const ok=()=>{ans[s.id]=inp.value.trim().toUpperCase();
        if(!new RegExp(s.pattern).test(ans[s.id])){err.textContent="Use 3 letras e 2 números, por exemplo ABC12.";return false}
        err.textContent="";return true};
      let avisou=false;
      next.onclick=async()=>{
        if(!ok())return;
        if(window.ENDPOINT){
          next.disabled=true;next.textContent="Verificando…";
          try{
            const r=await fetch(window.ENDPOINT+"?check="+encodeURIComponent(ans[s.id])+"&f=pre");
            const j=await r.json();
            if(key==="pre"&&j.existe){err.textContent="Esse código já foi usado por outra pessoa. Crie outro, por exemplo mudando os números.";next.disabled=false;next.textContent="Continuar";return}
            if(key==="pos"&&!j.existe&&!avisou){avisou=true;err.textContent="Não encontramos esse código no formulário inicial. Confira o código que você anotou ou toque em Continuar para seguir assim mesmo.";next.disabled=false;next.textContent="Continuar";return}
          }catch(_){}
          next.disabled=false;next.textContent="Continuar";
        }
        try{localStorage.setItem("oficina_codigo",ans[s.id])}catch(_){}
        go(1);
      };
      inp.addEventListener("keydown",e=>{if(e.key==="Enter")next.click()});
    } else if(s.type==="radio"){
      next.disabled=!ans[s.id];
      root.querySelectorAll("input[name=r]").forEach(r=>r.onchange=()=>{ans[s.id]=r.value;next.disabled=false;setTimeout(()=>go(1),280)});
      next.onclick=()=>go(1);
    } else if(s.type==="likert"){
      const chk=()=>{next.disabled=!s.items.every(it=>ans[it[0]])};chk();
      root.querySelectorAll("input[type=radio]").forEach(r=>r.onchange=()=>{ans[r.name]=r.value;chk()});
      next.onclick=()=>go(1);
    } else if(s.type==="textarea"){
      const ta=document.getElementById("in");
      next.onclick=()=>{ans[s.id]=ta.value.trim();go(1)};
    }
  }

  async function finish(){
    const payload=Object.assign({formulario:key,id_envio:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),enviado_em:new Date().toISOString(),consentimento:"sim"},ans);
    try{const all=JSON.parse(localStorage.getItem("oficina_"+key)||"[]");all.push(payload);localStorage.setItem("oficina_"+key,JSON.stringify(all))}catch(_){}
    root.innerHTML=shell(`<h2>Enviando…</h2>`);
    let sent=false;
    if(window.ENDPOINT){
      const body=JSON.stringify(payload);
      try{
        const r=await fetch(window.ENDPOINT,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body});
        const j=await r.json();
        if(j.codigo_em_uso){ // alguém criou o mesmo código no intervalo
          const idx=steps.findIndex(x=>x.id==="codigo"); delete ans.codigo; try{localStorage.removeItem("oficina_codigo")}catch(_){}
          i=idx; show(); const e=document.getElementById("err"); if(e)e.textContent="Esse código acabou de ser usado por outra pessoa. Crie outro."; return;
        }
        sent=!!j.ok;
      }catch(_){
        try{await fetch(window.ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body});sent=true}catch(__){}
      }
    }
    const msg=sent?"Suas respostas foram enviadas.":(window.ENDPOINT?"Não deu para enviar agora. Baixe o arquivo e entregue ao ministrante.":"Respostas salvas neste aparelho.");
    root.innerHTML=shell(`<h1>Obrigado!</h1><p>${msg}</p>`+(key==="pre"?`<p class="hint">Seu código é <strong>${esc(ans.codigo)}</strong>. Anote: você vai usá-lo no formulário final.</p>`:"")+
      (sent?"":`<div class="nav"><button type="button" class="go" id="dl">Baixar minhas respostas (CSV)</button></div>`));
    const dl=document.getElementById("dl");
    if(dl)dl.onclick=()=>{const k=Object.keys(payload),q=v=>'"'+String(v).replace(/"/g,'""')+'"';
      const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["﻿"+k.map(q).join(",")+"\n"+k.map(x=>q(payload[x])).join(",")],{type:"text/csv"}));a.download="respostas_"+key+".csv";a.click()};
  }
  show();
})();
