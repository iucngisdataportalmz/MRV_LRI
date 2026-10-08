/* ==========================================================================
   Catálogo LRI — pilares, indicadores, sub-indicadores e regras de classificação
   Fonte: ficheiro "Barue-Vanduzi_dataset.xlsx", aba "SUSTAIN LHMI indicator data".
   Pontuação: 1 = Fraco/Poor, 2 = Moderado/Moderate, 3 = Bom/Good, 4 = Excelente/Excellent
   Regras:
     asc  th:[a,b,c]  -> valor<=a Fraco · <=b Moderado · <=c Bom · >c Excelente   (Baixo→Alto)
     desc th:[a,b,c]  -> valor>=a Fraco · >=b Moderado · >=c Bom · <c Excelente   (Alto→Baixo)
     rng  e/g/m       -> intervalos [min,max] para Excelente / Bom / Moderado; resto = Fraco
   "kw" = palavras-chave (sem acentos) usadas para reconhecer o texto do sub-indicador
   vindo do Survey123. Ajuste aqui se as opções do inquérito mudarem.
   ========================================================================== */
(function () {
  const A = (a, b, c) => ({ t: "asc", th: [a, b, c] });
  const D = (a, b, c) => ({ t: "desc", th: [a, b, c] });

  const PILLARS = [
    { id: "terra", pt: "Terra", en: "Land", color: "#8a6a3b" },
    { id: "agua", pt: "Água", en: "Water", color: "#2b7fb5" },
    { id: "resil", pt: "Resiliência", en: "Resilience", color: "#7a5aa6" }
  ];

  const IND = [
    { n: 1, p: "terra", pt: "Biodiversidade acima do solo", en: "Above-ground biodiversity", alias: [],
      subs: [{ id: "1a", pt: "Riqueza de espécies de aves", en: "Bird species richness", kw: ["ave", "passaro", "riqueza"], unit: "n.º spp/local", rule: A(2, 4, 7) }] },
    { n: 2, p: "terra", pt: "Biodiversidade abaixo do solo", en: "Below-ground biodiversity", alias: [],
      subs: [
        { id: "2a", pt: "Minhocas solo nu", en: "Earthworm count (bare ground)", kw: ["minhoca", "nu", "descoberto"], unit: "n.º/m²", rule: A(10, 20, 30) },
        { id: "2b", pt: "Minhocas solo coberto", en: "Earthworm count (covered ground)", kw: ["minhoca", "coberto", "cobertura"], unit: "n.º/m²", rule: A(10, 20, 30) }
      ] },
    { n: 3, p: "terra", pt: "Estocks de carbono", en: "Carbon stocks", alias: ["Estocks de carbono", "Estoques de carbono"],
      subs: [{ id: "3a", pt: "Carbono orgânico do solo", en: "Soil organic carbon", kw: ["carbono", "organico"], unit: "%", rule: A(1, 2, 3) }] },
    { n: 4, p: "terra", pt: "Fertilidade do solo", en: "Soil fertility", alias: [],
      subs: [
        { id: "4a", pt: "Condutividade elétrica do solo", en: "Soil electrical conductivity", kw: ["condutividade", "ec"], unit: "µS/cm",
          rule: { t: "rng", e: [[200, 800]], g: [[800, 2000]], m: [[0, 200], [2000, 3000]] } },
        { id: "4b", pt: "pH do solo", en: "Soil pH", kw: ["ph"], unit: "pH",
          rule: { t: "rng", e: [[5.5, 7]], g: [[5, 5.5], [7, 7.5]], m: [[4.5, 5], [7.5, 8]] } }
      ] },
    { n: 5, p: "agua", pt: "Disponibilidade de água no solo", en: "Soil-water availability", alias: [],
      subs: [{ id: "5a", pt: "Capacidade de retenção de água", en: "Water holding capacity", kw: ["retencao", "capacidade", "agua"], unit: "%", rule: A(10, 20, 30) }] },
    { n: 6, p: "agua", pt: "Qualidade da água: Atividade biológica em riachos (miniSASS)", en: "Water quality: Small stream biological activity (miniSASS)", alias: ["Qualidade da água: Atividade biológica em riachos"],
      subs: [
        { id: "6a", pt: "Qualidade da água: Atividade biológica em riachos (miniSASS)", en: "Macroinvertebrate assessment (miniSASS)", kw: ["macroinvertebrado", "minisass", "arenoso"], unit: "índice", rule: A(4.8, 5.3, 5.8) },
        { id: "6b", pt: "Avaliação de macroinvertebrados – rio rochoso", en: "Macroinvertebrate assessment – rocky river", kw: ["macroinvertebrado", "rochoso", "pedregoso"], unit: "índice", rule: A(5.3, 5.6, 6.1) }
      ] },
    { n: 7, p: "agua", pt: "Qualidade da água: Propriedades químicas em riachos (local)", en: "Water quality: Small stream chemical properties", alias: ["Qualidade da água: Propriedades químicas em riachos"],
      subs: [
        { id: "7a", pt: "pH da água", en: "Water pH", kw: ["ph"], unit: "pH", rule: A(5.44, 5.94, 6.59) },
        { id: "7b", pt: "Condutividade elétrica da água (CE)", en: "Water electrical conductivity (EC)", kw: ["condutividade", "ec"], unit: "µS/cm", rule: D(2250, 751, 250) },
        { id: "7c", pt: "Sólidos dissolvidos totais (TDS)", en: "Total dissolved solids (TDS)", kw: ["tds", "solidos", "ppm"], unit: "ppm", rule: D(1500, 501, 150) }
      ] },
    { n: 8, p: "agua", pt: "Acesso à água na paisagem", en: "Landscape water access", alias: [],
      subs: [{ id: "8a", pt: "% de pessoas com acesso a água da rede ou poço", en: "% of people with access to mains or well water", kw: ["acesso", "pessoas", "rede", "poco"], unit: "%", rule: A(25, 50, 75) }] },
    { n: 9, p: "agua", pt: "Disponibilidade de água na paisagem", en: "Landscape water availability", alias: [],
      subs: [
        { id: "9a", pt: "Caudal do Rio Diciui Setembro (Barué)", en: "Diciui River discharge (m³/s) – September", kw: ["diciui", "setembro"], unit: "m³/s",
          rule: { t: "rng", e: [[0.12, 0.2]], g: [[0.08, 0.12], [0.2, 0.23]], m: [[0.04, 0.08], [0.23, 0.27]] } },
        { id: "9b", pt: "Caudal do Rio Nhazonia Setembro (Barué)", en: "Nhazonia River discharge (m³/s) – September", kw: ["nhazonia", "setembro"], unit: "m³/s",
          rule: { t: "rng", e: [[1.63, 2.71]], g: [[1.09, 1.63], [2.71, 3.26]], m: [[0.54, 1.09], [3.26, 3.8]] } },
        { id: "9c", pt: "Caudal do Rio Diciui Março (Vandúzi)", en: "Diciui River discharge (m³/s) – March", kw: ["diciui", "marco"], unit: "m³/s",
          rule: { t: "rng", e: [[3.11, 5.19]], g: [[2.07, 3.11], [5.19, 6.22]], m: [[1.04, 2.07], [6.22, 7.26]] } },
        { id: "9d", pt: "Caudal do Rio Nhazonia Março (Vandúzi)", en: "Nhazonia River discharge (m³/s) – March", kw: ["nhazonia", "marco"], unit: "m³/s",
          rule: { t: "rng", e: [[27.6, 45.99]], g: [[18.4, 27.6], [45.99, 55.19]], m: [[9.2, 18.4], [55.19, 64.39]] } }
      ] },
    { n: 10, p: "agua", pt: "Qualidade da água: Propriedades químicas de rios grandes", en: "Water quality: Large River chemical properties", alias: ["Qualidade da água: Propriedades químicas em rios grandes"],
      subs: [
        { id: "10a", pt: "pH", en: "Water pH (river)", kw: ["ph"], unit: "pH", rule: A(5.44, 5.94, 6.59) },
        { id: "10b", pt: "Condutividade elétrica (CE) do rio", en: "River electrical conductivity (EC)", kw: ["condutividade", "ec"], unit: "µS/cm", rule: D(2250, 751, 250) },
        { id: "10c", pt: "Sólidos totais dissolvidos", en: "River total dissolved solids (TDS)", kw: ["tds", "solidos", "ppm"], unit: "ppm", rule: D(1500, 501, 150) }
      ] },
    { n: 11, p: "resil", pt: "Adoção de práticas de Gestão Sustentável da Terra (GST/SLM)", en: "Adoption of Sustainable Land Management (SLM) practices", alias: ["Adoção de práticas de Gestão Sustentável da Terra"],
      subs: [
        { id: "11a", pt: "GST: aplicação de estrume", en: "% applying manure", kw: ["estrume"], unit: "%", rule: A(25, 50, 75) },
        { id: "11b", pt: "GST: rotação de culturas", en: "% practising crop rotation", kw: ["rotacao"], unit: "%", rule: A(25, 50, 75) },
        { id: "11c", pt: "GST: redução da erosão (gramíneas, trincheiras, terraços)", en: "% using soil-erosion practices", kw: ["erosao", "terraco", "valas", "capim"], unit: "%", rule: A(25, 50, 75) },
        { id: "11d", pt: "GST: adição de composto", en: "% adding compost", kw: ["composto", "compostagem"], unit: "%", rule: A(25, 50, 75) }
      ] },
    { n: 12, p: "resil", pt: "Produtividade agrícola, agroflorestal e de plantações de árvores", en: "Agricultural, agroforestry and tree plantation productivity", alias: [],
      subs: [
        { id: "12a", pt: "Rendimento: milho", en: "Average yield – maize (t/ha)", kw: ["milho"], unit: "t/ha", rule: A(3, 3.25, 3.5) },
        { id: "12b", pt: "Rendimento: soja", en: "Average yield – soybean (t/ha)", kw: ["soja"], unit: "t/ha", rule: A(1.2, 1.4, 1.8) },
        { id: "12c", pt: "Rendimento: feijão-fradinho / feijão-bento (pigeon pea)", en: "Average yield – pigeon pea (t/ha)", kw: ["boer", "nhemba"], unit: "t/ha", rule: A(0.8, 1.15, 1.5) },
        { id: "12d", pt: "Rendimento: feijão-verde", en: "Average yield – green bean (t/ha)", kw: ["verde", "vagem"], unit: "t/ha", rule: A(2, 2.25, 2.5) },
        { id: "12e", pt: "Rendimento: repolho", en: "Average yield – cabbage (t/ha)", kw: ["repolho", "couve"], unit: "t/ha", rule: A(60, 67.5, 75) }
      ] },
    { n: 13, p: "resil", pt: "Eventos meteorológicos extremos", en: "Extreme weather", alias: ["Eventos climáticos extremos"],
      subs: [
        { id: "13a", pt: "Área afetada por inundações média mensal (quanto menor, melhor)", en: "Average % of land area affected by flooding per month", kw: ["cheia", "inunda"], unit: "%", rule: D(25, 15, 5) },
        { id: "13b", pt: "Área afetada por seca (quanto menor, melhor)", en: "% of area affected by drought", kw: ["seca"], unit: "%", rule: D(25, 15, 5) }
      ] },
    { n: 14, p: "resil", pt: "Pobreza das famílias", en: "Household poverty", alias: [],
      subs: [{ id: "14a", pt: "Famílias que passam fome por falta de dinheiro (quanto menor, melhor)", en: "Households going hungry due to insufficient money (lower is better)", kw: ["fome", "familia", "dinheiro"], unit: "%", rule: D(40, 20, 10) }] },
    { n: 15, p: "resil", pt: "Percentagem de cobertura do solo", en: "Landcover percentage", alias: ["Percentagem de cobertura florestal"],
      subs: [{ id: "15a", pt: "Perda de cobertura arbórea (quanto menor, melhor)", en: "% tree cover loss", kw: ["perda", "arborea", "cobertura"], unit: "%", rule: D(1.24, 0.725, 0.21) }] },
    { n: 16, p: "resil", pt: "Biodiversidade da paisagem", en: "Landscape biodiversity", alias: [],
      subs: [{ id: "16a", pt: "Índice de Hábitat de Biodiversidade (proporção de espécies)", en: "BHI – proportion of species expected to persist", kw: ["bhi", "especies", "persist"], unit: "índice", rule: A(0.7, 0.8, 0.9) }] },
    { n: 17, p: "resil", pt: "Perceção de choques e pressões", en: "Perception of shocks and stresses", alias: ["Percepção de choques e pressões"],
      subs: [
        { id: "17a", pt: "Inquiridos que consideram a seca um grande problema", en: "% considering drought a big problem", kw: ["seca"], unit: "%", rule: D(75, 50, 30) },
        { id: "17b", pt: "Inquiridos que consideram inundações/tempestades um grande problema", en: "% considering floods/storms a big problem", kw: ["cheia", "tempestade", "inunda"], unit: "%", rule: D(75, 50, 30) }
      ] }
  ];

  const norm = (s) => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  const indIndex = {};
  IND.forEach((i) => {
    [i.pt, i.en].concat(i.alias || []).forEach((n) => (indIndex[norm(n)] = i));
  });

  function matchIndicator(name) {
    const k = norm(name);
    if (!k) return null;
    if (indIndex[k]) return indIndex[k];
    // tolerância: um contém o outro
    const keys = Object.keys(indIndex);
    for (const x of keys) if (k.includes(x) || x.includes(k)) return indIndex[x];
    return null;
  }

  // devolve { sub, assumed } — "assumed" = regra assumida por falta de correspondência
  function matchSub(ind, text) {
    const t = " " + norm(text) + " ";
    let best = null, bestScore = 0;
    for (const s of ind.subs) {
      if (norm(s.pt) === norm(text) || norm(s.en) === norm(text)) return { sub: s, assumed: false };
      let sc = 0;
      s.kw.forEach((w) => { if (t.includes(" " + w) || t.includes(w + " ")) sc++; });
      if (sc > bestScore) { bestScore = sc; best = s; }
    }
    if (best) return { sub: best, assumed: false };
    return { sub: ind.subs[0], assumed: ind.subs.length > 1 };
  }

  const inR = (v, arr) => (arr || []).some((r) => v >= r[0] && v <= r[1]);
  function scoreValue(rule, v) {
    if (v == null || isNaN(v)) return null;
    const [a, b, c] = rule.th || [];
    switch (rule.t) {
      case "asc": return v <= a ? 1 : v <= b ? 2 : v <= c ? 3 : 4;
      case "desc": return v >= a ? 1 : v >= b ? 2 : v >= c ? 3 : 4;
      case "rng": return inR(v, rule.e) ? 4 : inR(v, rule.g) ? 3 : inR(v, rule.m) ? 2 : 1;
    }
    return null;
  }

  window.LRI_CATALOG = { PILLARS, IND, norm, matchIndicator, matchSub, scoreValue };
})();
