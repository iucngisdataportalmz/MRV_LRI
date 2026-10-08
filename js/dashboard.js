/* Dashboard: KPIs, cartões de interpretação, gráficos (Chart.js) e tabelas */
(function () {
  const CFG = window.LRI_CONFIG, C = window.LRI_CATALOG, L = window.LRI, I = window.I18N;
  const t = I.t, $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cname = (k) => t(k);
  const ccolor = L.classColor;
  const pcolor = (id) => (C.PILLARS.find((p) => p.id === id) || {}).color;
  const pname = (id) => I.pick(C.PILLARS.find((p) => p.id === id));
  const iname = (ind) => I.pick(ind);
  const sname = (sub) => I.pick(sub);
  const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const f2 = (n) => I.fmt(n, 2);
  const textOn = (k) => (k === "moderate" || k === "good" ? "#1d2a24" : "#fff");

  const S = { valid: [], filters: { year: "", province: "", district: "" }, heat: "district", sub: "", page: 0, q: "", charts: {}, model: null, tableRecs: [] };
  window.DASH = { S };

  Chart.defaults.font.family = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  Chart.defaults.color = "#4d5b54";
  Chart.defaults.borderColor = "#e6e3d8";
  Chart.defaults.animation = { duration: 350 };
  // linhas-guia dos limiares de classe (1,5 · 2,5 · 3,5)
  const guides = {
    id: "guides",
    beforeDatasetsDraw(ch, a, o) {
      if (!o || !o.axis) return;
      const sc = ch.scales[o.axis], area = ch.chartArea; if (!sc) return;
      const c = ch.ctx; c.save(); c.setLineDash([4, 4]); c.lineWidth = 1; c.strokeStyle = "rgba(60,80,70,.35)";
      [1.5, 2.5, 3.5].forEach((v) => {
        c.beginPath();
        if (o.axis === "y") { const y = sc.getPixelForValue(v); c.moveTo(area.left, y); c.lineTo(area.right, y); }
        else { const x = sc.getPixelForValue(v); c.moveTo(x, area.top); c.lineTo(x, area.bottom); }
        c.stroke();
      });
      c.restore();
    }
  };
  Chart.register(guides);

  function mk(id, cfg, label) {
    if (S.charts[id]) S.charts[id].destroy();
    const cv = $(id); cv.setAttribute("aria-label", label || "");
    S.charts[id] = new Chart(cv, cfg);
    return S.charts[id];
  }
  const empty = (id, on) => { const c = $(id).closest(".chart"); if (c) c.style.opacity = on ? 0.25 : 1; };

  // ---------------------------------------------------------------- filtros
  function fillFilters(m) {
    const ys = $("f-year"), ds = $("f-district"), ps = $("f-province");
    const opt = (v, l, sel) => `<option value="${esc(v)}"${sel ? " selected" : ""}>${esc(l)}</option>`;
    ys.innerHTML = opt("", t("fAll"), !S.filters.year) + m.years.map((y) => opt(y, y, String(S.filters.year) === String(y))).join("");
    ps.innerHTML = opt("", t("fAll"), !S.filters.province) + m.provinces.map((p) => opt(p, p, S.filters.province === p)).join("");
    ds.innerHTML = opt("", t("fAll"), !S.filters.district) + m.districts.map((d) => opt(d, d, S.filters.district === d)).join("");
  }

  // ------------------------------------------------------------------- KPIs
  function renderKpis(m) {
    const mm = m.main, el = $("kpis");
    const card = (title, score, cls, sub, color, extra) => {
      const pct = score == null ? 0 : Math.max(0, Math.min(100, ((score - 1) / 3) * 100));
      return `<div class="kpi ${extra || ""}" style="--c:${cls ? ccolor(cls) : "#bbb"};--pc:${color || "#fff"}">
        <h4>${color ? '<i class="dot"></i>' : ""}${esc(title)}</h4>
        <div class="big">${score == null ? "–" : f2(score)}</div>
        ${cls ? `<span class="badge ${cls}">${esc(cname(cls))}</span>` : `<span class="sub">${esc(t("noData"))}</span>`}
        <div class="meter" aria-hidden="true"><i style="width:${pct}%"></i></div>
        <div class="sub">${esc(sub)}</div></div>`;
    };
    el.innerHTML = card(t("lriOverall"), mm.lri, mm.cls, `${mm.inds.length}/${C.IND.length} ${t("indicatorsN")} · ${mm.n} ${t("rows")}`, null, "main") +
      mm.pillars.map((p) => card(I.pick(p.pillar), p.score, p.cls, `${p.nInd} ${t("indicatorsN")}`, p.pillar.color)).join("");
  }

  // ------------------------------------------------------ apoio à interpretação
  function renderInterp(m) {
    const x = m.interp, el = $("interp"), mm = m.main;
    const card = (cls, title, body, c) => `<div class="icard ${cls || ""}" style="--c:${c || "var(--brand2)"}"><h4>${esc(title)}</h4>${body}</div>`;
    const li = (i) => `<li><span class="pill ${i.cls}" style="--c:${ccolor(i.cls)}">${f2(i.score)}</span> ${esc(iname(i.ind))}</li>`;

    let delta;
    if (x.delta == null) delta = `<div class="v">–</div><p>${esc(t("noPrev"))}</p>`;
    else { const up = x.delta > 0.0049, dn = x.delta < -0.0049; delta = `<div class="v" style="color:${up ? "#1f8a4c" : dn ? "#c23b2e" : "inherit"}">${up ? "▲ +" : dn ? "▼ " : "= "}${f2(x.delta)}</div><p>${x.curYear} ${esc(t("vs"))} ${x.prevYear}</p>`; }

    const poor = `<div class="v">${x.poor.length}</div><p>${x.poor.length ? x.poor.map((i) => esc(iname(i.ind))).join("; ") : esc(t("none"))}</p>`;
    let gap;
    if (mm.lri == null) gap = `<div class="v">–</div>`;
    else if (x.gap == null) gap = `<div class="v">0,00</div><p>${esc(t("topClass"))}</p>`;
    else gap = `<div class="v">${f2(x.gap)}</div><p>${esc(t("toReach"))} <span class="pill ${x.nextClass}" style="--c:${ccolor(x.nextClass)}">${esc(cname(x.nextClass))}</span></p>`;
    const weak = x.weakest ? `<div class="v" style="color:${x.weakest.pillar.color}">${esc(I.pick(x.weakest.pillar))}</div><p>${f2(x.weakest.score)} · ${esc(cname(x.weakest.cls))}</p>` : `<div class="v">–</div>`;
    const cover = `<div class="v">${x.covDistricts.length}/${CFG.targetDistricts.length}</div><p>${esc(t("districtsCovered"))}${x.covDistricts.length ? ": " + esc(x.covDistricts.join(", ")) : ""}<br>${x.provinces.length} ${esc(t("provincesWord"))}${x.provinces.length ? " (" + esc(x.provinces.join(", ")) + ")" : ""}<br>${x.indicatorsCovered}/${x.indicatorsTotal} ${esc(t("indCovered"))}</p>`;
    const prio = `<p>${esc(x.priorities.length ? t("prioText") : t("prioNone"))}</p>${x.priorities.length ? `<ul>${x.priorities.map(li).join("")}</ul>` : ""}`;
    const strong = `<p>${esc(x.strong.length ? t("strongText") : t("strongNone"))}</p>${x.strong.length ? `<ul>${x.strong.map(li).join("")}</ul>` : ""}`;

    el.innerHTML = card("", t("iDelta"), delta) + card("", t("iPoor"), poor, ccolor("poor")) + card("", t("iGap"), gap) + card("", t("iWeak"), weak, x.weakest ? x.weakest.pillar.color : null) +
      card("", t("iCover"), cover) + card("s3", t("iPrio"), prio, ccolor("poor")) + card("s4", t("iStrong"), strong, ccolor("excellent"));
  }

  // ----------------------------------------------------------------- gráficos
  const scoreScale = (axis) => ({ min: 0, max: 4, ticks: { stepSize: 0.5 }, title: { display: true, text: t("yAxisScore") }, grid: { color: "#eceae0" } });

  function renderCharts(m) {
    const inds = m.main.inds, has = inds.length > 0;

    // 1 · barras horizontais por indicador
    const h = Math.max(380, inds.length * 28 + 70); $("c-ind").closest(".chart").style.height = h + "px";
    mk("c-ind", {
      type: "bar",
      data: { labels: inds.map((i) => short(`${i.ind.n}. ${iname(i.ind)}`, 44)), datasets: [{ data: inds.map((i) => +i.score.toFixed(2)), backgroundColor: inds.map((i) => ccolor(i.cls)), borderRadius: 4, borderSkipped: "start", barThickness: 16 }] },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        scales: { x: Object.assign(scoreScale(), { title: { display: true, text: t("yAxisScore") } }), y: { grid: { display: false }, ticks: { autoSkip: false, font: { size: 11 } } } },
        plugins: { legend: { display: false }, guides: { axis: "x" }, tooltip: { callbacks: { title: (c) => { const i = inds[c[0].dataIndex]; return `${i.ind.n}. ${iname(i.ind)}`; }, label: (c) => `${f2(c.parsed.x)} · ${cname(inds[c.dataIndex].cls)}` } } }
      }
    }, t("secIndBar")); empty("c-ind", !has);
    $("lg-class").innerHTML = CFG.classes.map((c) => `<span style="--c:${c.color}"><i></i>${esc(cname(c.key))}</span>`).join("");

    // 2 · circular por classe
    const counts = CFG.classes.map((c) => inds.filter((i) => i.cls === c.key).length);
    mk("c-pie", {
      type: "doughnut",
      data: { labels: CFG.classes.map((c) => cname(c.key)), datasets: [{ data: counts, backgroundColor: CFG.classes.map((c) => c.color), borderColor: "#fff", borderWidth: 3 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "55%",
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 14 } }, tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed} ${t("indicatorsN")}` } } }
      }
    }, t("secClassPie")); empty("c-pie", !has);

    // 3 · radar por indicador
    mk("c-radar", {
      type: "radar",
      data: { labels: inds.map((i) => short(`${i.ind.n}. ${iname(i.ind)}`, 26)), datasets: [{ label: t("scoreCol"), data: inds.map((i) => +i.score.toFixed(2)), borderColor: "#1f4d3a", backgroundColor: "rgba(47,111,85,.22)", pointBackgroundColor: inds.map((i) => ccolor(i.cls)), pointBorderColor: "#fff", pointRadius: 5, borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { r: { min: 0, max: 4, ticks: { stepSize: 1, backdropColor: "transparent" }, pointLabels: { font: { size: 10 } }, angleLines: { color: "#e6e3d8" } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { title: (c) => { const i = inds[c[0].dataIndex]; return `${i.ind.n}. ${iname(i.ind)}`; }, label: (c) => `${f2(c.parsed.r)} · ${cname(inds[c.dataIndex].cls)}` } } }
      }
    }, t("secRadar")); empty("c-radar", !has);

    // 4 · distrito × pilar (barras verticais agrupadas)
    const dl = m.byDistrict.map((d) => d.district);
    mk("c-dist", {
      type: "bar",
      data: { labels: dl, datasets: C.PILLARS.map((p, pi) => ({ label: I.pick(p), backgroundColor: p.color, borderRadius: 4, borderSkipped: "bottom", data: m.byDistrict.map((d) => (d.pillars[pi] == null ? null : +d.pillars[pi].toFixed(2))) })) },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { y: scoreScale(), x: { grid: { display: false } } },
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true } }, guides: { axis: "y" }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${f2(c.parsed.y)}` } } }
      }
    }, t("secDistPillar")); empty("c-dist", !dl.length);

    // 5 · evolução (linhas)
    const ev = m.evolution;
    mk("c-evo", {
      type: "line",
      data: {
        labels: ev.map((e) => String(e.year)),
        datasets: [{ label: t("lriOverall"), data: ev.map((e) => e.lri), borderColor: "#1d2a24", backgroundColor: "#1d2a24", borderWidth: 3.5, pointRadius: 6, tension: 0.2 }]
          .concat(C.PILLARS.map((p, pi) => ({ label: I.pick(p), data: ev.map((e) => e.pillars[pi]), borderColor: p.color, backgroundColor: p.color, borderWidth: 2, pointRadius: 4, tension: 0.2, spanGaps: true })))
      },
      options: {
        responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
        scales: { y: scoreScale(), x: { grid: { display: false }, title: { display: true, text: t("year") } } },
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true } }, guides: { axis: "y" }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${f2(c.parsed.y)}` } } }
      }
    }, t("secEvolution")); empty("c-evo", !ev.length);

    // 7 · distribuição das pontuações dos sub-indicadores por pilar
    const subs = m.main.subs;
    mk("c-scores", {
      type: "bar",
      data: {
        labels: C.PILLARS.map((p) => I.pick(p)),
        datasets: CFG.classes.map((c, ci) => ({ label: cname(c.key), backgroundColor: c.color, borderColor: "#fff", borderWidth: 2, borderRadius: 3, stack: "s",
          data: C.PILLARS.map((p) => subs.filter((s) => s.ind.p === p.id && Math.round(s.score) === ci + 1).length) }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: t("subsCount") } } },
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y}` } } }
      }
    }, t("secScoreDist")); empty("c-scores", !subs.length);

    renderHist(m);
  }

  // 6 · histograma de valores por sub-indicador
  function renderHist(m) {
    const subs = m.main.subs, sel = $("f-sub");
    if (!subs.find((s) => s.key === S.sub)) S.sub = subs.length ? subs[0].key : "";
    sel.innerHTML = subs.map((s) => `<option value="${esc(s.key)}"${s.key === S.sub ? " selected" : ""}>${esc(s.ind.n + ". " + short(sname(s.sub), 60))}</option>`).join("");
    const g = subs.find((s) => s.key === S.sub);
    if (!g) { mk("c-hist", { type: "bar", data: { labels: [], datasets: [] } }, t("secValDist")); return; }
    const vals = g.vals.slice().sort((a, b) => a - b), n = vals.length;
    const lo = vals[0], hi = vals[n - 1];
    const nb = Math.max(1, Math.min(10, Math.ceil(Math.log2(n) + 1)));
    const w = hi === lo ? 1 : (hi - lo) / nb;
    const bins = Array.from({ length: hi === lo ? 1 : nb }, (_, i) => ({ a: lo + i * w, b: lo + (i + 1) * w, n: 0 }));
    vals.forEach((v) => { let i = hi === lo ? 0 : Math.min(bins.length - 1, Math.floor((v - lo) / w)); bins[i].n++; });
    const fmtv = (v) => I.fmt(v, Math.abs(hi - lo) < 5 ? 2 : 1);
    mk("c-hist", {
      type: "bar",
      data: { labels: bins.map((b) => (hi === lo ? fmtv(lo) : `${fmtv(b.a)}–${fmtv(b.b)}`)), datasets: [{ data: bins.map((b) => b.n), backgroundColor: bins.map((b) => ccolor(L.classOf(C.scoreValue(g.sub.rule, (b.a + b.b) / 2)))), borderRadius: 4, borderSkipped: "bottom", categoryPercentage: 0.95, barPercentage: 0.9 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { grid: { display: false }, title: { display: true, text: `${t("xAxisValue")}${g.sub.unit ? " (" + g.sub.unit + ")" : ""}` } }, y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: t("yAxisCount") } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${t("yAxisCount")}: ${c.parsed.y}` } } }
      }
    }, `${t("secValDist")}: ${sname(g.sub)}`);
  }

  // ------------------------------------------------------------------ tabelas
  const clsCell = (k) => (k ? `<span class="cls ${k}" style="--c:${ccolor(k)}">${esc(cname(k))}</span>` : "–");
  const pillCell = (id) => `<span class="pdot" style="--pc:${pcolor(id)}"></span>${esc(pname(id))}`;
  const unitStr = (u) => (u ? " " + u : "");

  function renderTables(m) {
    const subs = m.main.subs.slice().sort((a, b) => a.ind.n - b.ind.n || a.sub.id.localeCompare(b.sub.id, undefined, { numeric: true }));
    $("t-sub").innerHTML = `<thead><tr><th>${t("pillar")}</th><th class="wrap">${t("indicator")}</th><th class="wrap">${t("subIndicator")}</th><th class="num">${t("meanValue")}</th><th class="num">${t("scoreCol")}</th><th>${t("classCol")}</th></tr></thead><tbody>` +
      (subs.map((s) => `<tr><td>${pillCell(s.ind.p)}</td><td class="wrap">${s.ind.n}. ${esc(iname(s.ind))}</td><td class="wrap">${esc(sname(s.sub))}</td><td class="num">${f2(s.mean)}${esc(unitStr(s.sub.unit))}</td><td class="num">${s.score}</td><td>${clsCell(s.cls)}</td></tr>`).join("") ||
        `<tr><td colspan="6" class="muted">${t("noData")}</td></tr>`) + "</tbody>";
    $("t-ind").innerHTML = `<thead><tr><th>${t("pillar")}</th><th class="wrap">${t("indicator")}</th><th class="num">${t("meanValue")}</th><th class="num">${t("scoreCol")}</th><th>${t("classCol")}</th></tr></thead><tbody>` +
      (m.main.inds.map((i) => `<tr><td>${pillCell(i.ind.p)}</td><td class="wrap">${i.ind.n}. ${esc(iname(i.ind))}</td><td class="num">${i.mean == null ? esc(t("mixedUnits")) : f2(i.mean) + esc(unitStr(i.unit))}</td><td class="num">${f2(i.score)}</td><td>${clsCell(i.cls)}</td></tr>`).join("") ||
        `<tr><td colspan="5" class="muted">${t("noData")}</td></tr>`) + "</tbody>";
  }

  // ------------------------------------------------------------- mapa de calor
  function heatData(m, mode) {
    const cols = mode === "year" ? m.colsY : m.colsD;
    const indNs = new Set(); cols.forEach((c) => c.model.inds.forEach((i) => indNs.add(i.ind.n)));
    const rows = [];
    C.IND.filter((i) => indNs.has(i.n)).forEach((ind) => {
      const subIds = new Set(); cols.forEach((c) => c.model.subs.forEach((s) => { if (s.ind.n === ind.n) subIds.add(s.sub.id); }));
      rows.push({ type: "ind", ind, cells: cols.map((c) => c.model.inds.find((i) => i.ind.n === ind.n) || null) });
      ind.subs.filter((s) => subIds.has(s.id)).forEach((sub) => rows.push({ type: "sub", ind, sub, cells: cols.map((c) => c.model.subs.find((s) => s.key === ind.n + "|" + sub.id) || null) }));
    });
    return { cols, rows };
  }
  function renderHeat(m) {
    const { cols, rows } = heatData(m, S.heat);
    const el = $("t-heat");
    if (!rows.length) { el.innerHTML = `<tbody><tr><td class="muted" style="padding:14px">${t("noData")}</td></tr></tbody>`; return; }
    el.innerHTML = `<thead><tr><th>${t("indicator")} / ${t("subIndicator")}</th>${cols.map((c) => `<th${c.total ? ' class="t"' : ""}>${esc(c.total ? t("total") : c.label)}</th>`).join("")}</tr></thead><tbody>` +
      rows.map((r) => {
        const head = r.type === "ind" ? `<th class="rowh ind">${pillCell(r.ind.p)}${r.ind.n}. ${esc(iname(r.ind))}</th>` : `<th class="rowh sub">${esc(sname(r.sub))}</th>`;
        return `<tr>${head}${r.cells.map((c, ci) => {
          const tc = cols[ci].total ? " t" : "";
          if (!c) return `<td class="na${tc}">–</td>`;
          const unit = r.type === "sub" ? `${f2(c.mean)}${unitStr(r.sub.unit)} · ` : "";
          return `<td class="${tc}" style="background:${ccolor(c.cls)};color:${textOn(c.cls)}" title="${esc(`${r.type === "ind" ? iname(r.ind) : sname(r.sub)}\n${unit}${t("scoreCol")}: ${f2(c.score)} · ${cname(c.cls)} · n=${c.n}`)}">${f2(c.score)}</td>`;
        }).join("")}</tr>`;
      }).join("") + "</tbody>";
    $("lg-heat").innerHTML = CFG.classes.map((c) => `<span style="--c:${c.color}"><i></i>${esc(cname(c.key))}</span>`).join("") + `<span><i style="background:#faf9f5;border:1px solid #ddd"></i>${esc(t("noData"))}</span>`;
  }

  // ---------------------------------------------------------- registos / dados
  const PAGE = 15;
  function recRows() {
    const q = S.q.trim().toLowerCase();
    return S.tableRecs.filter((r) => !q || [r.id, r.district, r.province, r.indicatorRaw, r.subRaw, r.institution, r.source, r.season].join(" ").toLowerCase().includes(q));
  }
  function renderRecords() {
    const rows = recRows(), pages = Math.max(1, Math.ceil(rows.length / PAGE));
    S.page = Math.min(S.page, pages - 1);
    const slice = rows.slice(S.page * PAGE, S.page * PAGE + PAGE);
    $("t-rec").innerHTML = `<thead><tr><th class="num">${t("id")}</th><th>${t("province")}</th><th>${t("district")}</th><th>${t("pillar")}</th><th class="wrap">${t("indicator")}</th><th class="wrap">${t("subIndicator")}</th><th class="num">${t("value")}</th><th class="num">${t("scoreCol")}</th><th>${t("classCol")}</th><th>${t("source")}</th><th>${t("season")}</th><th>${t("collectDate")}</th><th>${t("institution")}</th></tr></thead><tbody>` +
      (slice.map((r) => `<tr><td class="num">${esc(r.id)}</td><td>${esc(r.province)}</td><td>${esc(r.district)}</td><td>${r.pillar ? pillCell(r.pillar) : "–"}</td><td class="wrap">${esc(r.ind ? iname(r.ind) : r.indicatorRaw)}</td><td class="wrap">${esc(r.sub ? sname(r.sub) : r.subRaw)}${r.assumed ? ` <abbr title="${esc(t("assumedWarn"))}">⚠</abbr>` : ""}</td><td class="num">${r.value == null ? "–" : f2(r.value)}${r.sub ? esc(unitStr(r.sub.unit)) : ""}</td><td class="num">${r.score == null ? "–" : r.score}</td><td>${clsCell(r.cls)}</td><td>${esc(r.source)}</td><td>${esc(r.season)}</td><td>${esc(I.fmtDate(r.collectDate))}</td><td>${esc(r.institution)}</td></tr>`).join("") ||
        `<tr><td colspan="13" class="muted">${t("noData")}</td></tr>`) + "</tbody>";
    $("pager").innerHTML = `<span>${rows.length} ${t("rows")}</span><button class="btn small ghost" id="pg-prev" ${S.page === 0 ? "disabled" : ""}>${t("prev")}</button><span>${t("page")} ${S.page + 1} ${t("of")} ${pages}</span><button class="btn small ghost" id="pg-next" ${S.page >= pages - 1 ? "disabled" : ""}>${t("next")}</button>`;
    $("pg-prev").onclick = () => { S.page--; renderRecords(); };
    $("pg-next").onclick = () => { S.page++; renderRecords(); };
  }

  // -------------------------------------------------------- qualidade dos dados
  function renderQuality(m) {
    const tr = S.tableRecs, unk = tr.filter((r) => !r.ind).length, ass = tr.filter((r) => r.assumed).length;
    const low = m.main.subs.filter((s) => s.n < 3).length;
    const last = tr.map((r) => r.submitDate).filter(Boolean).sort((a, b) => b - a)[0];
    const pt = I.lang === "pt";
    const q = (v, l, w) => `<div class="q${w ? " warn" : ""}"><b>${v}</b><span>${esc(l)}</span></div>`;
    $("quality").innerHTML =
      q(tr.length, pt ? "registos validados" : "validated records") +
      q(`${m.main.inds.length}/${C.IND.length}`, pt ? "indicadores com dados" : "indicators with data") +
      q(m.main.subs.length, pt ? "sub-indicadores com dados" : "sub-indicators with data") +
      q(low, pt ? "sub-indicadores com n < 3" : "sub-indicators with n < 3", low > 0) +
      q(unk, pt ? "registos excluídos (não reconhecidos)" : "records excluded (not recognised)", unk > 0) +
      q(ass, pt ? "registos com regra assumida" : "records with assumed rule", ass > 0) +
      q(last ? I.fmtDate(last) : "–", pt ? "última submissão" : "latest submission");
  }

  // --------------------------------------------------------------------- tudo
  function render() {
    const m = L.build(S.valid, S.filters);
    S.model = m;
    S.tableRecs = S.valid.filter((r) => (!S.filters.year || String(r.year) === String(S.filters.year)) && (!S.filters.province || r.province === S.filters.province) && (!S.filters.district || r.district === S.filters.district));
    fillFilters(m); renderKpis(m); renderInterp(m); renderCharts(m); renderTables(m); renderHeat(m); renderRecords(); renderQuality(m);
  }

  function bind() {
    $("f-year").onchange = (e) => { S.filters.year = e.target.value; S.page = 0; render(); };
    $("f-province").onchange = (e) => { S.filters.province = e.target.value; S.filters.district = ""; S.page = 0; render(); };
    $("f-district").onchange = (e) => { S.filters.district = e.target.value; S.page = 0; render(); };
    $("f-sub").onchange = (e) => { S.sub = e.target.value; renderHist(S.model); };
    $("rec-search").oninput = (e) => { S.q = e.target.value; S.page = 0; renderRecords(); };
    document.querySelectorAll("[data-heat]").forEach((b) => (b.onclick = () => {
      S.heat = b.getAttribute("data-heat");
      document.querySelectorAll("[data-heat]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderHeat(S.model);
    }));
  }

  window.DASH.set = (valid) => { S.valid = valid; render(); };
  window.DASH.render = () => { if (S.valid) render(); };
  window.DASH.heatData = heatData;
  window.DASH.recRows = recRows;
  bind();
  window.addEventListener("lri-lang", () => { if (S.model) render(); });
})();
