#!/usr/bin/env python3
"""Acrescenta ou atualiza o baseline de um grupo de distritos em data/baseline.js.

Uso:
  python3 tools/baseline_to_js.py base_line_data.xlsx --districts "Bárue,Vanduzi" [--year 2024]
  python3 tools/baseline_to_js.py baseline_chimoio.xlsx --districts "Chimoio"

- O Excel deve ter o MESMO modelo da folha original (38 linhas, mesma ordem de indicadores).
  Se a ordem não coincidir o script pára com erro em vez de gravar valores trocados.
- Um grupo com os mesmos distritos é substituído; um grupo novo é acrescentado (os outros ficam).
- Os nomes dos distritos têm de ser iguais aos da camada do ArcGIS (campo distrito).
Requer: pip install openpyxl"""
import sys, json, os, re, unicodedata, argparse, openpyxl

ap = argparse.ArgumentParser(); ap.add_argument('xlsx'); ap.add_argument('--districts', required=True); ap.add_argument('--year', type=int, default=None)
a = ap.parse_args(); dists = [d.strip() for d in a.districts.split(',') if d.strip()]
norm = lambda s: re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().lower()).strip()

# linha do Excel -> id do sub-indicador no catálogo (13a/13b têm um valor por distrito: coluna «Description»)
MAP = {2:'1a',3:'2a',4:'2b',5:'3a',6:'4a',7:'4b',8:'5a',9:'6a',10:'6b',11:'7a',12:'7b',13:'7c',14:'8a',15:'9a',16:'9b',17:'9c',18:'9d',
       19:'10a',20:'10b',21:'10c',22:'11a',23:'11b',24:'11c',25:'11d',26:'12a',27:'12b',28:'12c',29:'12d',30:'12e',
       31:'13a',32:'13a',33:'13b',34:'13b',35:'14a',36:'15a',37:'16a',38:'17a',39:'17b'}
PER_DISTRICT = {31, 32, 33, 34}
ws = openpyxl.load_workbook(a.xlsx, data_only=True).active
items = []
for r, sub in MAP.items():
    ind_no = ws.cell(r, 7).value
    assert str(ind_no) == re.match(r'\d+', sub).group(), f'Linha {r}: indicador {ind_no} não corresponde a {sub} — o Excel tem outra ordem'
    val = ws.cell(r, 12).value
    if not isinstance(val, (int, float)): continue
    d = None
    if r in PER_DISTRICT:
        txt = norm(ws.cell(r, 10).value)
        d = next((x for x in dists if norm(x) == txt), None)
        if d is None and len(dists) > 1: continue   # valor de um distrito que não está neste grupo
    items.append({'ind': int(ind_no), 'sub': sub, 'value': round(float(val), 6), 'district': d, 'fileScore': ws.cell(r, 15).value, 'row': r})

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'baseline.js')
cur = {'year': a.year or 2024, 'groups': []}
if os.path.exists(p):
    txt = open(p, encoding='utf-8').read(); cur = json.loads(txt[txt.index('=') + 1:].rstrip().rstrip(';'))
if a.year: cur['year'] = a.year
key = sorted(norm(d) for d in dists)
cur['groups'] = [g for g in cur['groups'] if sorted(norm(d) for d in g['districts']) != key] + [{'name': ' + '.join(dists), 'districts': dists, 'items': items}]
open(p, 'w', encoding='utf-8').write('window.LRI_BASELINE=' + json.dumps(cur, ensure_ascii=False, indent=1) + ';\n')
print(f"{len(items)} valores para {' + '.join(dists)}; grupos no ficheiro: {[g['name'] for g in cur['groups']]}")
