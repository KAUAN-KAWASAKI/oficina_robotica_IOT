# Formulários da oficina
Site estático (GitHub Pages: main / docs). Inicial: `pre.html` · Final: `pos.html`.
Uma pergunta por tela; fundo 3D em `bg.js`; perguntas em `forms.js`; endpoint em `config.js`.

## Onde as respostas ficam
Numa Planilha Google, pelo script `analise/apps-script.gs` (abas `pre` e `pos`). Sem a URL em `config.js`, as respostas ficam só no aparelho de quem respondeu.
1. Planilha Google > Extensões > Apps Script > cole `analise/apps-script.gs`.
2. Implantar > Nova implantação > App da Web > Executar como: Eu; Acesso: Qualquer pessoa. Copie a URL.
3. Cole a URL em `docs/config.js` (`window.ENDPOINT`) e envie ao GitHub.
4. Teste com uma resposta de cada formulário e apague as linhas de teste.

## Códigos repetidos
No formulário inicial o código é consultado na planilha: se já existir, a pessoa precisa criar outro (e há trava no envio, caso duas pessoas criem o mesmo no mesmo instante). No final, o código é conferido com o inicial; a coluna `pareado` da aba `pos` mostra `sim`/`nao`.

## Análise
`python analise/analise.py pre.csv pos.csv` (exporte as abas como CSV).
