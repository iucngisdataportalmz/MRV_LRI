/* ==========================================================================
   Motor de cálculo do LRI — só usa registos VALIDADOS.
   sub-indicador = pontuação do valor médio  ·  indicador = média dos sub-indicadores
   pilar = média dos indicadores            ·  LRI = média dos pilares
   ========================================================================== */
(function () {
  const C = window.LRI_CATALOG, CFG = window.LRI_CONFIG;

  const classOf = (s) => {
    if (s == null || isNaN(s)) return null;
    let k = CFG.classes[0].key;
    CFG.classes.forEach((c) => { if (s >= c.min) k = c.key; });
    return k;
  };
  const classColor = (k) => (CFG.classes.find((c) => c.key === k) || {}).color || "#999";
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

  // --- normaliza um feature do ArcGIS num registo -------------------------
  function statusKey(raw) {
    const v = raw == null ? "" : String(raw).trim();
    const has = (list) => list.some((x) => (x == null ? "" : String(x)).toLowerCase() === v.toLowerCase());
    if (has(CFG.status.validated)) return "validated";
    if (has(CFG.status.rejected)) return "rejected";
    return "pending";
  }

  function enrich(r) {
    const ind = C.matchIndicator(r.indicatorRaw);
    r.ind = ind;
    if (ind) {
      const m = C.matchSub(ind, r.subRaw);
      r.sub = m.sub; r.assumed = m.assumed;
      r.score = C.scoreValue(m.sub.rule, r.value);
      r.pillar = ind.p;
    } else { r.sub = null; r.score = null; r.pillar = null; }
    r.cls = classOf(r.score);
    return r;
  }

  // --- cálculo hierárquico sobre um conjunto de registos -------------------
  function calc(recs) {
    const subMap = new Map();
    recs.forEach((r) => {
      if (!r.ind || r.value == null || isNaN(r.value)) return;
      const k = r.ind.n + "|" + r.sub.id;
      if (!subMap.has(k)) subMap.set(k, { key: k, ind: r.ind, sub: r.sub, vals: [], recs: [] });
      const g = subMap.get(k); g.vals.push(r.value); g.recs.push(r);
    });
    const subs = [...subMap.values()].map((g) => {
      g.mean = mean(g.vals); g.n = g.vals.length;
      g.score = C.scoreValue(g.sub.rule, g.mean); g.cls = classOf(g.score);
      return g;
    });
    const indMap = new Map();
    subs.forEach((s) => {
      if (!indMap.has(s.ind.n)) indMap.set(s.ind.n, { ind: s.ind, subs: [] });
      indMap.get(s.ind.n).subs.push(s);
    });
    const inds = [...indMap.values()].map((g) => {
      g.score = mean(g.subs.map((s) => s.score)); g.cls = classOf(g.score);
      g.n = g.subs.reduce((a, s) => a + s.n, 0);
      // valor médio do indicador: só faz sentido com 1 sub-indicador (mesma unidade)
      g.mean = g.subs.length === 1 ? g.subs[0].mean : null;
      g.unit = g.subs.length === 1 ? g.subs[0].sub.unit : "";
      return g;
    }).sort((a, b) => a.ind.n - b.ind.n);
    const pillars = C.PILLARS.map((p) => {
      const list = inds.filter((i) => i.ind.p === p.id);
      const score = mean(list.map((i) => i.score));
      return { pillar: p, inds: list, score, cls: classOf(score), nInd: list.length };
    });
    const lri = mean(pillars.filter((p) => p.score != null).map((p) => p.score));
    return { subs, inds, pillars, lri, cls: classOf(lri), n: recs.length };
  }

  // --- modelo completo do dashboard ----------------------------------------
  function build(valid, filters) {
    filters = filters || {};
    let recs = valid.filter((r) => r.ind);
    if (filters.year) recs = recs.filter((r) => String(r.year) === String(filters.year));
    if (filters.district) recs = recs.filter((r) => r.district === filters.district);

    const main = calc(recs);
    const years = [...new Set(valid.filter((r) => r.ind && r.year).map((r) => r.year))].sort();
    const districts = [...new Set(valid.map((r) => r.district).filter(Boolean))].sort();

    // evolução do LRI (ignora filtro de ano, respeita distrito)
    const base = valid.filter((r) => r.ind && (!filters.district || r.district === filters.district));
    const evolution = years.map((y) => {
      const m = calc(base.filter((r) => r.year === y));
      return { year: y, lri: m.lri, pillars: m.pillars.map((p) => p.score) };
    });

    // distrito × pilar (respeita filtro de ano)
    const yrRecs = recs0(valid, filters.year);
    const byDistrict = districts.map((d) => {
      const m = calc(yrRecs.filter((r) => r.district === d));
      return { district: d, lri: m.lri, pillars: m.pillars.map((p) => p.score), model: m };
    });

    // mapa de calor: colunas = distritos + total | anos
    const colsD = districts.map((d) => ({ key: d, label: d, model: calc(yrRecs.filter((r) => r.district === d)) }));
    colsD.push({ key: "__total", label: null, total: true, model: calc(yrRecs) });
    const distForYear = recs0(valid, null).filter((r) => !filters.district || r.district === filters.district);
    const colsY = years.map((y) => ({ key: y, label: String(y), model: calc(distForYear.filter((r) => r.year === y)) }));

    // indicadores de apoio à interpretação
    const poor = main.inds.filter((i) => i.cls === "poor");
    const strong = main.inds.filter((i) => i.score >= 2.5);
    const scoredP = main.pillars.filter((p) => p.score != null);
    const weakest = scoredP.length ? scoredP.reduce((a, b) => (b.score < a.score ? b : a)) : null;
    const ordered = CFG.classes.map((c) => c.min);
    let gap = null, nextClass = null;
    if (main.lri != null) {
      const nxt = CFG.classes.find((c) => c.min > main.lri);
      if (nxt) { gap = nxt.min - main.lri; nextClass = nxt.key; }
    }
    let delta = null, prevYear = null, curYear = null;
    const evo = evolution.filter((e) => e.lri != null);
    if (evo.length >= 2) {
      const cur = filters.year ? evo.find((e) => String(e.year) === String(filters.year)) || evo[evo.length - 1] : evo[evo.length - 1];
      const idx = evo.indexOf(cur);
      if (idx > 0) { delta = cur.lri - evo[idx - 1].lri; prevYear = evo[idx - 1].year; curYear = cur.year; }
    }
    const provinces = [...new Set(recs.map((r) => r.province).filter(Boolean))];
    const covDistricts = [...new Set(recs.map((r) => r.district).filter(Boolean))];
    const priorities = main.inds.filter((i) => i.score != null).slice().sort((a, b) => a.score - b.score).filter((i) => i.score < 2.5).slice(0, 5);

    return {
      recs, main, years, districts, evolution, byDistrict, colsD, colsY,
      interp: { poor, strong, weakest, gap, nextClass, delta, prevYear, curYear, provinces, covDistricts, priorities,
        indicatorsCovered: main.inds.length, indicatorsTotal: C.IND.length }
    };
  }
  const recs0 = (valid, year) => valid.filter((r) => r.ind && (!year || String(r.year) === String(year)));

  window.LRI = { classOf, classColor, mean, statusKey, enrich, calc, build };
})();
