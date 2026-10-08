/* Biblioteca de documentos (lê data/documents.js) — pesquisa + filtro por categoria + descarregar */
(function () {
  const I = window.I18N, t = I.t, $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = { data: null, cat: "", q: "" };
  const loc = (o) => (o && typeof o === "object" ? o[I.lang] || o.pt || o.en || "" : o || "");

  function load() {
    if (S.data) return;
    if (!window.LRI_DOCUMENTS) { $("docs-list").innerHTML = `<div class="state"><div class="err">${esc(t("docsError"))}<br><small>data/documents.js</small></div></div>`; return; }
    S.data = window.LRI_DOCUMENTS; render();
  }

  function render() {
    if (!S.data) return;
    const docs = (S.data.documents || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0) || loc(a.title).localeCompare(loc(b.title)));
    const cats = S.data.categories || {};
    const used = [...new Set(docs.map((d) => d.category || "outro"))];
    $("docs-cats").innerHTML = [`<button type="button" data-cat="" aria-pressed="${S.cat === ""}">${esc(t("fAll"))} (${docs.length})</button>`]
      .concat(used.map((c) => `<button type="button" data-cat="${esc(c)}" aria-pressed="${S.cat === c}">${esc(loc(cats[c]) || c)} (${docs.filter((d) => (d.category || "outro") === c).length})</button>`)).join("");
    $("docs-cats").querySelectorAll("button").forEach((b) => (b.onclick = () => { S.cat = b.getAttribute("data-cat"); render(); }));

    const q = S.q.trim().toLowerCase();
    const list = docs.filter((d) => (!S.cat || (d.category || "outro") === S.cat) &&
      (!q || [loc(d.title), loc(d.description), d.authors, d.publisher, d.year].join(" ").toLowerCase().includes(q)));
    $("docs-list").innerHTML = list.length ? list.map((d) => {
      const meta = [d.language, d.pages ? `${d.pages} ${t("docsPages")}` : "", d.size, d.year].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
      const by = [d.authors, d.publisher].filter(Boolean).join(" · ");
      const fname = String(d.file).split("/").pop();
      return `<article class="doc">
        <a class="thumb" href="${esc(d.file)}" target="_blank" rel="noopener" aria-label="${esc(t("docsOpen"))}: ${esc(loc(d.title))}">${d.thumb ? `<img src="${esc(d.thumb)}" alt="" loading="lazy">` : `<span class="pdfico">PDF</span>`}</a>
        <div class="body">
          <span class="tag">${esc(loc(cats[d.category]) || d.category || "")}</span>
          <h3>${esc(loc(d.title))}</h3>
          ${by ? `<p class="by">${esc(by)}</p>` : ""}
          <p>${esc(loc(d.description))}</p>
          <div class="meta">${meta}${d.license ? `<span>${esc(d.license)}</span>` : ""}</div>
          <div class="btns"><a class="btn" href="${esc(d.file)}" download="${esc(fname)}">⬇ ${esc(t("download"))} PDF</a><a class="btn ghost" href="${esc(d.file)}" target="_blank" rel="noopener">${esc(t("docsOpen"))}</a></div>
        </div></article>`;
    }).join("") : `<p class="muted">${esc(t("docsNone"))}</p>`;
  }

  $("docs-search").oninput = (e) => { S.q = e.target.value; render(); };
  window.addEventListener("lri-lang", render);
  window.LRI_DOCS = { load };
})();
