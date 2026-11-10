// Cole em script.google.com (projeto criado a partir de uma Planilha Google: Extensões > Apps Script).
// Implantar > Nova implantação > App da Web > Executar como: Eu > Acesso: Qualquer pessoa.
// Cada formulário vira uma aba ("pre" e "pos"). Códigos repetidos no inicial são recusados.
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function aba_(nome) { var ss = SpreadsheetApp.getActiveSpreadsheet(); return ss.getSheetByName(nome) || ss.insertSheet(nome); }
function existe_(nome, coluna, valor) {
  var sh = aba_(nome); if (sh.getLastRow() < 2) return false;
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], c = h.indexOf(coluna); if (c < 0) return false;
  var v = sh.getRange(2, c + 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) if (String(v[i][0]).toUpperCase() === String(valor).toUpperCase()) return true;
  return false;
}
// GET ?check=ABC12&f=pre  -> {existe:true/false}
function doGet(e) {
  var p = e.parameter || {};
  if (p.check) return json_({ existe: existe_(p.f === "pos" ? "pos" : "pre", "codigo", p.check) });
  return json_({ ok: true });
}
function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents), nome = d.formulario === "pos" ? "pos" : "pre";
    if (existe_(nome, "id_envio", d.id_envio)) return json_({ ok: true, repetido: true });   // reenvio do mesmo aparelho
    if (nome === "pre" && existe_("pre", "codigo", d.codigo)) return json_({ ok: false, codigo_em_uso: true });
    if (nome === "pos") d.pareado = existe_("pre", "codigo", d.codigo) ? "sim" : "nao";
    var sh = aba_(nome), keys = Object.keys(d);
    if (sh.getLastRow() === 0) sh.appendRow(keys);
    var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    keys.forEach(function (k) { if (header.indexOf(k) < 0) { header.push(k); sh.getRange(1, header.length).setValue(k); } });
    sh.appendRow(header.map(function (k) { return d[k] === undefined ? "" : d[k]; }));
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}
