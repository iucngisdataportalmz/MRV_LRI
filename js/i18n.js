/* Traduções PT / EN: interface pública, gráficos, tabelas e relatórios */
(function () {
  const T = {
    pt: {
      appName: "Land Resilience Index", appSub: "Plataforma de MRV",
      navDocs: "Documentos", docsTitle: "Documentos metodológicos", docsIntro: "Manuais, guias e outros documentos de referência do LRI para consulta e download.",
      docsPages: "págs.", docsOpen: "Abrir", docsNone: "Nenhum documento encontrado.", docsError: "Não foi possível carregar a lista de documentos.", methodDocs: "Ver documentos metodológicos para descarregar →",
      navDashboard: "Dashboard", navTech: "Área Técnica", navSubmit: "Submissão de dados", navValidate: "Validação de Dados",
      skip: "Saltar para o conteúdo",
      exportPdf: "Relatório PDF", exportXlsx: "Dados Excel", exportCsv: "CSV", download: "Descarregar",
      refresh: "Atualizar", updated: "Atualizado", demoBanner: "MODO DEMONSTRAÇÃO: dados fictícios apenas para pré-visualizar o layout.",
      loadError: "Não foi possível carregar os dados do Feature Service.", retry: "Tentar novamente",
      loading: "A carregar dados validados…", noData: "Sem dados validados para os filtros selecionados.",
      fYear: "Ano", fProvince: "Província", fDistrict: "Distrito", fAll: "Todos", fAllM: "Todas",
      onlyValidated: "Apenas dados validados são apresentados e usados no cálculo.",
      secLRI: "LRI geral e por pilar", lriOverall: "LRI geral", score: "Pontuação", class: "Classe", indicatorsN: "indicadores",
      secInterp: "Indicadores de apoio à interpretação",
      iDelta: "Variação do LRI face ao ano anterior", iPoor: "Indicadores na classe Fraco", iGap: "Lacuna até à próxima classe",
      iWeak: "Pilar mais fraco", iCover: "Cobertura geográfica", iPrio: "Prioridades de intervenção", iStrong: "Pontos fortes",
      noPrev: "Sem ano anterior para comparar", vs: "face a", none: "Nenhum", toReach: "para atingir a classe", topClass: "Já está na classe máxima",
      districtsCovered: "distritos com dados", provincesWord: "província(s)", indCovered: "indicadores com dados",
      prioText: "Reforçar ações nos indicadores com pontuação abaixo de 2,5, começando pelos mais baixos:",
      prioNone: "Nenhum indicador abaixo de 2,5.", strongText: "Indicadores com pontuação ≥ 2,5 (classe Bom ou Excelente):", strongNone: "Ainda sem indicadores nas classes Bom/Excelente.",
      secIndBar: "Pontuação por indicador", secClassPie: "Distribuição por classe", secRadar: "Radar por indicador",
      xHint: "Dica: clique nos gráficos, no mapa, nos cartões e nas tabelas para filtrar o resto do painel.", xActive: "Filtros activos:", xClear: "Limpar filtros", xRemove: "Remover filtro", xClickHint: "Clique para filtrar",
      sheetInst: "Instituições", secInst: "Contribuição das instituições para o LRI", instSub: "Número de distritos com informação de LRI validada lançada por cada instituição; a percentagem é a parte de cada instituição no total de distritos lançados por todas.", instAxis: "N.º de distritos", instDistricts: "Distritos", instNone: "Sem instituição", instNote: "Cobertura total:", instDistrictsWord: "distritos", instWord: "instituições",
      mapTitle: "Mapa do LRI por distrito", mapSub: "Cada distrito é pintado com a classe do LRI geral (apenas dados validados). Clique num distrito para ver os detalhes.", mapList: "Distritos com dados", mapNoData: "Sem dados validados", mapRecords: "Registos", mapHint: "Clique num distrito do mapa ou da lista.", mapUnmatched: "Distritos sem correspondência no mapa:",
      secDistPillar: "Comparação por distrito e pilar", secEvolution: "Evolução do LRI", secHeat: "Mapa de calor: indicador e sub-indicador × distrito",
      heatByDistrict: "Por distrito (e total)", heatByYear: "Por ano", total: "Total",
      secSubTable: "Detalhe dos sub-indicadores", secIndTable: "Detalhe dos indicadores",
      secValDist: "Distribuição dos valores", secScoreDist: "Distribuição das pontuações dos sub-indicadores por pilar",
      secRecords: "Registos / dados", secMethod: "Metodologia e qualidade dos dados",
      subIndicator: "Sub-indicador", chooseSub: "Sub-indicador", nRecords: "N.º de registos", valueRange: "Intervalo de valores",
      pillar: "Pilar", indicator: "Indicador", meanValue: "Valor médio", scoreCol: "Pontuação", classCol: "Classe", nCol: "n",
      province: "Província", district: "Distrito", value: "Valor", unit: "Unidade", source: "Fonte", season: "Época", collectDate: "Data de coleta",
      submitDate: "Data de submissão", institution: "Instituição", status: "Estado", id: "ID", year: "Ano",
      search: "Pesquisar…", page: "Página", of: "de", prev: "Anterior", next: "Seguinte", rows: "registos",
      poor: "Fraco", moderate: "Moderado", good: "Bom", excellent: "Excelente",
      pending: "Pendente", validated: "Validado", rejected: "Rejeitado",
      yAxisScore: "Pontuação (1–4)", xAxisValue: "Valor", yAxisCount: "N.º de registos", xAxisScore: "Pontuação",
      subsCount: "sub-indicadores", assumedWarn: "Regra assumida (texto do sub-indicador não reconhecido)",
      mixedUnits: "(vários)",
      techTitle: "Área técnica", techIntro: "Recolha e validação de dados. Novos registos entram como Pendente; só passam ao Dashboard depois de validados.",
      flowSubmit: "Submissão", flowSubmitD: "Sem login: formulário Survey123", flowPending: "Pendente", flowPendingD: "Todo o novo registo",
      flowValidate: "Validação", flowValidateD: "Técnico com login ArcGIS", flowDash: "Dashboard", flowDashD: "Só dados Validados",
      tabSubmit: "Submissão de dados", tabValidate: "Validação de dados",
      submitHead: "Submissão de dados (Survey123)", submitDesc: "Formulário público: não é necessário login. O registo é guardado como Pendente.",
      validateHead: "Validação de dados (ArcGIS Experience)", validateDesc: "Acesso restrito: inicie sessão com utilizador e palavra-passe do ArcGIS Online. Validado → aparece no Dashboard · Rejeitado → fica fora do Dashboard.",
      openNew: "Abrir em nova janela", embedHint: "Se o formulário não carregar aqui (bloqueio de cookies de terceiros no navegador), use “Abrir em nova janela”.",
      statusCounts: "Estado dos registos na base de dados",
      devBy: "Desenvolvido por",
      footer: "Land Resilience Index · MRV · Os valores apresentados resultam apenas de registos validados.",
      pdfTitle: "Relatório do Land Resilience Index (LRI)", pdfGenerated: "Gerado em", pdfFilters: "Filtros", pdfPage: "Página",
      pdfCharts: "Gráficos", generating: "A gerar…",
      sheetSummary: "Resumo", sheetPillars: "Pilares", sheetInd: "Indicadores", sheetSub: "Sub-indicadores", sheetRec: "Registos", sheetHeat: "Mapa de calor",
      methodHtml: `
<h3>Fluxo de dados</h3>
<p>Os dados são recolhidos através de um formulário <strong>Survey123</strong> público e guardados no <strong>ArcGIS Online</strong> (Feature Service). Todo o novo registo entra com o estado <em>Pendente</em> (“Não Validado”). Um técnico, autenticado no <strong>ArcGIS Experience</strong>, passa-o a <em>Validado</em> ou <em>Rejeitado</em>. Este dashboard lê <strong>apenas</strong> os registos <em>Validados</em>; registos pendentes ou rejeitados nunca entram nos gráficos, tabelas ou no cálculo do LRI.</p>
<h3>Cálculo do LRI</h3>
<ol>
<li><strong>Pontuação do sub-indicador:</strong> calcula-se o valor médio dos registos validados e converte-se numa pontuação de 1 a 4 com os limiares de classificação definidos para cada sub-indicador (ficheiro de referência SUSTAIN LHMI): 1 = Fraco, 2 = Moderado, 3 = Bom, 4 = Excelente.</li>
<li><strong>Pontuação do indicador:</strong> média simples das pontuações dos seus sub-indicadores com dados.</li>
<li><strong>Pontuação do pilar</strong> (Terra, Água, Resiliência): média simples das pontuações dos seus indicadores com dados.</li>
<li><strong>LRI geral:</strong> média simples das pontuações dos pilares com dados.</li>
</ol>
<p><strong>Classes do LRI:</strong> Fraco &lt; 1,50 · Moderado 1,50–2,49 · Bom 2,50–3,49 · Excelente ≥ 3,50.</p>
<h3>Indicadores de apoio à interpretação</h3>
<p>A <em>variação</em> compara o LRI do ano em análise com o do ano anterior com dados; a <em>lacuna</em> é a diferença entre o LRI e o limite inferior da classe seguinte; as <em>prioridades de intervenção</em> são os indicadores com pontuação inferior a 2,5 (até cinco, dos mais baixos); os <em>pontos fortes</em> são os indicadores com pontuação ≥ 2,5. O ano de cada registo é o da data de coleta (ou, na falta desta, da data de submissão).</p>
<h3>Qualidade dos dados e limitações</h3>
<ul>
<li>O LRI só é tão representativo quanto a cobertura: o n.º de indicadores, sub-indicadores e distritos com dados validados é apresentado nos cartões e tabelas. Indicadores sem dados <strong>não</strong> contam como zero: ficam fora da média.</li>
<li>Cada sub-indicador depende do número de registos (<em>n</em>); médias com n baixo devem ser interpretadas com cautela.</li>
<li>Registos cujo indicador ou sub-indicador não é reconhecido pelo catálogo ficam excluídos do cálculo; quando só o sub-indicador não é reconhecido, é aplicada a regra do primeiro sub-indicador do indicador e o registo é sinalizado.</li>
<li>O indicador “Valor médio” só é apresentado quando o indicador tem um único sub-indicador (unidades comparáveis).</li>
<li>A validação é uma verificação técnica manual; a plataforma não corrige valores.</li>
</ul>`
    },
    en: {
      appName: "Land Resilience Index", appSub: "MRV platform",
      navDocs: "Documents", docsTitle: "Methodological documents", docsIntro: "LRI handbooks, guides and other reference documents to read and download.",
      docsPages: "pp.", docsOpen: "Open", docsNone: "No documents found.", docsError: "Could not load the document list.", methodDocs: "See methodological documents to download →",
      navDashboard: "Dashboard", navTech: "Technical Area", navSubmit: "Data submission", navValidate: "Data Validation",
      skip: "Skip to content",
      exportPdf: "PDF report", exportXlsx: "Excel data", exportCsv: "CSV", download: "Download",
      refresh: "Refresh", updated: "Updated", demoBanner: "DEMO MODE: fictitious data, only to preview the layout.",
      loadError: "Could not load data from the Feature Service.", retry: "Try again",
      loading: "Loading validated data…", noData: "No validated data for the selected filters.",
      fYear: "Year", fProvince: "Province", fDistrict: "District", fAll: "All", fAllM: "All",
      onlyValidated: "Only validated data is shown and used in the calculation.",
      secLRI: "Overall LRI and by pillar", lriOverall: "Overall LRI", score: "Score", class: "Class", indicatorsN: "indicators",
      secInterp: "Interpretation support indicators",
      iDelta: "LRI change vs previous year", iPoor: "Indicators in the Poor class", iGap: "Gap to next class",
      iWeak: "Weakest pillar", iCover: "Geographic coverage", iPrio: "Intervention priorities", iStrong: "Strengths",
      noPrev: "No previous year to compare", vs: "vs", none: "None", toReach: "to reach class", topClass: "Already in the top class",
      districtsCovered: "districts with data", provincesWord: "province(s)", indCovered: "indicators with data",
      prioText: "Strengthen action on indicators scoring below 2.5, starting with the lowest:",
      prioNone: "No indicator below 2.5.", strongText: "Indicators scoring ≥ 2.5 (Good or Excellent class):", strongNone: "No indicators in the Good/Excellent classes yet.",
      secIndBar: "Score by indicator", secClassPie: "Distribution by class", secRadar: "Radar by indicator",
      xHint: "Tip: click charts, the map, cards and tables to filter the rest of the dashboard.", xActive: "Active filters:", xClear: "Clear filters", xRemove: "Remove filter", xClickHint: "Click to filter",
      sheetInst: "Institutions", secInst: "Institution's contribution to the LRI", instSub: "Number of districts with validated LRI data submitted by each institution; the percentage is each institution's share of the districts submitted by all institutions.", instAxis: "No. of districts", instDistricts: "Districts", instNone: "No institution", instNote: "Total coverage:", instDistrictsWord: "districts", instWord: "institutions",
      mapTitle: "LRI map by district", mapSub: "Each district is coloured by its overall LRI class (validated data only). Click a district for details.", mapList: "Districts with data", mapNoData: "No validated data", mapRecords: "Records", mapHint: "Click a district on the map or in the list.", mapUnmatched: "Districts not matched on the map:",
      secDistPillar: "Comparison by district and pillar", secEvolution: "LRI trend", secHeat: "Heatmap: indicator and sub-indicator × district",
      heatByDistrict: "By district (and total)", heatByYear: "By year", total: "Total",
      secSubTable: "Sub-indicator detail", secIndTable: "Indicator detail",
      secValDist: "Value distribution", secScoreDist: "Sub-indicator score distribution by pillar",
      secRecords: "Records / data", secMethod: "Methodology and data quality",
      subIndicator: "Sub-indicator", chooseSub: "Sub-indicator", nRecords: "No. of records", valueRange: "Value range",
      pillar: "Pillar", indicator: "Indicator", meanValue: "Mean value", scoreCol: "Score", classCol: "Class", nCol: "n",
      province: "Province", district: "District", value: "Value", unit: "Unit", source: "Source", season: "Season", collectDate: "Collection date",
      submitDate: "Submission date", institution: "Institution", status: "Status", id: "ID", year: "Year",
      search: "Search…", page: "Page", of: "of", prev: "Previous", next: "Next", rows: "records",
      poor: "Poor", moderate: "Moderate", good: "Good", excellent: "Excellent",
      pending: "Pending", validated: "Validated", rejected: "Rejected",
      yAxisScore: "Score (1–4)", xAxisValue: "Value", yAxisCount: "No. of records", xAxisScore: "Score",
      subsCount: "sub-indicators", assumedWarn: "Assumed rule (sub-indicator text not recognised)",
      mixedUnits: "(various)",
      techTitle: "Technical area", techIntro: "Data collection and validation. New records enter as Pending and only reach the Dashboard once validated.",
      flowSubmit: "Submission", flowSubmitD: "No login: Survey123 form", flowPending: "Pending", flowPendingD: "Every new record",
      flowValidate: "Validation", flowValidateD: "Technician with ArcGIS login", flowDash: "Dashboard", flowDashD: "Validated data only",
      tabSubmit: "Data submission", tabValidate: "Data validation",
      submitHead: "Data submission (Survey123)", submitDesc: "Public form: no login required. The record is saved as Pending.",
      validateHead: "Data validation (ArcGIS Experience)", validateDesc: "Restricted access: sign in with an ArcGIS Online username and password. Validated → appears on the Dashboard · Rejected → stays off the Dashboard.",
      openNew: "Open in new window", embedHint: "If the form does not load here (third-party cookies blocked by your browser), use “Open in new window”.",
      statusCounts: "Record status in the database",
      devBy: "Developed by",
      footer: "Land Resilience Index · MRV · Figures shown come from validated records only.",
      pdfTitle: "Land Resilience Index (LRI) report", pdfGenerated: "Generated on", pdfFilters: "Filters", pdfPage: "Page",
      pdfCharts: "Charts", generating: "Generating…",
      sheetSummary: "Summary", sheetPillars: "Pillars", sheetInd: "Indicators", sheetSub: "Sub-indicators", sheetRec: "Records", sheetHeat: "Heatmap",
      methodHtml: `
<h3>Data flow</h3>
<p>Data is collected through a public <strong>Survey123</strong> form and stored in <strong>ArcGIS Online</strong> (Feature Service). Every new record enters as <em>Pending</em> (“Não Validado”). A technician, signed in to the <strong>ArcGIS Experience</strong>, sets it to <em>Validated</em> or <em>Rejected</em>. This dashboard reads <strong>only</strong> <em>Validated</em> records; pending or rejected records never reach the charts, tables or the LRI calculation.</p>
<h3>LRI calculation</h3>
<ol>
<li><strong>Sub-indicator score:</strong> the mean value of validated records is converted into a 1–4 score using the classification thresholds defined for each sub-indicator (SUSTAIN LHMI reference file): 1 = Poor, 2 = Moderate, 3 = Good, 4 = Excellent.</li>
<li><strong>Indicator score:</strong> simple mean of the scores of its sub-indicators with data.</li>
<li><strong>Pillar score</strong> (Land, Water, Resilience): simple mean of the scores of its indicators with data.</li>
<li><strong>Overall LRI:</strong> simple mean of the pillar scores with data.</li>
</ol>
<p><strong>LRI classes:</strong> Poor &lt; 1.50 · Moderate 1.50–2.49 · Good 2.50–3.49 · Excellent ≥ 3.50.</p>
<h3>Interpretation support indicators</h3>
<p><em>Change</em> compares the LRI of the year under analysis with the previous year that has data; the <em>gap</em> is the difference between the LRI and the lower bound of the next class; <em>intervention priorities</em> are indicators scoring below 2.5 (up to five, lowest first); <em>strengths</em> are indicators scoring ≥ 2.5. A record’s year is that of its collection date (or, if missing, its submission date).</p>
<h3>Data quality and limitations</h3>
<ul>
<li>The LRI is only as representative as its coverage: the number of indicators, sub-indicators and districts with validated data is shown in the cards and tables. Indicators without data do <strong>not</strong> count as zero: they are left out of the average.</li>
<li>Each sub-indicator depends on its number of records (<em>n</em>); means with low n should be read with caution.</li>
<li>Records whose indicator or sub-indicator is not recognised by the catalogue are excluded from the calculation; when only the sub-indicator is unrecognised, the rule of the indicator’s first sub-indicator is applied and the record is flagged.</li>
<li>“Mean value” for an indicator is shown only when it has a single sub-indicator (comparable units).</li>
<li>Validation is a manual technical check; the platform does not correct values.</li>
</ul>`
    }
  };

  let lang = "pt";
  try { lang = localStorage.getItem("lri_lang") || "pt"; } catch (e) {}
  if (lang !== "pt" && lang !== "en") lang = "pt";

  const t = (k) => (T[lang] && T[lang][k] != null ? T[lang][k] : k);
  const pick = (o) => (lang === "en" ? o.en : o.pt);
  const cls = (k) => t(k);
  const fmt = (n, d) => (n == null || isNaN(n) ? "–" : Number(n).toLocaleString(lang === "en" ? "en-GB" : "pt-PT", { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }));
  const fmtDate = (d) => (d ? d.toLocaleDateString(lang === "en" ? "en-GB" : "pt-PT") : "");

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang));
    document.title = t("appName") + " · MRV";
  }
  function set(l) { lang = l; try { localStorage.setItem("lri_lang", l); } catch (e) {} apply(); window.dispatchEvent(new Event("lri-lang")); }

  window.I18N = { t, pick, cls, fmt, fmtDate, apply, set, get lang() { return lang; } };
})();
