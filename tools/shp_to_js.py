#!/usr/bin/env python3
"""Converte um shapefile de distritos (WGS84) em data/districts.js (sem dependencias externas).
Uso: python3 tools/shp_to_js.py caminho/Admin_Level_2_2017 [tolerancia_graus=0.004]
(o argumento é o caminho SEM extensão; precisa dos .shp e .dbf)"""
import struct, sys, json, os, math

def read_dbf(path):
    d = open(path, 'rb').read()
    n, hl, rl = struct.unpack('<IHH', d[4:12])
    fields, pos = [], 32
    while d[pos] != 0x0D:
        name = d[pos:pos+11].split(b'\0')[0].decode('latin-1'); ln = d[pos+16]
        fields.append((name, ln)); pos += 32
    rows = []
    for i in range(n):
        r = d[hl+i*rl: hl+(i+1)*rl]; o = 1; row = {}
        for name, ln in fields:
            raw = r[o:o+ln]; o += ln
            try: v = raw.decode('utf-8')
            except UnicodeDecodeError: v = raw.decode('latin-1')
            row[name] = v.strip()
        rows.append(row)
    return rows

def read_shp(path):
    d = open(path, 'rb').read(); pos = 100; out = []
    while pos < len(d):
        ln = struct.unpack('>i', d[pos+4:pos+8])[0]*2
        body = d[pos+8:pos+8+ln]; pos += 8+ln
        t = struct.unpack('<i', body[:4])[0]
        if t == 0: out.append([]); continue
        np_, npt = struct.unpack('<ii', body[36:44])
        parts = list(struct.unpack('<%di' % np_, body[44:44+4*np_]))
        o = 44+4*np_
        pts = [struct.unpack('<dd', body[o+16*i:o+16*i+16]) for i in range(npt)]
        parts.append(npt)
        out.append([pts[parts[i]:parts[i+1]] for i in range(np_)])
    return out

def dp(pts, tol):
    if len(pts) < 3: return pts
    keep = [False]*len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts)-1)]
    while st:
        a, b = st.pop(); (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2-x1, y2-y1; L = math.hypot(dx, dy); mx, mi = -1, -1
        for i in range(a+1, b):
            x, y = pts[i]
            dist = math.hypot(x-x1, y-y1) if L == 0 else abs(dy*(x-x1)-dx*(y-y1))/L
            if dist > mx: mx, mi = dist, i
        if mx > tol: keep[mi] = True; st += [(a, mi), (mi, b)]
    return [p for p, k in zip(pts, keep) if k]

def area(r): return sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))/2

base = sys.argv[1]; tol = float(sys.argv[2]) if len(sys.argv) > 2 else 0.004
rows = read_dbf(base+'.dbf'); geoms = read_shp(base+'.shp')
feats = []
for row, rings in zip(rows, geoms):
    rr = []
    for r in rings:
        s = dp(r, tol)
        if len(s) >= 4 and abs(area(s)) > tol*tol*2: rr.append([[round(x, 3), round(y, 3)] for x, y in s])
    if rr: feats.append({'d': row.get('DISTRITO', ''), 'p': row.get('PROVINCIA', ''), 'r': rr})
js = 'window.LRI_DISTRICTS=' + json.dumps(feats, ensure_ascii=False, separators=(',', ':')) + ';\n'
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'districts.js')
open(out, 'w', encoding='utf-8').write(js)
print(len(feats), 'distritos,', round(len(js)/1024), 'KB ->', out)
