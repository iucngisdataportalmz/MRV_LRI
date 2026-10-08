# Land Resilience Index (LRI) · Plataforma MRV

Plataforma web estática (HTML + CSS + JavaScript) para **Monitoria, Reporte e Verificação (MRV)** do Land Resilience Index em Bárue e Vanduzi. Pronta para **GitHub Pages** — não precisa de servidor nem de *build*.

| Área | O que faz | Acesso |
|---|---|---|
| 🌍 **Dashboard** | Gráficos, tabelas, LRI, relatório PDF e exportação Excel — **só dados validados** | Público, sem login |
| 📝 **Técnica › Submissão de dados** | Formulário **Survey123** incorporado | Público, sem login |
| 🔐 **Técnica › Validação** | **ArcGIS Experience** incorporado | Restrito (utilizador e palavra-passe ArcGIS Online) |

Interface, gráficos, tabelas, PDF e Excel em **🇵🇹 Português / 🇬🇧 English** (botão PT | EN no topo).

## Fluxo de dados

```
Survey123 (sem login) ──► Feature Service (ArcGIS Online) ──► Experience (técnico valida)
                              validacao = "Não Validado"          │
                                                                  ├─► "Validado"  ─► aparece no Dashboard
                                                                  └─► "Regeitado" ─► fica fora do Dashboard
```

O Dashboard consulta a camada com `validacao = 'Validado'`; o cálculo do LRI usa **apenas** esses registos.

## Fontes de dados (já configuradas em `js/config.js`)

* Feature Service: `https://services8.arcgis.com/Yb7xytb4Ff2eEN6Y/arcgis/rest/services/service_2a0e752485344090b3e771e2855e696b/FeatureServer` (camada `0` — `MRV_LRI`)
* Experience (validação): `https://experience.arcgis.com/experience/2028fe91c0fe43bf849add5aa56da724`
* Survey123 (submissão): `https://survey123.arcgis.com/share/e582f1eafa404ce8b70e5dbc8ec20e56`

Campos usados na camada: `provincia, distrito, indicador, sub_indicador, valor, fonte_dado, epoca, data_coleta, data_submissao, instituicao, validacao` (domínio: *Validado*, *Não Validado*, *Regeitado*).

## Publicar no GitHub Pages (5 passos)

1. Crie um repositório no GitHub (ex.: `lri-mrv`) e envie **todo o conteúdo desta pasta** para a raiz (o `index.html` tem de ficar na raiz).
   ```bash
   git init && git add . && git commit -m "LRI MRV platform"
   git branch -M main
   git remote add origin https://github.com/<utilizador>/lri-mrv.git
   git push -u origin main
   ```
   (ou arraste os ficheiros em *Add file › Upload files*)
2. No repositório: **Settings › Pages**.
3. Em **Build and deployment › Source** escolha **Deploy from a branch**.
4. **Branch:** `main` · **Folder:** `/ (root)` · **Save**.
5. Após ~1 minuto o site fica em `https://<utilizador>.github.io/lri-mrv/`.

> Alternativa com GitHub Actions: copie `optional/pages.yml` para `.github/workflows/pages.yml` e em *Settings › Pages › Source* escolha **GitHub Actions**. Use **um** dos dois métodos, não ambos.

## ⚠️ Configuração necessária no ArcGIS Online (importante)

1. **Feature Service partilhado publicamente** (*Share › Everyone*) para o Dashboard poder ler os dados sem login. O GitHub Pages é estático: qualquer pessoa que veja a página consegue ver os pedidos feitos à camada.
2. **Privacidade dos registos pendentes/rejeitados.** Como a camada é pública, os registos *Não Validado/Regeitado* também seriam legíveis por quem consultar a API diretamente (mesmo que o Dashboard não os mostre). Para garantir que *só dados validados* são públicos, crie uma **Vista de camada (View)** do Feature Service com o filtro `validacao = 'Validado'`, partilhe **essa vista** publicamente e coloque o seu URL em `featureService` no `js/config.js`. A camada original (com todos os estados) fica privada para a Submissão (Survey123) e Validação (Experience).
3. **Survey123:** inquérito partilhado com *Everyone* e o valor por defeito de `validacao` = `Não Validado`.
4. **Experience:** partilhado só com a organização/grupo de técnicos. O GitHub Pages **não consegue** impor autenticação — quem a impõe é o ArcGIS Online (o Experience pede login dentro da moldura). Se o navegador bloquear *cookies* de terceiros, o login dentro do iframe pode falhar: use o botão **“Abrir em nova janela”** (sempre disponível).
5. **CORS/iframes:** o ArcGIS Online permite pedidos à API REST a partir de qualquer origem e a incorporação do Survey123 e do Experience em iframes. Se alguma organização tiver restrições de incorporação, ajuste em *Organization › Settings › Security › Allow origins* e adicione `https://<utilizador>.github.io`.

## Cálculo do LRI

