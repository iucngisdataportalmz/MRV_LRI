/* Exportações: relatório PDF completo (jsPDF), dados em Excel (SheetJS) e CSV */
(function () {
  const CFG = window.LRI_CONFIG, C = window.LRI_CATALOG, L = window.LRI, I = window.I18N, D = window.DASH;
  const t = I.t;
  const f2 = (n) => I.fmt(n, 2);
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const textOn = (k) => (k === "moderate" || k === "good" ? [29, 42, 36] : [255, 255, 255]);
  const iname = (x) => I.pick(x);
  const stamp = () => { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`; };
  const filtersText = () => {
    const f = D.S.filters;
    return `${t("fYear")}: ${f.year || t("fAll")} | ${t("fDistrict")}: ${f.district || t("fAll")}`;
  };
  // jsPDF (Helvetica/WinAnsi) não tem alguns símbolos
  const clean = (s) => String(s == null ? "" : s).replace(/≥/g, ">=").replace(/≤/g, "<=").replace(/[▲▼⚠→]/g, "").replace(/[^\x00-\xFF–—‘’“”…•]/g, "");
  const htmlToText = (h) => { const d = document.createElement("div"); d.innerHTML = h.replace(/<\/(p|li|h3|ul|ol)>/gi, "$&\n").replace(/<li>/gi, "• "); return d.textContent.replace(/\n{3,}/g, "\n\n").trim(); };

  function download(blob, name) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // --------------------------------------------------------------- tabelas base
  function recordRows() {
    const rows = D.S.tableRecs;
    const head = [t("id"), t("province"), t("district"), t("pillar"), t("indicator"), t("subIndicator"), t("value"), t("unit"), t("scoreCol"), t("classCol"), t("source"), t("season"), t("collectDate"), t("submitDate"), t("institution"), t("year"), t("status")];
    const body = rows.map((r) => [r.id, r.province, r.district, r.pillar ? I.pick(C.PILLARS.find((p) => p.id === r.pillar)) : "", r.ind ? iname(r.ind) : r.indicatorRaw, r.sub ? iname(r.sub) : r.subRaw,
      r.value, r.sub ? r.sub.unit : "", r.score == null ? "" : r.score, r.cls ? t(r.cls) : "", r.source, r.season, I.fmtDate(r.collectDate), I.fmtDate(r.submitDate), r.institution, r.year || "", t("validated")]);
    return { head, body };
  }

  // ----------------------------------------------------------------------- EXCEL
  function exportXlsx() {
    const m = D.S.model; if (!m) return;
    const wb = XLSX.utils.book_new();
    const add = (name, aoa, widths) => { const ws = XLSX.utils.aoa_to_sheet(aoa); if (widths) ws["!cols"] = widths.map((w) => ({ wch: w })); XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31)); };

    add(t("sheetSummary"), [
      [t("pdfTitle")], [t("pdfGenerated"), new Date().toLocaleString(I.lang === "en" ? "en-GB" : "pt-PT")], [t("pdfFilters"), filtersText()], [t("onlyValidated")], [],
      [t("lriOverall"), m.main.lri == null ? "" : +m.main.lri.toFixed(3), m.main.cls ? t(m.main.cls) : ""], [],
      [t("iDelta"), m.interp.delta == null ? t("noPrev") : +m.interp.delta.toFixed(3)],
      [t("iPoor"), m.interp.poor.length], [t("iGap"), m.interp.gap == null ? "" : +m.interp.gap.toFixed(3)],
      [t("iWeak"), m.interp.weakest ? iname(m.interp.weakest.pillar) : ""],
      [t("iCover"), `${m.interp.covDistricts.length}/${CFG.targetDistricts.length} (${m.interp.covDistricts.join(", ")})`],
      [t("iPrio"), m.interp.priorities.map((i) => iname(i.ind)).join("; ")],
      [t("iStrong"), m.interp.strong.map((i) => iname(i.ind)).join("; ")]
    ], [34, 60, 16]);
    add(t("sheetPillars"), [[t("pillar"), t("scoreCol"), t("classCol"), t("indicatorsN")]].concat(m.main.pillars.map((p) => [iname(p.pillar), p.score == null ? "" : +p.score.toFixed(3), p.cls ? t(p.cls) : "", p.nInd])), [20, 12, 14, 12]);
    add(t("sheetInd"), [[t("pillar"), "#", t("indicator"), t("meanValue"), t("unit"), t("scoreCol"), t("classCol"), "n"]].concat(m.main.inds.map((i) => [iname(C.PILLARS.find((p) => p.id === i.ind.p)), i.ind.n, iname(i.ind), i.mean == null ? "" : +i.mean.toFixed(3), i.unit, +i.score.toFixed(3), t(i.cls), i.n])), [14, 5, 60, 12, 10, 10, 12, 6]);
    add(t("sheetSub"), [[t("pillar"), t("indicator"), t("subIndicator"), t("meanValue"), t("unit"), t("scoreCol"), t("classCol"), "n"]].concat(m.main.subs.map((s) => [iname(C.PILLARS.find((p) => p.id === s.ind.p)), iname(s.ind), iname(s.sub), +s.mean.toFixed(3), s.sub.unit, s.score, t(s.cls), s.n])), [14, 50, 55, 12, 10, 10, 12, 6]);
    const hd = D.heatData(m, "district");
    add(t("sheetHeat"), [[t("indicator") + " / " + t("subIndicator")].concat(hd.cols.map((c) => (c.total ? t("total") : c.label)))].concat(hd.rows.map((r) => [(r.type === "sub" ? "   " + iname(r.sub) : r.ind.n + ". " + iname(r.ind))].concat(r.cells.map((c) => (c ? +c.score.toFixed(3) : ""))))), [60]);
    const rr = recordRows();
    add(t("sheetRec"), [rr.head].concat(rr.body), [8, 12, 12, 12, 45, 50, 10, 10, 9, 11, 12, 10, 13, 13, 16, 7, 11]);
    XLSX.writeFile(wb, `LRI_${I.lang}_${stamp()}.xlsx`);
  }

  function exportCsv() {
    const rr = recordRows();
    const q = (v) => { v = v == null ? "" : String(v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const csv = "﻿" + [rr.head].concat(rr.body).map((r) => r.map(q).join(";")).join("\r\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `LRI_records_${I.lang}_${stamp()}.csv`);
  }

  // ------------------------------------------------------------------------ PDF
  function chartImg(id) {
    const ch = D.S.charts[id]; if (!ch) return null;
    const src = ch.canvas, c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0);
    return { url: c.toDataURL("image/jpeg", 0.92), w: c.width, h: c.height };
  }

  function loadLogo(src) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => { try { const c = document.createElement("canvas"); c.width = im.naturalWidth || 400; c.height = im.naturalHeight || 400; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res({ url: c.toDataURL("image/png"), w: c.width, h: c.height }); } catch (e) { res(null); } };
      im.onerror = () => res(null); im.src = src;
    });
  }

  async function exportPdf() {
    const m = D.S.model; if (!m) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const LG = window.LRI_LOGOS || {};
    const logos = { moz: LG.moz || (await loadLogo("assets/logo-moz.svg")), sus: LG.sus || (await loadLogo("assets/logo-sustain.png")) };
    const putLogo = (lg, x, yy, h) => { if (lg) doc.addImage(lg.url, "PNG", x, yy, (h * lg.w) / lg.h, h); return lg ? (h * lg.w) / lg.h : 0; };
    const PW = 210, PH = 297, M = 14, CW = PW - 2 * M;
    let y = M;
    const need = (h) => { if (y + h > PH - 16) { doc.addPage(); y = 22; } };
    const h2 = (txt) => { need(14); y += 3; doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(31, 77, 58).text(clean(txt), M, y); y += 2; doc.setDrawColor(155, 211, 168).setLineWidth(0.5).line(M, y, M + CW, y); y += 5; };
    const para = (txt, size, color, indent) => {
      doc.setFont("helvetica", "normal").setFontSize(size || 9.5).setTextColor(...(color || [60, 70, 65]));
      const lines = doc.splitTextToSize(clean(txt), CW - (indent || 0));
      lines.forEach((ln) => { need(5); doc.text(ln, M + (indent || 0), y); y += 4.6; });
    };
    const tableOpts = (extra) => Object.assign({ startY: y, margin: { left: M, right: M, top: 22, bottom: 16 }, styles: { font: "helvetica", fontSize: 8, cellPadding: 1.6, overflow: "linebreak", lineColor: [225, 222, 211], lineWidth: 0.1 }, headStyles: { fillColor: [31, 77, 58], textColor: 255, fontStyle: "bold" }, alternateRowStyles: { fillColor: [247, 250, 248] } }, extra);
    const clsStyle = (k) => (k ? { content: clean(t(k)), styles: { fillColor: hex(CFG.classes.find((c) => c.key === k).color), textColor: textOn(k), fontStyle: "bold", halign: "center" } } : "–");

    // capa
    const mw = putLogo(logos.moz, M, 3, 13); putLogo(logos.sus, M + mw + 6, 4.5, 10);
    doc.setFillColor(31, 77, 58).rect(0, 20, PW, 34, "F");
    doc.setTextColor(255).setFont("helvetica", "bold").setFontSize(18).text(clean(t("pdfTitle")), M, 36);
    doc.setFont("helvetica", "normal").setFontSize(10).text(clean(`${t("appSub")}`), M, 43);
    doc.setFontSize(9).text(clean(`${t("pdfGenerated")} ${new Date().toLocaleString(I.lang === "en" ? "en-GB" : "pt-PT")}  |  ${t("pdfFilters")}: ${filtersText()}`), M, 49);
    y = 62;
    para(t("onlyValidated"), 9, [90, 100, 95]); y += 1;

    // LRI e pilares
    h2(t("secLRI"));
    doc.autoTable(tableOpts({
      head: [[t("pillar"), t("scoreCol"), t("classCol"), t("indicatorsN")]],
      body: [[{ content: clean(t("lriOverall")), styles: { fontStyle: "bold" } }, { content: m.main.lri == null ? "–" : f2(m.main.lri), styles: { fontStyle: "bold" } }, clsStyle(m.main.cls), `${m.main.inds.length}/${C.IND.length}`]]
        .concat(m.main.pillars.map((p) => [clean(iname(p.pillar)), p.score == null ? "–" : f2(p.score), clsStyle(p.cls), p.nInd])),
      columnStyles: { 1: { halign: "center" }, 3: { halign: "center" } }
    }));
    y = doc.lastAutoTable.finalY + 4;

    // interpretação
    h2(t("secInterp"));
    const x = m.interp;
    const rows = [
      [t("iDelta"), x.delta == null ? t("noPrev") : `${x.delta > 0 ? "+" : ""}${f2(x.delta)} (${x.curYear} ${t("vs")} ${x.prevYear})`],
      [t("iPoor"), `${x.poor.length}${x.poor.length ? ": " + x.poor.map((i) => iname(i.ind)).join("; ") : ""}`],
      [t("iGap"), m.main.lri == null ? "–" : x.gap == null ? t("topClass") : `${f2(x.gap)} ${t("toReach")} ${t(x.nextClass)}`],
      [t("iWeak"), x.weakest ? `${iname(x.weakest.pillar)} (${f2(x.weakest.score)} · ${t(x.weakest.cls)})` : "–"],
      [t("iCover"), `${x.covDistricts.length}/${CFG.targetDistricts.length} ${t("districtsCovered")}${x.covDistricts.length ? " (" + x.covDistricts.join(", ") + ")" : ""}; ${x.provinces.length} ${t("provincesWord")}; ${x.indicatorsCovered}/${x.indicatorsTotal} ${t("indCovered")}`],
      [t("iPrio"), x.priorities.length ? x.priorities.map((i) => `${iname(i.ind)} (${f2(i.score)})`).join("; ") : t("prioNone")],
      [t("iStrong"), x.strong.length ? x.strong.map((i) => `${iname(i.ind)} (${f2(i.score)})`).join("; ") : t("strongNone")]
    ].map((r) => r.map(clean));
    doc.autoTable(tableOpts({ body: rows, columnStyles: { 0: { fontStyle: "bold", cellWidth: 52, fillColor: [238, 243, 239] } }, styles: { fontSize: 8.5, cellPadding: 2, lineColor: [225, 222, 211], lineWidth: 0.1 } }));
    y = doc.lastAutoTable.finalY + 4;

    // gráficos
    const putPair = (a, b, ta, tb, maxH) => {
      const ia = chartImg(a), ib = b && chartImg(b); const gap = 6, w = b ? (CW - gap) / 2 : CW;
      const hh = (im) => Math.min(maxH || 95, (w * im.h) / im.w);
      const h = Math.max(ia ? hh(ia) : 0, ib ? hh(ib) : 0);
      need(h + 12);
      doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(29, 42, 36);
      doc.text(clean(ta), M, y + 2); if (b) doc.text(clean(tb), M + w + gap, y + 2);
      if (ia) { const ha = hh(ia); doc.addImage(ia.url, "JPEG", M, y + 4, ha === (w * ia.h) / ia.w ? w : (ha * ia.w) / ia.h, ha); }
      if (ib) { const hb = hh(ib); doc.addImage(ib.url, "JPEG", M + w + gap, y + 4, hb === (w * ib.h) / ib.w ? w : (hb * ib.w) / ib.h, hb); }
      y += h + 10;
    };
    h2(t("pdfCharts"));
    putPair("c-ind", "c-pie", t("secIndBar"), t("secClassPie"), 100);
    putPair("c-radar", "c-dist", t("secRadar"), t("secDistPillar"), 100);
    putPair("c-evo", null, t("secEvolution"), "", 80);

    // mapa de calor (distrito + total) e por ano
    const heat = (mode, title) => {
      const hd = D.heatData(m, mode); if (!hd.rows.length) return;
      h2(title);
      doc.autoTable(tableOpts({
        head: [[`${t("indicator")} / ${t("subIndicator")}`].concat(hd.cols.map((c) => clean(c.total ? t("total") : c.label)))],
        body: hd.rows.map((r) => [{ content: clean(r.type === "ind" ? `${r.ind.n}. ${iname(r.ind)}` : "   " + iname(r.sub)), styles: { fontStyle: r.type === "ind" ? "bold" : "normal", fillColor: r.type === "ind" ? [238, 243, 239] : 255 } }]
          .concat(r.cells.map((c) => (c ? { content: f2(c.score), styles: { fillColor: hex(CFG.classes.find((k) => k.key === c.cls).color), textColor: textOn(c.cls), halign: "center", fontStyle: "bold" } } : { content: "–", styles: { halign: "center", textColor: 170 } })))),
        columnStyles: { 0: { cellWidth: 80 } }, alternateRowStyles: {}
      }));
      y = doc.lastAutoTable.finalY + 4;
    };
    heat("district", t("secHeat")); if (m.colsY.length > 1) heat("year", t("secHeat") + " – " + t("heatByYear"));

    // tabelas
    h2(t("secSubTable"));
    doc.autoTable(tableOpts({
      head: [[t("pillar"), t("indicator"), t("subIndicator"), t("meanValue"), t("scoreCol"), t("classCol")].map(clean)],
      body: m.main.subs.map((s) => [clean(iname(C.PILLARS.find((p) => p.id === s.ind.p))), clean(`${s.ind.n}. ${iname(s.ind)}`), clean(iname(s.sub)), clean(`${f2(s.mean)} ${s.sub.unit || ""}`), s.score, clsStyle(s.cls)]),
      columnStyles: { 0: { cellWidth: 20 }, 3: { halign: "right", cellWidth: 24 }, 4: { halign: "center", cellWidth: 16 }, 5: { cellWidth: 22 } }
    }));
    y = doc.lastAutoTable.finalY + 4;
    h2(t("secIndTable"));
    doc.autoTable(tableOpts({
      head: [[t("pillar"), t("indicator"), t("meanValue"), t("scoreCol"), t("classCol")].map(clean)],
      body: m.main.inds.map((i) => [clean(iname(C.PILLARS.find((p) => p.id === i.ind.p))), clean(`${i.ind.n}. ${iname(i.ind)}`), i.mean == null ? clean(t("mixedUnits")) : clean(`${f2(i.mean)} ${i.unit || ""}`), f2(i.score), clsStyle(i.cls)]),
      columnStyles: { 0: { cellWidth: 22 }, 2: { halign: "right", cellWidth: 28 }, 3: { halign: "center", cellWidth: 18 }, 4: { cellWidth: 24 } }
    }));
    y = doc.lastAutoTable.finalY + 4;

    h2(t("secValDist") + " / " + t("secScoreDist"));
    putPair("c-hist", "c-scores", t("secValDist"), t("secScoreDist"), 90);

    // registos
    const rr = recordRows();
    h2(`${t("secRecords")} (${rr.body.length})`);
    const keep = [0, 2, 4, 5, 6, 7, 8, 9, 12];
    doc.autoTable(tableOpts({
      head: [keep.map((i) => clean(rr.head[i]))], body: rr.body.map((r) => keep.map((i) => clean(typeof r[i] === "number" && i === 6 ? f2(r[i]) : r[i]))),
      styles: { fontSize: 7, cellPadding: 1.2, lineColor: [225, 222, 211], lineWidth: 0.1 }
    }));
    y = doc.lastAutoTable.finalY + 4;

    // metodologia
    h2(t("secMethod"));
    htmlToText(t("methodHtml")).split("\n").forEach((ln) => {
      if (!ln.trim()) { y += 1.5; return; }
      const isH = !/^•|^\d/.test(ln) && ln.length < 48 && !/[.:]$/.test(ln);
      if (isH) { need(8); y += 1; doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(47, 111, 85).text(clean(ln), M, y); y += 4.8; }
      else para(ln, 9, [60, 70, 65], ln.startsWith("•") ? 2 : 0);
    });

    // rodapé
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i); doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(130);
      if (i > 1) { const w1 = putLogo(logos.moz, M, 5, 11); putLogo(logos.sus, M + w1 + 5, 6, 9); doc.setDrawColor(225, 222, 211).setLineWidth(0.3).line(M, 18, PW - M, 18); }
      doc.text(clean(`${t("appName")} · MRV`), M, PH - 8);
      doc.text(clean(`${t("pdfPage")} ${i}/${n}`), PW - M, PH - 8, { align: "right" });
    }
    doc.save(`LRI_report_${I.lang}_${stamp()}.pdf`);
  }

  async function busy(btn, fn) {
    const old = btn.textContent; btn.disabled = true; btn.textContent = t("generating");
    try { await fn(); } catch (e) { console.error(e); alert("Erro / Error: " + e.message); } finally { btn.disabled = false; btn.textContent = old; }
  }
  const $ = (id) => document.getElementById(id);
  $("btn-pdf").onclick = () => busy($("btn-pdf"), exportPdf);
  $("btn-xlsx").onclick = () => busy($("btn-xlsx"), exportXlsx);
  $("btn-xlsx2").onclick = () => busy($("btn-xlsx2"), exportXlsx);
  $("btn-csv").onclick = exportCsv;
  window.LRI_EXPORT = { exportPdf, exportXlsx, exportCsv };
})();
