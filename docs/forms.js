const LIKERT = ["1","2","3","4","5"];
const AUTO = [
  ["A1","Sei explicar o que é robótica."],
  ["A2","Sei explicar o que é Internet das Coisas (IoT)."],
  ["A3","Reconheço os componentes básicos de um circuito com ESP32 (placa, protoboard, jumpers, LED, sensor)."],
  ["A4","Sei montar um circuito simples em protoboard."],
  ["A5","Sei carregar e executar um código em uma placa ESP32."],
  ["A6","Sei identificar e corrigir um erro comum de montagem ou de código."],
  ["A7","Me sinto confiante para criar um projeto simples de IoT."]
];
const CONHEC = [
  ["C1","O que é o ESP32?",["Um tipo de sensor","Um microcontrolador com Wi-Fi e Bluetooth","Uma linguagem de programação","Um aplicativo","Não sei"]],
  ["C2","O que caracteriza a IoT?",["Objetos físicos conectados que coletam e trocam dados","Computadores sem internet","Apenas redes sociais","Apenas robôs humanoides","Não sei"]],
  ["C3","Qual é a função de um sensor?",["Armazenar energia","Converter uma grandeza física em sinal elétrico","Acender luzes","Conectar à internet","Não sei"]],
  ["C4","Qual é a função do resistor em um circuito com LED?",["Limitar a corrente","Aumentar o brilho","Gerar Wi-Fi","Gravar o código","Não sei"]]
];
const CODIGO = {id:"codigo",type:"text",label:"Código de pareamento",
  help:"2 primeiras letras do nome da sua mãe + dia do SEU nascimento (2 dígitos) + 2 últimas letras do SEU nome. Ex.: MA15ZA. Use o mesmo nos dois formulários.",required:true,pattern:"[A-Za-z]{2}[0-9]{2}[A-Za-z]{2}"};
const blocoAuto = {title:"Autoavaliação",desc:"1 = discordo totalmente · 5 = concordo totalmente",
  questions:[{id:"auto",type:"likert",items:AUTO,required:true}]};
const blocoConhec = {title:"Conhecimento",desc:"Marque uma opção. Se não souber, marque \"Não sei\".",
  questions:CONHEC.map(c=>({id:c[0],type:"radio",label:c[0]+". "+c[1],options:c[2],required:true}))};

window.FORMS = {
  pre:{
    title:"Formulário inicial — Oficina de Robótica e IoT",
    subtitle:"14ª Semana Acadêmica de Castanhal · UEPA Campus XX · 11/11/2026",
    consent:"Participar é voluntário e anônimo. As respostas serão usadas apenas para fins acadêmicos, em um relato de experiência. Você pode desistir a qualquer momento.",
    blocks:[
      {title:"Perfil",questions:[
        CODIGO,
        {id:"faixa",type:"radio",label:"Faixa etária",options:["Até 17","18 a 24","25 a 34","35 ou mais"],required:true},
        {id:"vinculo",type:"radio",label:"Vínculo",options:["Estudante de graduação","Estudante do ensino médio/técnico","Pós-graduação","Professor","Outro"],required:true},
        {id:"curso",type:"text",label:"Curso/área",required:true},
        {id:"prog",type:"radio",label:"Já teve contato com programação?",options:["Nunca","Pouco","Regular","Bastante"],required:true},
        {id:"placa",type:"radio",label:"Já usou Arduino, ESP32 ou outra placa microcontrolada?",options:["Nunca","Já vi","Já usei uma vez","Uso com frequência"],required:true},
        {id:"espera",type:"textarea",label:"O que espera aprender nesta oficina?"}
      ]},
      blocoAuto, blocoConhec,
      {title:"Expectativas",questions:[
        {id:"receio",type:"textarea",label:"Qual é a sua maior dúvida ou receio sobre a oficina? (opcional)"}
      ]}
    ]
  },
  pos:{
    title:"Formulário final — Oficina de Robótica e IoT",
    subtitle:"14ª Semana Acadêmica de Castanhal · UEPA Campus XX · 11/11/2026",
    consent:"Participar é voluntário e anônimo. As respostas serão usadas apenas para fins acadêmicos, em um relato de experiência.",
    blocks:[
      {title:"Identificação",questions:[Object.assign({},CODIGO,{help:"Use o MESMO código do formulário inicial."})]},
      blocoAuto, blocoConhec,
      {title:"Avaliação da oficina",desc:"1 = discordo totalmente · 5 = concordo totalmente",questions:[
        {id:"sat",type:"likert",required:true,items:[
          ["S1","Os objetivos da oficina ficaram claros."],
          ["S2","O conteúdo (robótica, IoT, ESP32 e componentes) foi apresentado de forma compreensível."],
          ["S3","A prática com o alerta de segurança IoT me ajudou a aprender."],
          ["S4","A prática com o sensor de iluminação (simulador de poste) me ajudou a aprender."],
          ["S5","O tempo da oficina (4 horas) foi adequado."],
          ["S6","Os materiais e equipamentos foram suficientes para a atividade."],
          ["S7","Recomendaria esta oficina a um colega."]]}
      ]},
      {title:"Perguntas abertas",questions:[
        {id:"interessante",type:"textarea",label:"Qual foi a parte mais interessante da oficina?"},
        {id:"dificuldade",type:"textarea",label:"Qual foi a maior dificuldade durante a montagem ou o teste?"},
        {id:"mudaria",type:"textarea",label:"O que você mudaria ou acrescentaria na oficina?"},
        {id:"continuar",type:"textarea",label:"Pretende continuar estudando ou criando projetos de robótica/IoT? Por quê?"}
      ]},
      {title:"Avaliação geral",questions:[
        {id:"nps",type:"nps",label:"De 0 a 10, qual a chance de você recomendar esta oficina a um colega?",required:true}
      ]}
    ]
  }
};