Regras de classificação (limiares 1–4) vindas da aba **SUSTAIN LHMI indicator data** do ficheiro `Barue-Vanduzi_dataset.xlsx`, codificadas em `js/catalog.js`.

1. **Sub-indicador** = pontuação do **valor médio** dos registos validados (1 Fraco · 2 Moderado · 3 Bom · 4 Excelente).
2. **Indicador** = média dos sub-indicadores com dados (ex.: Qualidade da água química de rios grandes = (3+4+4)/3 = 3,67, igual à tabela-resumo do Excel).
3. **Pilar** (Terra · Água · Resiliência) = média dos indicadores com dados.
4. **LRI** = média dos pilares com dados.
5. **Classes:** Fraco < 1,50 · Moderado 1,50–2,49 · Bom 2,50–3,49 · Excelente ≥ 3,50.

Indicadores sem dados **não** contam como zero. O ano de cada registo vem de `data_coleta` (ou `data_submissao`).

### Correspondência com o Survey123
O campo `sub_indicador` é texto livre vindo do inquérito. `catalog.js` reconhece-o por texto exato ou palavras-chave (sem acentos). Se uma opção do inquérito não for reconhecida, o registo aparece sinalizado (⚠) e a secção **Metodologia e qualidade dos dados** mostra quantos foram excluídos/assumidos. Para corrigir, edite a lista `kw` (ou o texto `pt`) do sub-indicador em `js/catalog.js`.

## 📚 Documentos metodológicos (aba “Documentos”)

Biblioteca pública de PDFs para descarregar, com pesquisa, filtro por categoria e PT/EN. Já inclui o *LRI Handbook* (IUCN, 2026) e a *SUSTAIN Land Health Guidance Brochure*.

**Adicionar um novo documento — 2 formas:**

1. **Com o script** (recomendado):
   ```bash
   python tools/add_document.py ~/Downloads/novo.pdf \
       --title-pt "Título em português" --title-en "Title in English" \
       --desc-pt "Descrição curta" --desc-en "Short description" \
       --category metodologia --authors "Autor(es)" --publisher IUCN --year 2026 --lang PT
   ```
   Copia o PDF para `docs/`, cria a miniatura da capa, conta páginas/tamanho e atualiza `data/documents.js`.
2. **À mão:** coloque o PDF em `docs/` e acrescente um bloco em `data/documents.js` (copie um existente). A miniatura (`thumb`) é opcional.

Depois, `git add . && git commit -m "novo documento" && git push` — o site atualiza sozinho. Categorias: `metodologia`, `guia`, `relatorio`, `outro` (podem criar outras no mesmo ficheiro, em `categories`). Para **remover**, apague a entrada do JSON e o PDF.

> Nota: o GitHub limita cada ficheiro a 100 MB (aviso a partir de 50 MB). O *handbook* da IUCN é licenciado CC BY-NC 4.0 — mantenha a atribuição à IUCN (já indicada no cartão).

## Estrutura

```
index.html            Página única (Dashboard + Técnica)
css/styles.css        Estilos
js/config.js          ⚙ Links, campos, classes — editar aqui
js/catalog.js         Pilares, indicadores, sub-indicadores e limiares (Excel)
js/i18n.js            Traduções PT/EN (interface, relatórios, metodologia)
js/lri.js             Motor de cálculo do LRI
js/data.js            Leitura paginada do Feature Service
js/dashboard.js       Cartões, gráficos (Chart.js), mapa de calor e tabelas
js/export.js          PDF (jsPDF), Excel (SheetJS) e CSV
js/logos.js           Logos MOZ/SUSTAIN em base64 (para o PDF)
js/app.js             Rotas (#dashboard, #tecnica/submissao, #tecnica/validacao)
data/documents.js   Lista de documentos da aba “Documentos”
docs/                 PDFs (e docs/thumbs/ com as capas)
tools/add_document.py Script para adicionar documentos
js/docs.js            Aba “Documentos”
assets/favicon.svg
assets/logo-*          Logos MOZ, SUSTAIN (cabeçalho) e INDICO (rodapé)
.nojekyll             Impede o Jekyll de processar o site
optional/pages.yml    Workflow opcional de GitHub Actions
```

Bibliotecas (via CDN cdnjs, versões fixas): Chart.js 4.4.1 · jsPDF 2.5.1 · jsPDF-AutoTable 3.8.2 · SheetJS 0.18.5.

## Pré-visualização e testes

* Local: `python3 -m http.server 8000` e abrir `http://localhost:8000/`.
* **Modo demonstração** (dados fictícios para ver o layout completo): `…/index.html?demo=1`.

## Exportações

* **Relatório PDF** (botão no Dashboard): cartões do LRI, indicadores de apoio, todos os gráficos, mapa de calor, tabelas, registos e metodologia, no idioma ativo e respeitando os filtros (ano/distrito).
* **Dados Excel**: resumo, pilares, indicadores, sub-indicadores, mapa de calor e registos. **CSV** dos registos na tabela “Registos / dados”.
