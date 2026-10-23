# Implementações de SEO — Contato CPPEM

Repositório: [`marketing942/Contato-CPPEM`](https://github.com/marketing942/Contato-CPPEM) · branch `seo/otimizacao-organica-20261023` (base `main`) · 23/10/2026
Relatório consolidado do ecossistema: [RELATORIO-GERAL-SEO-ECOSSISTEMA.md](RELATORIO-GERAL-SEO-ECOSSISTEMA.md)

Commits na branch `seo/otimizacao-organica-20261023`. Nada foi publicado; merge e deploy dependem de aprovação.

## Arquivos modificados

| Arquivo | Alteração | Por quê |
|---|---|---|
| index.html (`<head>`) | Title, description, canonical, robots, Open Graph completo com imagem 1200+ px absoluta, Twitter card e JSON-LD (Organization, WebSite, WebPage) | Relevância, CTR, consolidação de URLs e nome do site no Google |
| index.html (rodapé) | `width`/`height`/`loading=lazy` no logo do rodapé (o CSS já fixa 56 px de altura) | Reserva de espaço e carregamento sob demanda |
| public/foto1…14.webp | 3024×4032 → 600×800, mesmo nome, mesma proporção, perfil de cor preservado (14,7 MB → 0,74 MB) | Peso da página no celular |
| robots.txt (novo) | Libera o site, bloqueia `/docs/` e arquivos internos, aponta o sitemap | Controle de rastreamento |
| sitemap.xml (novo) | A URL canônica | Descoberta |
| .vercelignore (novo) | Só `docs/seo/` — os relatórios desta operação não vão para o ar | Não expor a auditoria |

## Metadados — antes × depois

Extraídos do HTML renderizado localmente (Playwright/HTTP), antes e depois.

| Campo | Antes | Depois |
|---|---|---|
| `title` | CPPEM Concursos — Preparação para Concursos Policiais (PMPE) | Preparatório para Concursos Policiais \| CPPEM Concursos |
| `description` | Entre para a lista do CPPEM e receba orientação para concursos policiais. PM, PC, PRF, PF e Penal. | Preparação para concursos policiais (PM, PC, PRF, PF e Polícia Penal) com plano guiado, mentoria e simulados. Preencha a ficha e fale com o CPPEM no WhatsApp. |
| `canonical` | — | https://contato.cppem.com.br/ |
| `robots` | — | index, follow, max-image-preview:large |
| `og:description` | — | Plano guiado, mentoria e simulados para concursos policiais: PM, PC, PRF, PF e Polícia Penal. Cadastro gratuito. |
| `og:image` | /bg-collage.jpg | https://contato.cppem.com.br/public/bg-collage.jpg |
| `og:url` | — | https://contato.cppem.com.br/ |
| `og:type` | — | website |
| `og:site_name` | — | CPPEM Concursos Públicos |
| `og:locale` | — | pt_BR |
| `twitter:card` | — | summary_large_image |
| JSON-LD |  | Organization, WebSite, WebPage |

## Dados estruturados

Só tipos aplicáveis e só com dados que a página mostra. Nada de avaliações,
preços inventados, prêmios ou credenciais. Sem `FAQPage` (o resultado de FAQ
foi restrito a sites de governo e saúde em 2023 — [Google — Mudanças nos resultados de FAQ/HowTo (2023)](https://developers.google.com/search/blog/2023/08/howto-faq-changes) — e o
changelog da documentação registra a descontinuação em 2026 — [Google — Atualizações da documentação da Pesquisa (changelog)](https://developers.google.com/search/updates)) e sem `Course`
(o Course Info saiu dos resultados em 2025: [Google — Simplificação da página de resultados (Course Info descontinuado, 2025)](https://developers.google.com/search/blog/2025/06/simplifying-search-results)). Sem promessa
de resultado enriquecido.

## Benefícios esperados

- Título e descrição alinhados à intenção principal → mais impressões
  relevantes e CTR (a confirmar no Search Console).
- Canonical absoluto → sinais concentrados no domínio de produção
  ([Google — Como especificar uma URL canônica](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)).
- `WebSite` com `name` no subdomínio → chance de o Google exibir o nome do site
  em vez do host ([Google — Nomes de sites na Pesquisa (subdomínios)](https://developers.google.com/search/docs/appearance/site-names)).
- Preview correto no WhatsApp/redes (tráfego de compartilhamento).
