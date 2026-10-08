/* ==========================================================================
   LRI · MRV — Configuração central
   Edite apenas este ficheiro para mudar links, campos ou limiares.
   ========================================================================== */
window.LRI_CONFIG = {
  // 1. Feature Service (ArcGIS Online) — camada 0 = MRV_LRI
  featureService: "https://services8.arcgis.com/Yb7xytb4Ff2eEN6Y/arcgis/rest/services/service_2a0e752485344090b3e771e2855e696b/FeatureServer",
  layerId: 0,

  // 2. Experience Builder (Validação — requer username/password ArcGIS Online)
  experienceUrl: "https://experience.arcgis.com/experience/2028fe91c0fe43bf849add5aa56da724",

  // 3. Survey123 (Submissão de dados — sem login)
  surveyUrl: "https://survey123.arcgis.com/share/e582f1eafa404ce8b70e5dbc8ec20e56",

  // Nomes dos campos da camada (a leitura é insensível a maiúsculas/minúsculas)
  fields: {
    id: "objectid",
    province: "provincia",
    district: "distrito",
    indicator: "indicador",
    subIndicator: "sub_indicador",
    value: "valor",
    source: "fonte_dado",
    season: "epoca",
    collectDate: "data_coleta",
    submitDate: "data_submissao",
    institution: "instituicao",
    status: "validacao"
  },

  // Valores do campo de validação (domínio cvd_validacao).
  // "Regeitado" é a grafia existente no domínio; "Rejeitado" também é aceite.
  status: {
    validated: ["Validado"],
    pending:   ["Não Validado", "Nao Validado", "", null],
    rejected:  ["Regeitado", "Rejeitado"]
  },

  // Distritos-alvo (para o indicador "Cobertura geográfica")
  targetDistricts: ["Bárue", "Vanduzi"],

  // Classes do LRI (limites inferiores da pontuação 1–4)
  classes: [
    { key: "poor",      min: 0,   color: "#c23b2e" },
    { key: "moderate",  min: 1.5, color: "#e8a317" },
    { key: "good",      min: 2.5, color: "#7cc48a" },
    { key: "excellent", min: 3.5, color: "#1f8a4c" }
  ],

  // Paginação ao ler a camada
  pageSize: 1000,

  // Mostrar dados de demonstração se a camada não responder? (false = mostra erro)
  demoFallback: false
};
