
#include <WiFi.h>
#include <WebServer.h>

// PINOS DO ESP32
const int ledVermelho = 23;
const int ledVerde = 22;
const int sensorIR = 21;
const int buzzer = 5;

// REDE WIFI
const char* nomeRede = "SISTEMA_SEGURANCA";
const char* senhaRede = "seguranca123";

// SERVIDOR WEB
WebServer servidor(80);

// ESTADOS DO SISTEMA
bool sistemaArmado = false;
bool alarmeDisparado = false;
bool movimentoDetectado = false;

// CONFIGURACAO DO SENSOR
const int nivelMovimento = LOW;

// AQUECIMENTO DO SENSOR
unsigned long inicioSistema = 0;
const unsigned long tempoAquecimento = 30000;

bool sensorPronto = false;

// CONTROLE DA SIRENE
unsigned long ultimoTom = 0;
bool tomAlto = false;

// PAGINA WEB
void paginaInicial() {

  String html = R"rawliteral(
  <!DOCTYPE html>
  <html lang="pt-br">

  <head>

    <meta charset="UTF-8">

    <meta name="viewport"
    content="width=device-width, initial-scale=1.0">

    <title>Sistema de Seguranca</title>

    <style>

      body {
        background: #101827;
        color: white;
        font-family: Arial;
        text-align: center;
        padding: 20px;
      }

      .painel {
        background: #1e293b;
        padding: 25px;
        border-radius: 15px;
        max-width: 420px;
        margin: auto;
      }

      h1 {
        color: #38bdf8;
      }

      .estado {
        font-size: 24px;
        font-weight: bold;
        margin: 25px 0;
      }

      .informacao {
        background: #334155;
        padding: 15px;
        border-radius: 10px;
        margin: 15px 0;
      }

      button {
        width: 100%;
        padding: 16px;
        margin: 8px 0;
        border: none;
        border-radius: 10px;
        font-size: 17px;
        font-weight: bold;
        cursor: pointer;
        color: white;
      }

      .armar {
        background: #ef4444;
      }

      .desarmar {
        background: #22c55e;
      }

      .alerta {
        background: #7f1d1d;
        border: 2px solid #ef4444;
        padding: 15px;
        border-radius: 10px;
        margin-top: 20px;
        display: none;
      }

      .normal {
        color: #4ade80;
      }

      .perigo {
        color: #f87171;
      }

      .cinza {
        color: #facc15;
      }

      p {
        color: #cbd5e1;
      }

    </style>

  </head>

  <body>

    <div class="painel">

      <h1>SISTEMA DE SEGURANCA</h1>

      <p>Monitoramento via Wi-Fi</p>

      <div class="estado" id="estado">
        CARREGANDO...
      </div>

      <div class="informacao">

        <p>Sensor infravermelho:</p>

        <h3 id="sensor">
          AGUARDANDO
        </h3>

        <p>Situacao do alarme:</p>

        <h3 id="alarme">
          NORMAL
        </h3>

      </div>

      <button class="armar"
      onclick="enviarComando('/armar')">

        ARMAR SISTEMA

      </button>

      <button class="desarmar"
      onclick="enviarComando('/desarmar')">

        DESARMAR SISTEMA

      </button>

      <div class="alerta" id="alerta">

        <h2>⚠ ALERTA DE SEGURANCA!</h2>

        <p>Movimento detectado!</p>

        <p>Verifique o ambiente imediatamente.</p>

      </div>

      <p style="font-size:12px; margin-top:25px;">

        SISTEMA DE SEGURANCA ESP32

      </p>

    </div>

    <script>

      async function enviarComando(url) {

        try {

          await fetch(url);

          atualizarStatus();

        } catch (erro) {

          console.log("Erro de conexao");

        }

      }

      async function atualizarStatus() {

        try {

          const resposta = await fetch('/status');

          const dados = await resposta.json();

          const estado = document.getElementById("estado");
          const sensor = document.getElementById("sensor");
          const alarme = document.getElementById("alarme");
          const alerta = document.getElementById("alerta");

          if (dados.armado) {

            estado.innerHTML = "SISTEMA ARMADO";
            estado.className = "estado perigo";

          } else {

            estado.innerHTML = "SISTEMA DESARMADO";
            estado.className = "estado normal";

          }

          if (!dados.pronto) {

            sensor.innerHTML = "AQUECENDO...";
            sensor.className = "cinza";

          } else if (dados.movimento) {

            sensor.innerHTML = "MOVIMENTO DETECTADO!";
            sensor.className = "perigo";

          } else {

            sensor.innerHTML = "NENHUM MOVIMENTO";
            sensor.className = "normal";

          }

          if (dados.alarme) {

            alarme.innerHTML = "ALARME DISPARADO!";
            alarme.className = "perigo";

            alerta.style.display = "block";

          } else {

            alarme.innerHTML = "NORMAL";
            alarme.className = "normal";

            alerta.style.display = "none";

          }

        } catch (erro) {

          console.log("Aguardando ESP32...");

        }

      }

      setInterval(atualizarStatus, 500);

      atualizarStatus();

    </script>

  </body>

  </html>
  )rawliteral";

  servidor.send(200, "text/html; charset=utf-8", html);
}

