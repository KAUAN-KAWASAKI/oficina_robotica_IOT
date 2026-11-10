// Cole este código em script.google.com (projeto vinculado a uma Planilha Google).
// Implantar > Nova implantação > App da Web > Executar como: Eu > Acesso: Qualquer pessoa.
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(d.formulario) || ss.insertSheet(d.formulario);
  var keys = Object.keys(d);
  if (sh.getLastRow() === 0) sh.appendRow(keys);
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  keys.forEach(function (k) { if (header.indexOf(k) < 0) { header.push(k); sh.getRange(1, header.length).setValue(k); } });
  sh.appendRow(header.map(function (k) { return d[k] === undefined ? "" : d[k]; }));
  return ContentService.createTextOutput("ok");
}
