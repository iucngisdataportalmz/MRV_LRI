/* Leitura do Feature Service (paginada) + dados de demonstração (?demo=1) */
(function () {
  const CFG = window.LRI_CONFIG, F = CFG.fields;

  const pick = (attrs, name) => {
    if (name in attrs) return attrs[name];
    const k = Object.keys(attrs).find((x) => x.toLowerCase() === name.toLowerCase());
    return k ? attrs[k] : null;
  };
  const toDate = (v) => (v == null || v === "" ? null : new Date(typeof v === "number" ? v : Date.parse(v)));

  function toRecord(attrs) {
    const num = pick(attrs, F.value);
    const cd = toDate(pick(attrs, F.collectDate)), sd = toDate(pick(attrs, F.submitDate));
    const ref = cd || sd;
    const r = {
      id: pick(attrs, F.id),
      province: pick(attrs, F.province) || "",
      district: pick(attrs, F.district) || "",
      indicatorRaw: pick(attrs, F.indicator) || "",
      subRaw: pick(attrs, F.subIndicator) || "",
      value: num == null || num === "" ? null : Number(num),
      source: pick(attrs, F.source) || "",
      season: pick(attrs, F.season) || "",
      collectDate: cd, submitDate: sd,
      institution: pick(attrs, F.institution) || "",
      statusRaw: pick(attrs, F.status),
      year: ref && !isNaN(ref) ? ref.getFullYear() : null
    };
    r.statusKey = window.LRI.statusKey(r.statusRaw);
    return window.LRI.enrich(r);
  }

  async function queryPage(where, offset) {
    const p = new URLSearchParams({
      where, outFields: "*", returnGeometry: "false", f: "json",
      resultOffset: String(offset), resultRecordCount: String(CFG.pageSize), orderByFields: F.id
    });
    const url = `${CFG.featureService}/${CFG.layerId}/query?${p}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    if (j.error) throw new Error(j.error.message || "ArcGIS error");
    return j;
  }

  // Só carrega registos VALIDADOS — nada de pendentes/rejeitados chega ao dashboard.
  async function loadValidated() {
    if (new URLSearchParams(location.search).get("demo")) return { records: demo(), demo: true };
    const clause = CFG.status.validated.map((v) => `${F.status}='${String(v).replace(/'/g, "''")}'`).join(" OR ");
    let all = [], offset = 0;
    for (let guard = 0; guard < 200; guard++) {
      const j = await queryPage(clause, offset);
      const feats = j.features || [];
      all = all.concat(feats.map((f) => toRecord(f.attributes)));
      if (!j.exceededTransferLimit || !feats.length) break;
      offset += feats.length;
    }
    return { records: all.filter((r) => r.statusKey === "validated"), demo: false };
  }

  // Contagem por estado (opcional — falha em silêncio se a camada pública só expõe validados)
  async function loadStatusCounts() {
    try {
      const p = new URLSearchParams({
        where: "1=1", groupByFieldsForStatistics: F.status, f: "json",
        outStatistics: JSON.stringify([{ statisticType: "count", onStatisticField: F.id, outStatisticFieldName: "n" }])
      });
      const res = await fetch(`${CFG.featureService}/${CFG.layerId}/query?${p}`);
      const j = await res.json();
      if (j.error || !j.features) return null;
      const out = { validated: 0, pending: 0, rejected: 0 };
      j.features.forEach((f) => {
        const a = f.attributes; out[window.LRI.statusKey(pick(a, F.status))] += pick(a, "n") || 0;
      });
      return out;
    } catch (e) { return null; }
  }

  // ---------- DEMO (dados fictícios, só para pré-visualizar o layout) ----------
  function demo() {
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const C = window.LRI_CATALOG, out = [];
    let id = 1;
    ["Bárue", "Vanduzi"].forEach((d, di) => {
      [2025, 2026].forEach((y, yi) => {
        C.IND.forEach((ind) => {
          ind.subs.forEach((sub) => {
            if (rnd() < 0.15) return;
            const r = sub.rule; let lo, hi;
            if (r.t === "rng") { lo = r.m[0][0] * 0.6; hi = r.e[0][1] * 1.2; }
            else { const [a, , c] = r.th; lo = Math.min(a, c) * 0.5; hi = Math.max(a, c) * 1.5; }
            for (let k = 0; k < 2; k++) {
              const v = +(lo + rnd() * (hi - lo) + yi * (hi - lo) * 0.03).toFixed(2);
              out.push(window.LRI.enrich({
                id: id++, province: "Manica", district: d, indicatorRaw: ind.pt, subRaw: sub.pt, value: v,
                source: rnd() < 0.5 ? "Campo" : "Laboratorio", season: rnd() < 0.5 ? "Seca" : "Chuvosa",
                collectDate: new Date(y, 5 + k, 10), submitDate: new Date(y, 6 + k, 2), institution: "DEMO",
                statusRaw: "Validado", statusKey: "validated", year: y
              }));
            }
          });
        });
      });
    });
    return out;
  }

  window.LRI_DATA = { loadValidated, loadStatusCounts };
})();
