
#include <WiFi.h>
#include <WebServer.h>

// PINO DO LED
const int pinoLED = 23;

// REDE WIFI DO ESP32
const char* nomeRede = "CONTROLE_LED";
const char* senhaRede = "led12345";

// SERVIDOR WEB
WebServer servidor(80);

// ESTADO DO LED
bool estadoLED = false;

// PAGINA WEB
void paginaInicial() {

  String estado;

  if (estadoLED) {
    estado = "LIGADO";
  } else {
    estado = "DESLIGADO";
  }

  String html = R"rawliteral(
  <!DOCTYPE html>
  <html lang="pt-br">

  <head>
    <meta charset="UTF-8">

    <meta name="viewport"
    content="width=device-width, initial-scale=1.0">

    <title>Controle LED</title>

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
        max-width: 400px;
        margin: auto;
      }

      h1 {
        color: #38bdf8;
      }

      .estado {
        font-size: 25px;
        margin: 25px;
        font-weight: bold;
      }

      button {
        width: 100%;
        padding: 15px;
        margin: 8px 0;
        border: none;
        border-radius: 10px;
        font-size: 17px;
        cursor: pointer;
        font-weight: bold;
        color: white;
      }

      .ligar {
        background: #22c55e;
      }

      .desligar {
        background: #ef4444;
      }

    </style>

  </head>

  <body>

    <div class="painel">

      <h1>CONTROLE DE LED</h1>

      <p>Controle pelo Wi-Fi</p>

      <div class="estado">
        LED: ESTADO_LED
      </div>

      <form action="/ligar">
        <button class="ligar">
          LIGAR LED
        </button>
      </form>

      <form action="/desligar">
        <button class="desligar">
          DESLIGAR LED
        </button>
      </form>

    </div>

  </body>
  </html>
  )rawliteral";

  html.replace("ESTADO_LED", estado);

  servidor.send(200, "text/html; charset=utf-8", html);
}

// LIGAR LED
void ligarLED() {

  estadoLED = true;

  digitalWrite(pinoLED, HIGH);

  servidor.sendHeader("Location", "/");
  servidor.send(303);
}

// DESLIGAR LED
void desligarLED() {

  estadoLED = false;

  digitalWrite(pinoLED, LOW);

  servidor.sendHeader("Location", "/");
  servidor.send(303);
}

void setup() {

  Serial.begin(115200);

  pinMode(pinoLED, OUTPUT);

  digitalWrite(pinoLED, LOW);

  // CRIAR REDE WIFI
  WiFi.mode(WIFI_AP);

  WiFi.softAP(nomeRede, senhaRede);

  Serial.println();
  Serial.println("CONTROLE DE LED INICIADO");

  Serial.print("Rede Wi-Fi: ");
  Serial.println(nomeRede);

  Serial.print("Senha: ");
  Serial.println(senhaRede);

  Serial.print("Endereco IP: ");
  Serial.println(WiFi.softAPIP());

  // CONFIGURAR PAGINAS
  servidor.on("/", paginaInicial);

  servidor.on("/ligar", ligarLED);

  servidor.on("/desligar", desligarLED);

  // INICIAR SERVIDOR
  servidor.begin();

  Serial.println("Servidor iniciado!");
}

void loop() {

  servidor.handleClient();

}
