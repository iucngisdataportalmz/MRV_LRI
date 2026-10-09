/* Mapa de distritos coloridos pela classe do LRI geral (SVG, sem bibliotecas externas) */
(function () {
  const CFG = window.LRI_CONFIG, C = window.LRI_CATALOG, L = window.LRI, I = window.I18N, D = window.DASH;
  const t = I.t, $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const GREY = "#d9d6ca", NS = "http://www.w3.org/2000/svg";
  const FEATS = window.LRI_DISTRICTS || [];
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
  const stripCity = (s) => norm(s).replace(/^cidade (de |da |do )?/, "");
  const NON_DISTRICT = new Set(["ilha licom", "ilha risunodo", "lago niassa"]);

  // projecção simples (equirectangular corrigida pela latitude média)
  const K = Math.cos(17 * Math.PI / 180);
  const px = (lon) => lon * K, py = (lat) => -lat;
  FEATS.forEach((f) => {
    f.key = norm(f.d); f.ckey = stripCity(f.d); f.pkey = stripCity(f.p);
    f.skip = NON_DISTRICT.has(f.key);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    f.path = f.r.map((ring) => "M" + ring.map(([lo, la], i) => {
      const x = px(lo), y = py(la); if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      return x.toFixed(3) + " " + y.toFixed(3);
    }).join("L") + "Z").join("");
    f.bb = [x0, y0, x1, y1];
  });

  const M = { sel: null, items: [], fmap: new Map(), vb: null };
  const dName = (f) => f.d.replace(/_/g, " ").toLowerCase().replace(/(^|\s|-)\S/g, (c) => c.toUpperCase()).replace(/\b(De|Da|Do)\b/g, (c) => c.toLowerCase());

  // liga cada distrito dos dados (nome da camada) a uma feição do shapefile
  function findFeat(district, province) {
    const k = norm(district), ck = stripCity(district), pk = stripCity(province);
    const c = FEATS.filter((f) => !f.skip && (f.key === k || f.ckey === ck));
    if (!c.length) return null;
    return c.find((f) => f.pkey === pk) || c[0];
  }

  function compute() {
    const S = D.S, yr = S.filters.year;
    const recs = S.valid.filter((r) => r.ind && (!yr || String(r.year) === String(yr)));
    const groups = new Map();
    recs.forEach((r) => { if (!r.district) return; const k = r.district + "|" + (r.province || ""); (groups.get(k) || groups.set(k, []).get(k)).push(r); });
    const byFeat = new Map(); const unmatched = [];
    groups.forEach((rs) => {
      const f = findFeat(rs[0].district, rs[0].province);
      if (!f) { unmatched.push(rs[0].district); return; }
      const m = L.calc(rs);
      byFeat.set(f, { f, name: rs[0].district, province: rs[0].province || dName({ d: f.p }), lri: m.lri, cls: m.cls, n: m.n, pillars: m.pillars.map((p) => ({ id: p.pillar.id, score: p.score, cls: p.cls })) });
    });
    M.byFeat = byFeat; M.unmatched = unmatched;
    M.items = [...byFeat.values()].filter((x) => x.lri != null).sort((a, b) => b.lri - a.lri);
  }

  function bounds(feats) {
    let b = [1e9, 1e9, -1e9, -1e9];
    feats.forEach((f) => { b = [Math.min(b[0], f.bb[0]), Math.min(b[1], f.bb[1]), Math.max(b[2], f.bb[2]), Math.max(b[3], f.bb[3])]; });
    return b;
  }

  function svgMarkup(sel) {
    const prov = D.S.filters.province;
    const pk = prov ? stripCity(prov) : "";
    // com província seleccionada: faz zoom aos distritos dessa província (por dados ou por shapefile)
    let focus = FEATS.filter((f) => !f.skip);
    if (pk) {
      const f2 = focus.filter((f) => f.pkey === pk);
      if (f2.length) focus = f2;
    }
    const b = bounds(focus), pad = 0.15;
    const vb = [b[0] - pad, b[1] - pad, b[2] - b[0] + 2 * pad, b[3] - b[1] + 2 * pad];
    M.vb = vb;
    const inFocus = new Set(focus);
    const body = FEATS.filter((f) => !f.skip).map((f) => {
      const d = M.byFeat.get(f), has = d && d.lri != null, fill = has ? L.classColor(d.cls) : GREY;
      const dim = !inFocus.has(f);
      const cls = "md" + (has ? " has" : "") + (sel === f ? " sel" : "") + (dim ? " dim" : "");
      return `<path class="${cls}" data-i="${FEATS.indexOf(f)}" d="${f.path}" fill="${fill}" fill-rule="evenodd"/>`;
    }).join("");
    return { vb, markup: body };
  }

  const pName = (id) => I.pick(C.PILLARS.find((p) => p.id === id));
  const f2 = (n) => I.fmt(n, 2);

  function tipHtml(f) {
    const d = M.byFeat.get(f);
    let h = `<b>${esc(d ? d.name : dName(f))}</b><span class="mt-p">${esc(dName({ d: f.p }))}</span>`;
    if (!d || d.lri == null) return h + `<div class="mt-n">${esc(t("mapNoData"))}</div>`;
    h += `<div class="mt-l"><i style="background:${L.classColor(d.cls)}"></i>LRI ${f2(d.lri)} · ${esc(t(d.cls))}</div>`;
    h += d.pillars.map((p) => `<div class="mt-r"><span>${esc(pName(p.id))}</span><b>${p.score == null ? "–" : f2(p.score)}</b></div>`).join("");
    return h + `<div class="mt-n">${esc(t("mapRecords"))}: ${d.n}</div>`;
  }

  function cardHtml(f) {
    if (!f) return `<p class="mp-hint">${esc(t("mapHint"))}</p>`;
    const d = M.byFeat.get(f);
    let h = `<div class="mc-t">${esc(d ? d.name : dName(f))}<small>${esc(dName({ d: f.p }))}</small></div>`;
    if (!d || d.lri == null) return h + `<p class="mp-hint">${esc(t("mapNoData"))}</p>`;
    h += `<div class="mc-lri" style="background:${L.classColor(d.cls)};color:${d.cls === "moderate" || d.cls === "good" ? "#1d2a24" : "#fff"}"><span>LRI</span><b>${f2(d.lri)}</b><em>${esc(t(d.cls))}</em></div>`;
    h += `<div class="mc-pil">` + d.pillars.map((p) => `<div><span>${esc(pName(p.id))}</span><b style="color:${p.score == null ? "#888" : L.classColor(p.cls)}">${p.score == null ? "–" : f2(p.score)}</b></div>`).join("") + `</div>`;
    return h + `<div class="mc-n">${esc(t("mapRecords"))}: ${d.n}</div>`;
  }

  function listHtml() {
    const prov = D.S.filters.province;
    let items = M.items; if (prov) items = items.filter((x) => stripCity(x.province) === stripCity(prov));
    if (!items.length) return `<p class="mp-hint">${esc(t("mapNoData"))}</p>`;
    return items.map((x) => `<button type="button" class="ml-i${M.sel === x.f ? " on" : ""}" data-i="${FEATS.indexOf(x.f)}"><i style="background:${L.classColor(x.cls)}"></i><span>${esc(x.name)}</span><b>${f2(x.lri)}</b></button>`).join("");
  }

  function legendHtml() {
    return CFG.classes.slice().reverse().map((c) => `<li><i style="background:${c.color}"></i>${esc(t(c.key))}</li>`).join("") + `<li><i style="background:${GREY}"></i>${esc(t("mapNoData"))}</li>`;
  }

  function select(f) {
    M.sel = f; $("map-card").innerHTML = cardHtml(f);
    document.querySelectorAll("#map-svg .md").forEach((p) => p.classList.toggle("sel", FEATS[+p.dataset.i] === f));
    document.querySelectorAll("#map-list .ml-i").forEach((b) => b.classList.toggle("on", FEATS[+b.dataset.i] === f));
    const on = document.querySelector("#map-list .ml-i.on"); if (on && on.scrollIntoView) { const l = $("map-list"); l.scrollTop = on.offsetTop - l.offsetTop - 40; }
    const p = document.querySelector("#map-svg .md.sel"); if (p && p.parentNode) p.parentNode.appendChild(p);
  }

  // dimensiona o SVG com largura/altura explícitas (alguns telemóveis não calculam bem height:auto em SVG)
  function fit() {
    const host = $("map-svg"), svg = host && host.firstElementChild; if (!svg || !M.vb) return;
    const avail = host.clientWidth || (host.parentElement && host.parentElement.clientWidth) || window.innerWidth - 60;
    const aspect = M.vb[2] / M.vb[3], maxH = window.innerWidth <= 860 ? 520 : 740;
    let h = Math.min(maxH, avail / aspect), w = h * aspect;
    if (w > avail) { w = avail; h = w / aspect; }
    svg.setAttribute("width", Math.round(w)); svg.setAttribute("height", Math.round(h));
    svg.style.width = Math.round(w) + "px"; svg.style.height = Math.round(h) + "px";
  }

  function render() {
    const host = $("map-svg"); if (!host || !FEATS.length || !D.S.valid) return;
    compute();
    const dsel = D.S.filters.district;
    if (dsel) { const hit = [...M.byFeat.values()].find((x) => x.name === dsel); M.sel = hit ? hit.f : M.sel; }
    else if (M.sel && M.byFeat.get(M.sel)) M.sel = null;
    const s = svgMarkup(M.sel);
    host.innerHTML = `<svg viewBox="${s.vb.map((v) => v.toFixed(3)).join(" ")}" xmlns="${NS}" role="img" aria-label="${esc(t("mapTitle"))}" preserveAspectRatio="xMidYMid meet">${s.markup}</svg>`;
    fit();
    $("map-legend").innerHTML = legendHtml();
    $("map-list").innerHTML = listHtml();
    $("map-card").innerHTML = cardHtml(M.sel);
    const un = $("map-note"); un.textContent = M.unmatched.length ? t("mapUnmatched") + " " + [...new Set(M.unmatched)].join(", ") : "";
    const p = document.querySelector("#map-svg .md.sel"); if (p && p.parentNode) p.parentNode.appendChild(p);
  }

  // clique: filtra o resto do painel pelo distrito (se tiver dados) e mostra o cartão
  function pick(f) {
    const d = M.byFeat.get(f);
    if (d && d.lri != null && d.name) { if (D.S.filters.district !== d.name) { M.sel = f; } D.toggleFilter("district", d.name); }
    else select(M.sel === f ? null : f);
  }

  function bind() {
    const host = $("map-svg"), tip = $("map-tip"); if (!host) return;
    const move = (e) => {
      const r = host.getBoundingClientRect(); let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
      tip.style.left = Math.min(x, r.width - 190) + "px"; tip.style.top = Math.min(y, r.height - 20) + "px";
    };
    host.addEventListener("mousemove", (e) => {
      const p = e.target.closest && e.target.closest(".md");
      if (!p) { tip.hidden = true; return; }
      tip.innerHTML = tipHtml(FEATS[+p.dataset.i]); tip.hidden = false; move(e);
    });
    host.addEventListener("mouseleave", () => (tip.hidden = true));
    host.addEventListener("click", (e) => {
      const p = e.target.closest && e.target.closest(".md"); if (!p) return;
      pick(FEATS[+p.dataset.i]);
    });
    $("map-list").addEventListener("click", (e) => {
      const b = e.target.closest(".ml-i"); if (b) pick(FEATS[+b.dataset.i]);
    });
  }

  // imagem do mapa para o PDF (SVG -> PNG)
  function image(px_w) {
    return new Promise((res) => {
      const svg = document.querySelector("#map-svg svg"); if (!svg) return res(null);
      const vb = M.vb, w = px_w || 700, h = Math.round((w * vb[3]) / vb[2]);
      const clone = svg.cloneNode(true); clone.setAttribute("width", w); clone.setAttribute("height", h); clone.style.aspectRatio = "";
      clone.querySelectorAll(".md").forEach((p) => { p.setAttribute("stroke", "#fff"); p.setAttribute("stroke-width", "0.012"); p.removeAttribute("class"); });
      const data = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
      const im = new Image();
      im.onload = () => { try { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h); res({ url: c.toDataURL("image/jpeg", 0.92), w, h }); } catch (e) { res(null); } };
      im.onerror = () => res(null); im.src = data;
    });
  }

  window.LRI_MAP = { render, image, items: () => M.items };
  bind();
  window.addEventListener("lri-render", render);
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(fit, 120); });
  window.addEventListener("orientationchange", () => setTimeout(fit, 200));
  if (window.ResizeObserver && $("map-svg")) new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(fit, 60); }).observe($("map-svg"));
})();
