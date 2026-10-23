# Auditoria de tracking — Contato CPPEM

Repositório: [`marketing942/Contato-CPPEM`](https://github.com/marketing942/Contato-CPPEM) · branch `seo/otimizacao-organica-20261023` (base `main`) · 23/10/2026
Relatório consolidado do ecossistema: [RELATORIO-GERAL-SEO-ECOSSISTEMA.md](RELATORIO-GERAL-SEO-ECOSSISTEMA.md)

Regra seguida: nenhum ID, evento, parâmetro, script, seletor, endpoint, UTM ou
regra de consentimento foi alterado. Nenhum token ou credencial aparece aqui.

## Inventário

| Integração | Onde | Detalhe |
|---|---|---|
| GTM server-side (loader first-party) | `index.html`, 1º script do `<head>` | `https://sgtm.cppem.com.br/metrics/` — o ID do container está no path; mesmo container das demais landings |
| GTM noscript | `index.html`, `<body>` | `https://sgtm.cppem.com.br/ns.html?id=GTM-PJ379FLQ` |
| PixelX | carregada pelo GTM (`pxa.cppem.com.br`) | máscara de telefone `.pxa_mask_phone`; o Lead é a regra do painel vinculada ao `id` do `<form>` |
| Formulário principal | `form#IPEyzyfmJhKQEYIXAlZH` (name `lead_form`) | campos `lead_name`/`lead_email`/`lead_phone` com `name` name/email/phone — id registrado no painel da PixelX |
| Formulário do popup de saída | `form#exit-form` | leva ao grupo do WhatsApp (`chat.whatsapp.com/...`) |
| Planilha de leads | `script.js` → POST no Apps Script `?aba=CPPEM` | campos enviados: email, nome, origem, pagina_url, telefone, utm_campaign, utm_source |
| UTMs | `script.js` | captura `utm_source` e `utm_campaign` |
| Redirecionamento pós-envio | `script.js` | `wa.me/5581973105354?text=...` |
| dataLayer | `script.js` (função auxiliar, linha ~275) | push de eventos próprios; no teste só `gtm.js` foi observado (o Lead é da PixelX) |

## Antes × depois

- Arquivos de tracking/fluxo (`script.js`, `styles.css`, `google-apps-script.js`, `validar-tracking.js`): **sem nenhuma alteração** (`git diff` vazio).
- Mudanças só em `<head>` (metadados/JSON-LD), arquivos novos (robots, sitemap,
  imagens OG) e imagens otimizadas com o mesmo nome.
- Resultado dos testes de execução: ver [RELATORIO-DE-TESTES.md](RELATORIO-DE-TESTES.md).

## Classificação

- GTM loader, noscript, dataLayer, formulários, campos enviados à planilha,
  UTMs e redirecionamentos: **validado por teste de execução** (antes × depois idênticos).
- Lead da PixelX / conversões no Meta e no GTM server-side: **não validado por falta de acesso**.

## Riscos remanescentes

- O mesmo id de formulário (`IPEyzyfmJhKQEYIXAlZH`) está na Mentoria Individual e no Supletivo. Na PixelX, Leads das três páginas podem cair na mesma regra — confirmar no painel se é intencional (TRACKING.md §8.1 trata exatamente disso). Não alterado.
