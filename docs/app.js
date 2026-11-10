(function(){
  const key = document.body.dataset.form;
  const F = window.FORMS[key];
  const root = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const L = ["1","2","3","4","5"];
  let h = `<h1>${esc(F.title)}</h1><p class="sub">${esc(F.subtitle)}</p>
  <form id="f" novalidate>
  <fieldset class="card consent"><legend>Termo de consentimento</legend><p>${esc(F.consent)}</p>
  <label class="chk"><input type="checkbox" name="consentimento" required> Li e concordo em participar.</label></fieldset>`;
  F.blocks.forEach(b=>{
    h += `<section class="card"><h2>${esc(b.title)}</h2>${b.desc?`<p class="desc">${esc(b.desc)}</p>`:""}`;
    b.questions.forEach(q=>{
      const req = q.required ? " required" : "";
      if(q.type==="text"){
        h += `<div class="q"><label for="${q.id}">${esc(q.label)}${q.required?" *":""}</label>${q.help?`<p class="help">${esc(q.help)}</p>`:""}
        <input id="${q.id}" name="${q.id}" type="text" autocomplete="off"${req}${q.pattern?` pattern="${q.pattern}"`:""}></div>`;
      } else if(q.type==="textarea"){
        h += `<div class="q"><label for="${q.id}">${esc(q.label)}</label><textarea id="${q.id}" name="${q.id}" rows="3"></textarea></div>`;
      } else if(q.type==="radio"){
        h += `<div class="q"><p class="lbl">${esc(q.label)}${q.required?" *":""}</p>`+
          q.options.map((o,i)=>`<label class="opt"><input type="radio" name="${q.id}" value="${esc(o)}"${i===0&&q.required?" required":""}> ${esc(o)}</label>`).join("")+`</div>`;
      } else if(q.type==="likert"){
        h += `<div class="likert">`+q.items.map(it=>`<div class="q"><p class="lbl">${esc(it[0])}. ${esc(it[1])}</p><div class="scale">`+
          L.map((v,i)=>`<label><input type="radio" name="${it[0]}" value="${v}"${i===0?" required":""}><span>${v}</span></label>`).join("")+`</div></div>`).join("")+`</div>`;
      } else if(q.type==="nps"){
        h += `<div class="q"><p class="lbl">${esc(q.label)} *</p><div class="scale nps">`+
          Array.from({length:11},(_,i)=>`<label><input type="radio" name="${q.id}" value="${i}"${i===0?" required":""}><span>${i}</span></label>`).join("")+`</div></div>`;
      }
    });
    h += `</section>`;
  });
  h += `<button type="submit" id="send">Enviar respostas</button><p id="msg" role="status"></p></form>`;
  root.innerHTML = h;

  const form = document.getElementById("f"), msg = document.getElementById("msg");
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    const fd = new FormData(form), data = {};
    for(const [k,v] of fd.entries()) data[k]=v;
    data.consentimento = "sim";
    if(data.codigo) data.codigo = data.codigo.toUpperCase();
    const payload = {formulario:key, enviado_em:new Date().toISOString(), ...data};
    try{
      const all = JSON.parse(localStorage.getItem("oficina_"+key)||"[]"); all.push(payload);
      localStorage.setItem("oficina_"+key, JSON.stringify(all));
    }catch(_){}
    const btn = document.getElementById("send"); btn.disabled = true;
    let enviado = false;
    if(window.ENDPOINT){
      try{
        await fetch(window.ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
        enviado = true;
      }catch(_){}
    }
    form.innerHTML = `<section class="card done"><h2>Obrigado!</h2>
      <p>${enviado ? "Suas respostas foram enviadas." : (window.ENDPOINT ? "Não foi possível enviar agora. Baixe o arquivo abaixo e entregue ao ministrante." : "Respostas salvas neste aparelho.")}</p>
      ${enviado?"":`<button type="button" id="dl">Baixar minhas respostas (CSV)</button>`}</section>`;
    const dl = document.getElementById("dl");
    if(dl) dl.onclick = ()=>{
      const keys = Object.keys(payload);
      const q = v => '"'+String(v).replace(/"/g,'""')+'"';
      const csv = keys.map(q).join(",")+"\n"+keys.map(k=>q(payload[k])).join(",");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["﻿"+csv],{type:"text/csv"}));
      a.download = "respostas_"+key+".csv"; a.click();
    };
    window.scrollTo({top:0,behavior:"smooth"});
  });
})();
