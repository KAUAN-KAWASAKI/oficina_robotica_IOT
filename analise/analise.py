"""Analise pre x pos da Oficina de Robotica e IoT.
Uso: python analise.py pre.csv pos.csv
Exporte as abas 'pre' e 'pos' da planilha como CSV (Arquivo > Fazer download > CSV)."""
import csv, sys
from statistics import mean, stdev
GAB = {"C1": "Um microcontrolador com Wi-Fi e Bluetooth", "C2": "Objetos físicos conectados que coletam e trocam dados",
       "C3": "Converter uma grandeza física em sinal elétrico", "C4": "Limitar a corrente"}
A = [f"A{i}" for i in range(1, 8)]
def ler(p):
    with open(p, encoding="utf-8-sig", newline="") as f:
        return {r["codigo"].strip().upper(): r for r in csv.DictReader(f) if r.get("codigo")}
def media_auto(r): return mean(float(r[k]) for k in A)
def acertos(r): return sum(r.get(k) == v for k, v in GAB.items())
pre, pos = ler(sys.argv[1]), ler(sys.argv[2])
pares = sorted(set(pre) & set(pos))
print(f"Respostas pre: {len(pre)} | pos: {len(pos)} | pareadas: {len(pares)}")
if not pares: sys.exit("Nenhum codigo em comum.")
print("\nAutoavaliacao (media A1-A7, escala 1-5)")
for k in A:
    a, b = [mean(float(d[c][k]) for c in pares) for d in (pre, pos)]
    print(f"  {k}: pre {a:.2f} -> pos {b:.2f} ({b-a:+.2f})")
ma, mb = [[media_auto(d[c]) for c in pares] for d in (pre, pos)]
dif = [y - x for x, y in zip(ma, mb)]
print(f"  Geral: pre {mean(ma):.2f} -> pos {mean(mb):.2f} ({mean(dif):+.2f}; dp da diferenca {stdev(dif) if len(dif)>1 else 0:.2f})")
print("\nConhecimento (% de acertos)")
for k in GAB:
    a, b = [100*mean(d[c].get(k) == GAB[k] for c in pares) for d in (pre, pos)]
    print(f"  {k}: pre {a:.0f}% -> pos {b:.0f}%")
ta, tb = [mean(acertos(d[c]) for c in pares) for d in (pre, pos)]
print(f"  Media de acertos (0-4): pre {ta:.2f} -> pos {tb:.2f}")
print("\nSatisfacao (pos, todas as respostas)")
for k in [f"S{i}" for i in range(1, 8)]:
    v = [float(r[k]) for r in pos.values() if r.get(k)]
    if v: print(f"  {k}: media {mean(v):.2f}")
n = [int(r["nps"]) for r in pos.values() if r.get("nps", "") != ""]
if n: print(f"  NPS: {100*(sum(x>=9 for x in n)-sum(x<=6 for x in n))/len(n):.0f}")
