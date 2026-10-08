/* Arranque: roteamento (#dashboard · #tecnica/submissao · #tecnica/validacao), idioma, carregamento de dados */
(function () {
  const CFG = window.LRI_CONFIG, I = window.I18N, t = I.t, $ = (id) => document.getElementById(id);
  let loaded = false, loading = false, lastUpdate = null, isDemo = false;

  // ---- idioma
  document.querySelectorAll("[data-lang]").forEach((b) => (b.onclick = () => I.set(b.getAttribute("data-lang"))));
  window.addEventListener("lri-lang", () => { showUpdated(); renderCounts(); });

  // ---- links dos iframes (vêm de config.js)
  $("open-survey").href = CFG.surveyUrl;
  $("open-exp").href = CFG.experienceUrl;
  const frames = { survey: false, exp: false };

  // ---- rotas
  function route() {
    const h = (location.hash || "#dashboard").replace(/^#/, "");
    const [view, tab] = h.split("/");
    const tech = view === "tecnica", docs = view === "documentos";
    $("view-dashboard").hidden = tech || docs; $("view-tecnica").hidden = !tech; $("view-docs").hidden = !docs;
    $("nav-dashboard").setAttribute("aria-current", !tech && !docs ? "page" : "false");
    $("nav-docs").setAttribute("aria-current", docs ? "page" : "false");
    $("nav-tecnica").setAttribute("aria-current", tech ? "page" : "false");
    if (docs) { window.LRI_DOCS.load(); window.scrollTo(0, 0); return; }
    if (tech) {
      const which = tab === "validacao" ? "validacao" : "submissao";
      document.querySelectorAll("[data-tab]").forEach((b) => {
        const on = b.getAttribute("data-tab") === which;
        b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
      });
      $("pane-submissao").hidden = which !== "submissao"; $("pane-validacao").hidden = which !== "validacao";
      // o iframe só é carregado quando o separador é aberto
      if (which === "submissao" && !frames.survey) { $("frame-survey").src = CFG.surveyUrl; frames.survey = true; }
      if (which === "validacao" && !frames.exp) { $("frame-exp").src = CFG.experienceUrl; frames.exp = true; }
      loadCounts();
    } else if (!loaded && !loading) load();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => (location.hash = "#tecnica/" + b.getAttribute("data-tab"))));
  window.addEventListener("hashchange", route);

  // ---- dados
  function showUpdated() { $("updated").textContent = lastUpdate ? `${t("updated")}: ${lastUpdate.toLocaleString(I.lang === "en" ? "en-GB" : "pt-PT")}` : ""; }
  async function load() {
    loading = true;
    $("dash").hidden = true;
    $("state").innerHTML = `<div class="load">${t("loading")}</div>`;
    try {
      const res = await window.LRI_DATA.loadValidated();
      isDemo = res.demo; loaded = true;
      $("demo-banner").hidden = !isDemo;
      $("state").innerHTML = ""; $("dash").hidden = false;
      lastUpdate = new Date(); showUpdated();
      window.DASH.set(res.records);
    } catch (e) {
      console.error(e);
      $("state").innerHTML = `<div class="err"><strong>${t("loadError")}</strong><br><small>${String(e.message || e).replace(/</g, "&lt;")}</small><br><br><button class="btn" id="btn-retry" type="button">${t("retry")}</button></div>`;
      $("btn-retry").onclick = load;
    } finally { loading = false; }
  }
  $("btn-refresh").onclick = load;

  // ---- contagem por estado (Técnica) — só aparece se a camada expuser todos os estados
  let counts = null;
  function renderCounts() {
    const el = $("status-counts");
    if (!counts) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `<strong style="align-self:center">${t("statusCounts")}:</strong><span class="p">${t("pending")}: ${counts.pending}</span><span class="v">${t("validated")}: ${counts.validated}</span><span class="r">${t("rejected")}: ${counts.rejected}</span>`;
  }
  async function loadCounts() { counts = await window.LRI_DATA.loadStatusCounts(); renderCounts(); }

  I.apply();
  route();
})();