// ATUALIZAR ESTADO DOS LEDS
void atualizarLEDs() {

  if (sistemaArmado) {

    digitalWrite(ledVermelho, HIGH);
    digitalWrite(ledVerde, LOW);

  } else {

    digitalWrite(ledVermelho, LOW);
    digitalWrite(ledVerde, HIGH);

  }

}

// ARMAR SISTEMA
void armarSistema() {

  sistemaArmado = true;

  alarmeDisparado = false;

  atualizarLEDs();

  servidor.send(200, "text/plain", "Sistema armado");

  Serial.println("SISTEMA ARMADO");

}

// DESARMAR SISTEMA
void desarmarSistema() {

  sistemaArmado = false;

  alarmeDisparado = false;

  // PARAR SIRENE IMEDIATAMENTE
  noTone(buzzer);

  atualizarLEDs();

  servidor.send(200, "text/plain", "Sistema desarmado");

  Serial.println("SISTEMA DESARMADO");

}

// ENVIAR INFORMACOES PARA A PAGINA
void consultarStatus() {

  String resposta = "{";

  resposta += "\"armado\":";
  resposta += (sistemaArmado ? "true" : "false");

  resposta += ",\"alarme\":";
  resposta += (alarmeDisparado ? "true" : "false");

  resposta += ",\"movimento\":";
  resposta += (movimentoDetectado ? "true" : "false");

  resposta += ",\"pronto\":";
  resposta += (sensorPronto ? "true" : "false");

  resposta += "}";

  servidor.sendHeader("Cache-Control", "no-store");

  servidor.send(200, "application/json", resposta);

}

// DETECTAR MOVIMENTO
void verificarMovimento() {

  movimentoDetectado =
    (digitalRead(sensorIR) == nivelMovimento);

  if (!sensorPronto) {
    return;
  }

  if (sistemaArmado && movimentoDetectado) {

    if (!alarmeDisparado) {

      alarmeDisparado = true;

      Serial.println();
      Serial.println("!!! ALERTA DE SEGURANCA !!!");
      Serial.println("MOVIMENTO DETECTADO!");

    }

  }

}

// SIRENE DE POLICIA
void controlarSirene() {

  if (!alarmeDisparado) {

    noTone(buzzer);

    return;

  }

  unsigned long agora = millis();

  if (agora - ultimoTom >= 350) {

    ultimoTom = agora;

    tomAlto = !tomAlto;

    if (tomAlto) {

      tone(buzzer, 1200);

    } else {

      tone(buzzer, 700);

    }

  }

}

void setup() {

  Serial.begin(115200);

  // CONFIGURAR PINOS
  pinMode(ledVermelho, OUTPUT);
  pinMode(ledVerde, OUTPUT);

  pinMode(sensorIR, INPUT);
  pinMode(buzzer, OUTPUT);

  // ESTADO INICIAL
  digitalWrite(ledVermelho, LOW);
  digitalWrite(ledVerde, HIGH);

  noTone(buzzer);

  // INICIAR AQUECIMENTO DO SENSOR
  inicioSistema = millis();

  // CRIAR PONTO DE ACESSO WIFI
  WiFi.mode(WIFI_AP);

  WiFi.softAP(nomeRede, senhaRede);

  Serial.println();
  Serial.println("SISTEMA DE SEGURANCA INICIADO");

  Serial.print("Rede Wi-Fi: ");
  Serial.println(nomeRede);

  Serial.print("Senha: ");
  Serial.println(senhaRede);

  Serial.print("Endereco IP: ");
  Serial.println(WiFi.softAPIP());

  // CONFIGURAR PAGINAS
  servidor.on("/", paginaInicial);

  servidor.on("/armar", armarSistema);

  servidor.on("/desarmar", desarmarSistema);

  servidor.on("/status", consultarStatus);

  // INICIAR SERVIDOR
  servidor.begin();

  Serial.println("Servidor web iniciado!");

  Serial.println("Sistema inicialmente desarmado.");

}

void loop() {

  // ATENDER CELULAR
  servidor.handleClient();

  // VERIFICAR AQUECIMENTO DO SENSOR
  if (!sensorPronto &&
      millis() - inicioSistema >= tempoAquecimento) {

    sensorPronto = true;

    Serial.println("Sensor infravermelho pronto!");

  }

  // VERIFICAR MOVIMENTO
  verificarMovimento();

  // CONTROLAR SIRENE
  controlarSirene();

  // ATUALIZAR LEDS
  atualizarLEDs();

}
