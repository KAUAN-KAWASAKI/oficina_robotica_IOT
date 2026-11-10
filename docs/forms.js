// Perguntas dos formulários. Pré e pós usam os MESMOS itens A1–A6 e C1–C4 (para comparar).
const AUTO = [
  ["A1","Explicar o que é robótica"],
  ["A2","Explicar o que é Internet das Coisas (IoT)"],
  ["A3","Reconhecer os componentes de um circuito com ESP32 (placa, protoboard, LED, sensor)"],
  ["A4","Montar um circuito simples em protoboard"],
  ["A5","Carregar um código em uma placa ESP32"],
  ["A6","Criar um projeto simples de IoT"]
];
const CONHEC = [
  ["C1","O que é o ESP32?",["Um tipo de sensor","Um microcontrolador com Wi-Fi e Bluetooth","Uma linguagem de programação","Um aplicativo","Não sei"]],
  ["C2","O que caracteriza a IoT?",["Objetos físicos conectados que coletam e trocam dados","Computadores sem internet","Apenas redes sociais","Apenas robôs humanoides","Não sei"]],
  ["C3","Qual é a função de um sensor?",["Armazenar energia","Converter uma grandeza física em sinal elétrico","Acender luzes","Conectar à internet","Não sei"]],
  ["C4","Qual é a função do resistor em um circuito com LED?",["Limitar a corrente","Aumentar o brilho","Gerar Wi-Fi","Gravar o código","Não sei"]]
];
const CODIGO = {id:"codigo",type:"text",label:"Crie seu código",
  help:"3 letras + 2 números (ex.: ABC12). Anote: você usará o mesmo no final.",pattern:"^[A-Za-z]{3}[0-9]{2}$"};
const LIK = (title,items,hint,ends)=>({type:"likert",title,hint:hint||"Escolha de 1 a 5",ends:ends||["1 = não sei nada","5 = sei muito bem"],items});
const CON = CONHEC.map(c=>({type:"radio",id:c[0],title:c[1],tag:"Conhecimento",options:c[2]}));

window.FORMS = {
  pre:{
    title:"Antes da oficina",
    subtitle:"Oficina de Robótica e IoT · 14ª Semana Acadêmica de Castanhal · UEPA",
    intro:"São cerca de 3 minutos. É voluntário e anônimo, e as respostas serão usadas só para fins acadêmicos (relato de experiência). Pode parar quando quiser.",
    steps:[
      Object.assign({},CODIGO,{title:"Crie seu código"}),
      {type:"radio",id:"faixa",title:"Qual a sua faixa etária?",options:["Até 17","18 a 24","25 a 34","35 ou mais"]},
      {type:"radio",id:"vinculo",title:"Qual o seu vínculo?",options:["Graduação","Professor","Visitante de outra instituição","Participante"]},
      {type:"radio",id:"prog",title:"Já teve contato com programação?",options:["Nunca","Pouco","Regular","Bastante"]},
      {type:"radio",id:"placa",title:"Já usou Arduino, ESP32 ou placa parecida?",options:["Nunca","Já vi","Já usei uma vez","Uso com frequência"]},
      LIK("Como você se avalia em:",AUTO.slice(0,3)),
      LIK("Como você se avalia em:",AUTO.slice(3)),
      ...CON,
      {type:"textarea",id:"espera",title:"O que você espera aprender?",optional:true,placeholder:"Escreva em poucas palavras (opcional)"}
    ]
  },
  pos:{
    title:"Depois da oficina",
    subtitle:"Oficina de Robótica e IoT · 14ª Semana Acadêmica de Castanhal · UEPA",
    intro:"São cerca de 3 minutos. É voluntário e anônimo, e as respostas serão usadas só para fins acadêmicos (relato de experiência).",
    steps:[
      Object.assign({},CODIGO,{title:"Confirme seu código",help:"O MESMO código que você criou no início."}),
      LIK("Como você se avalia agora em:",AUTO.slice(0,3)),
      LIK("Como você se avalia agora em:",AUTO.slice(3)),
      ...CON,
      LIK("Dê uma nota para a oficina",[
        ["S1","Clareza dos objetivos e do conteúdo"],
        ["S2","As práticas (controle de LED e alarme) me ajudaram a aprender"],
        ["S3","Tempo e materiais da oficina"],
        ["S4","Chance de eu recomendar a oficina a um colega"]],"Escolha de 1 a 5",["1 = ruim","5 = ótimo"]),
      {type:"textarea",id:"interessante",title:"Qual foi a parte mais interessante?",optional:true,placeholder:"Opcional"},
      {type:"textarea",id:"dificuldade",title:"Qual foi sua maior dificuldade?",optional:true,placeholder:"Opcional"},
      {type:"textarea",id:"mudaria",title:"O que você mudaria na oficina?",optional:true,placeholder:"Opcional"}
    ]
  }
};
