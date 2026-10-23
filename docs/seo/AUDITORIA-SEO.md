# Auditoria SEO — Contato CPPEM

Repositório: [`marketing942/Contato-CPPEM`](https://github.com/marketing942/Contato-CPPEM) · branch `seo/otimizacao-organica-20261023` (base `main`) · 23/10/2026
Relatório consolidado do ecossistema: [RELATORIO-GERAL-SEO-ECOSSISTEMA.md](RELATORIO-GERAL-SEO-ECOSSISTEMA.md)

## Arquitetura

- **Domínio de produção:** contato.cppem.com.br — evidência: mapa de origens do `google-apps-script.js` (`CPPEM: captura-cppem (contato.cppem.com.br)`) e comentário do `script.js` (linha 52).
- **Stack:** HTML + CSS + JavaScript estáticos, sem build. Vercel (`cleanUrls`, `trailingSlash: false`). Fontes do Google (Oxanium, Rajdhani).
- **Renderização:** HTML estático: todo o conteúdo, headings e links já vêm no HTML inicial (não depende de JavaScript para ser lido).

## Rotas

| Rota | O que é | Indexação |
|---|---|---|
| / | Captação de leads CPPEM Concursos (ficha → planilha → WhatsApp) + popup de saída para a comunidade | Indexar |

## Finalidade e classificação

- **Objetivo:** Página de captação da CPPEM Concursos para quem quer se preparar para concursos policiais (PM, PC, PRF, PF, Penal). CTA: "QUERO ESTUDAR CERTO" (ficha de inscrição) → WhatsApp.
- **Unidade de negócio:** CPPEM Concursos
- **Público:** Candidatos a carreiras policiais, iniciantes e quem estuda sem método.
- **Tipo de página:** Página de captura (lead) com argumentos de venda (dores, comparativo, prova social).
- **Indexação recomendada:** Indexar. A página tem conteúdo próprio (sonhos, dores, comparativo, prova social) e atende a intenção "preparatório para concursos policiais".
- **Potencial orgânico:** **Médio** — Termos genéricos de alta concorrência e conteúdo enxuto; a página serve melhor a buscas de marca e de cauda média. O site institucional (cppem.com.br, fora deste escopo) tende a ser o destino natural dos termos amplos.

## Problemas encontrados

Gravidade: **P0** crítico (indexação/integridade) · **P1** alto impacto · **P2** médio · **P3** evolução · **Info** registro sem ação de SEO.

| Sev. | Problema | Evidência | Impacto | Status |
|---|---|---|---|---|
| P1 | og:image quebrada | `<meta property="og:image" content="/bg-collage.jpg">` — o arquivo está em `/public/bg-collage.jpg`; na raiz não existe | Preview sem imagem no WhatsApp/Facebook/LinkedIn (CTR social) | Corrigido |
| P1 | Sem canonical | Nenhum `<link rel="canonical">`; o projeto também responde no domínio `*.vercel.app` e recebe tráfego com UTM | Sinais divididos entre URLs duplicadas | Corrigido |
| P1 | Title disputando "PMPE" com a pmpe.cppem.com.br | Title antigo: `CPPEM Concursos — Preparação para Concursos Policiais (PMPE)` | Canibalização com a página da Mentoria PMPE | Corrigido |
| P1 | Fotos do carrossel com 14,7 MB | 14 arquivos `public/foto*.webp` com 3024×4032 exibidos a no máximo 240 px (`.carousel__item{width:clamp(160px,26vw,240px)}`) | Consumo de dados e decodificação pesada no celular | Corrigido (600×800, 0,74 MB) |
| P2 | Open Graph incompleto | Sem `og:url`, `og:description`, `og:type`, `og:locale`, `og:site_name`, `twitter:card` | Preview genérico | Corrigido |
| P2 | Sem dados estruturados | Nenhum JSON-LD | Google sem a entidade CPPEM e sem o nome do site para o subdomínio | Corrigido (Organization, WebSite, WebPage) |
| P2 | Sem robots.txt e sitemap.xml | Arquivos ausentes | Descoberta e controle de rastreamento | Corrigido |
| P2 | Arquivos internos publicados | A Vercel publica tudo da raiz: `README.md`, `TRACKING.md`, `EXIT-POPUP.md`, `google-apps-script.js`, `validar-tracking.js` | Conteúdo interno indexável e exposto | Mitigado (Disallow no robots.txt); `.vercelignore` completo depende de aprovação |
| P3 | H1 sem o termo de busca | H1: "A sua preparação para vestir a farda começa com direção." | Relevância on-page para "concurso policial" vem só do title e do rodapé | Recomendado (copy) |
| P3 | Fontes do Google bloqueando a renderização | Lighthouse: `render-blocking-resources` (Google Fonts + styles.css) | FCP/LCP no 4G | Recomendado |
| Info | Dois números de WhatsApp diferentes | Rodapé `wa.me/558173105354`; redirecionamento do formulário `wa.me/5581973105354` | Pode ser intencional (número com/sem o 9); confirmar | Documentado |
| Info | Razão social divergente entre páginas | Aqui: "CPPEM Concursos Públicos LTDA." (CNPJ 57.347.872/0001-48); no Colégio e no SRV: "CPPEM Colégio e Cursos LTDA" com o mesmo CNPJ | Consistência de entidade (E-E-A-T) | Documentado |

## Limitações desta auditoria

- **Produção inacessível desta sessão.** O proxy de rede do ambiente recusou
  conexões a `*.cppem.com.br` e `*.vercel.app`, e o leitor de páginas não
  resolveu esses domínios. Nada foi medido no site publicado: HTML servido,
  status HTTP, redirecionamentos e headers reais ficam **não validados**.
  Toda a auditoria foi feita no código e em servidores locais.
- **Sem Google Search Console, GA4, Keyword Planner, Trends, Semrush ou Ahrefs.**
  Não há volume, dificuldade, CPC nem posição. Nenhum número desse tipo
  aparece aqui. As prioridades de palavra-chave são **estimativas
  qualitativas** (intenção, tipo de página que aparece hoje, relevância
  comercial) e devem ser confirmadas no Search Console e no Planejador.
- **SERP observada com a busca web disponível, que não é o Google.** Os
  concorrentes listados são os que apareceram nessa busca e servem como
  indício, não como ranking do Google.
- **Lighthouse é dado de laboratório**, rodado localmente com os terceiros
  (GTM, PixelX, fontes do Google) bloqueados. Serve para comparar antes ×
  depois, não para prever o Core Web Vitals real (dado de campo do CrUX).
