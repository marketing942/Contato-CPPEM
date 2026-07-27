# Exit Popup (Exit Intent) — CPPEM Captura

Popup de intenção de saída instalado nesta landing. Mesmo padrão do site da PMPE,
adaptado à identidade visual daqui (dourado sobre grafite, Oxanium + Rajdhani).

---

## 1. O que faz

Recupera o visitante que está saindo sem preencher o formulário, oferecendo uma
**segunda porta de menor atrito**: a comunidade gratuita no WhatsApp.

```text
[selo]      ESPERA UM POUCO
[título]    NÃO DESISTA DO SEU SONHO DE VESTIR A FARDA!
[sub]       Inscreva-se abaixo para receber:
[benefício] ✓ Comunidade com notícias diárias, materiais gratuitos,
              questões e descontos!
[form]      Nome completo · E-mail · Seu WhatsApp com DDD
[cta]       QUERO ENTRAR NA COMUNIDADE
[recusa]    Não, quero continuar sem ajuda
```

---

## 2. Destino do cadastro

### Para onde o lead vai (definido)

```js
const COMMUNITY_URL = "https://pxa.cppem.com.br/lt/cppem-contato-grupos";
```

Link rastreado no domínio próprio da PixelX, mesmo padrão do `REDIRECT_URL` do
formulário principal.

> ⚠️ **Confira no painel se esse link `/lt/` está configurado como conversão.**
> Se estiver, o clique registra conversão e desfaz justamente a separação que a
> barreira de submit garante — ver [§3](#3-️-tracking--o-ponto-mais-importante).
> Não dá para verificar pelo código; só abrindo o painel.

### ⚠️ Onde o lead é armazenado (pendente)

```js
const COMMUNITY_ENDPOINT = "";   // vazio = não armazena nada, só redireciona
```

Hoje o popup **não guarda o cadastro** — apenas leva a pessoa para o grupo. O
envio ao Sheets foi removido deste site ("temporariamente", conforme o cabeçalho
do `script.js`), e reativá-lo é decisão de negócio, não minha. O código já está
pronto: basta a URL.

**Duas opções:**

| Opção | URL | Consequência |
|---|---|---|
| **A — reaproveitar a implantação da PMPE** | `https://script.google.com/macros/s/AKfycbxd.../exec?aba=CAPTURA_COMUNIDADE` | Os cadastros caem na **planilha da PMPE**, em aba própria. Uma planilha só para tudo. |
| **B — implantação separada** | nova URL do Apps Script deste site | Planilha própria desta landing. Mais isolado, mais coisas para manter. |

Em qualquer uma delas, use uma **aba própria** (`?aba=CAPTURA_COMUNIDADE`) para
não misturar com o funil de venda.

> **Pré-requisito das duas:** o [google-apps-script.js](google-apps-script.js)
> deste repositório foi corrigido para respeitar o parâmetro `?aba=` — a versão
> anterior usava `getActiveSheet()` e ignorava a query string, então tudo cairia
> na mesma aba. Cole o arquivo atualizado no Apps Script e faça **nova
> implantação** ("Implantar → Nova implantação", não "gerenciar existente").

---

## 3. ⚠️ Tracking — o ponto mais importante

Leia o [TRACKING.md](TRACKING.md) antes de mexer aqui.

Este site roda **Modelo A**: a PixelX dispara o `Lead` no submit do formulário
principal, por uma regra do painel. Isso cria um risco direto:

> Se o submit do popup propagar, a regra do painel conta o cadastro na
> comunidade como **lead de venda**.

Quem entra num grupo de WhatsApp tem intenção muito menor que quem pede contato
comercial. Misturar os dois **degrada a otimização das campanhas** — o algoritmo
passa a buscar gente parecida com quem só queria material grátis.

### Como está resolvido

```js
document.addEventListener("submit", (e) => {
  if (!exitForm || e.target !== exitForm) return;
  e.preventDefault();
  e.stopImmediatePropagation();   // <- nenhuma regra externa alcança este form
  if (!validateExit()) return;
  enviarComunidade();
}, true);                          // <- FASE DE CAPTURA
```

**A flag `true` é o ponto inteiro.** Um listener de captura no `document` roda
sempre antes de qualquer listener registrado no `<form>` — inclusive os que a
PixelX instala de dentro de um `start()` assíncrono. Sem ela, o listener rodaria
depois e a regra do painel já teria disparado.

> Isso não interfere nas duas barreiras que já existiam para o formulário
> principal. Elas continuam funcionando: um teste confirma que o form principal
> **ainda propaga** normalmente para o painel.

### Eventos que o popup emite

| Evento `dataLayer` | Quando | Parâmetros |
|---|---|---|
| `exit_popup_view` | popup apareceu | `trigger` |
| `exit_popup_submit` | envio com sucesso | `trigger` |
| `exit_popup_close` | fechou sem enviar | `trigger`, `method` |

Se criar tag no GTM para o cadastro da comunidade, use `exit_popup_submit`.
**Nunca** aponte a tag de `Lead` para ele.

---

## 4. Os gatilhos

Plataforma detectada por `matchMedia('(pointer: fine)')` — nunca por user-agent.

| Plataforma | Gatilho | Condição |
|---|---|---|
| Desktop | Cursor sai pelo topo | `mouseout` sem `relatedTarget` e `clientY <= 0` |
| Mobile | Inatividade | 25s sem scroll, toque ou clique |
| Mobile | *Push* bruto ao topo | regra abaixo |
| Mobile | Botão voltar | só com `ENABLE_BACK_TRAP = true` |

Todos exigem 8s de permanência mínima na página.

### O *push* bruto ao topo

Subir rápido não basta — isso dispararia em rolagem comum. O gatilho exige o
**gesto inteiro**, e só dispara quando **todas** as condições valem juntas:

| Condição | Valor | Por quê |
|---|---|---|
| Distância acumulada | ≥ `1200px` ou 2 telas cheias | Descarta subidas curtas |
| Velocidade média | ≥ `1.2 px/ms` | Separa arremesso de rolagem deliberada |
| Posição final | ≤ `200px` do topo | "Foi até o início de uma vez" |
| Eventos no burst | ≥ 2 | Sem 2 eventos não há intervalo para medir velocidade |

O burst zera se o usuário descer mais de `60px` ou passar `400ms` sem evento.
Descidas menores são toleradas: um *layout shift* de imagem carregando não pode
matar o gesto.

A exigência de 2 eventos existe porque, quando o browser entrega o gesto
coalescido num único evento, a duração é ~0 e a velocidade tenderia ao infinito —
fazendo rolagem lenta passar por arremesso. **A regra erra deliberadamente para o
lado de não aparecer.**

---

## 5. Travas de exibição

Avaliadas nesta ordem; falhou uma, não abre:

1. `EXIT_POPUP_ENABLED === true`
2. Já passou o `ARM_DELAY` (8s)
3. Não apareceu ainda nesta sessão
4. O silêncio de `SNOOZE_DAYS` (3 dias) expirou
5. A pessoa nunca se cadastrou na comunidade

| Chave | Onde | Para quê |
|---|---|---|
| `cppem_captura_exit_seen` | sessionStorage | 1 exibição por sessão |
| `cppem_captura_exit_snooze` | localStorage | silêncio de 3 dias após fechar/enviar |
| `cppem_captura_lead_converted` | localStorage | quem se cadastrou nunca mais vê |

O prefixo `cppem_captura` evita colisão com outras landings da CPPEM.

---

## 6. Design — dentro do padrão do site

O site **não tinha modal nenhum**, então o `.modal` foi criado do zero usando os
tokens existentes. Nenhuma cor, fonte ou variável nova.

| Elemento | Vem de |
|---|---|
| Caixa | Mesmo tratamento translúcido do `.form` do herói: gradiente + `blur(14px)`, `border-top:3px solid var(--gold)`, raio 16px |
| Selo superior | `.eyebrow` — dourado, `letter-spacing:.28em`, com a régua de 26px |
| Título | `var(--font-title)` (Oxanium) 800 uppercase, com `<span>` em `var(--gold)` |
| Card de benefício | `var(--bg-3)` com `var(--border-active)`, ✓ dourado |
| Inputs | `.field input` — reaproveitado direto |
| Botão | `.cta` — mesmo gradiente dourado do formulário principal |
| Nota / sucesso | `.note`, `.success` |

Validado visualmente em **1280px e 390px**. Respeita
`prefers-reduced-motion`.

---

## 7. Configuração

Tudo no topo do bloco novo em [script.js](script.js):

```js
const EXIT_POPUP_ENABLED = true;    // kill switch — false desliga tudo
const ENABLE_BACK_TRAP   = false;   // "voltar" no mobile (eficaz e invasivo)
const ARM_DELAY          = 8000;    // ms mínimos na página
const IDLE_DELAY         = 25000;   // ms de inatividade (mobile)
const SNOOZE_DAYS        = 3;       // silêncio após fechar/enviar
const STORAGE_PREFIX     = "cppem_captura";

const SCROLL_UP_MIN_PX = 1200;  const SCROLL_UP_GAP    = 400;
const SCROLL_UP_MIN_VH = 2;     const SCROLL_UP_JITTER = 60;
const SCROLL_UP_SPEED  = 1.2;   const SCROLL_UP_TOP    = 200;
```

| Quero... | Faço |
|---|---|
| Desligar o popup | `EXIT_POPUP_ENABLED = false` |
| Gatilho de scroll mais difícil | aumentar `SCROLL_UP_MIN_PX` ou `SCROLL_UP_SPEED` |
| Desligar só o gatilho de scroll | `SCROLL_UP_MIN_PX = 999999` |
| Testar sem esperar | console: `ExitPopup.show()` |
| Descobrir por que não abre | console: `ExitPopup.isBlocked()` |
| Rearmar | console: `sessionStorage.clear(); localStorage.clear()` |

---

## 8. Testes

**22 casos** rodados em Chrome real, com um espião registrado no `<form>`
simulando a regra de submit do painel:

- popup começa oculto, não armado, não bloqueado em sessão limpa
- abre, trava o scroll, emite `exit_popup_view`, marca a sessão
- validação dos 3 campos, incluindo telefone incompleto
- **erro do popup não vaza para o formulário principal** (chaves de
  `data-error-for` separadas)
- envio emite `exit_popup_submit`, marca convertido e redireciona
- **a regra do painel não alcança o popup** ← o teste que importa
- campos não são limpos antes do redirect
- fecha, destrava o scroll, não emite `close` depois de enviar
- bloqueia permanentemente após cadastro
- **o formulário principal continua propagando para o painel** (Modelo A intacto)

---

## 9. Checklist antes de publicar

- [x] `COMMUNITY_URL` preenchido com o link rastreado dos grupos
- [ ] Confirmado no painel que o link `/lt/` **não** está marcado como conversão
- [ ] `COMMUNITY_ENDPOINT` decidido (preencher ou assumir que não armazena)
- [ ] Se preencher o endpoint, apontar para uma **aba separada** da planilha
- [ ] Nova implantação do Apps Script feita (senão o `?aba=` é ignorado)
- [ ] Desktop: sair pelo topo abre o popup uma vez, após 8s
- [ ] Mobile: rolagem normal para cima **não** abre
- [ ] Mobile: *push* bruto até o topo abre
- [ ] `ESC`, X e overlay fecham
- [ ] `Tab` circula dentro do popup
- [ ] No preview do GTM: o cadastro do popup **não** dispara a tag de `Lead`
- [ ] O formulário principal continua gerando `Lead` normalmente
- [ ] Testado em 360px de largura

> A validação final do gesto por toque só existe em **celular real** — headless
> não reproduz momentum de scroll com fidelidade.

---

## 10. Limitações honestas

- **Exit intent de verdade não existe no mobile.** Não há evento de "vou sair".
  Inatividade e *push* ao topo são aproximações de comportamento. Parte do
  tráfego mobile sai sem ver o popup.
- **Canibalização é possível.** Alguém que preencheria o formulário principal
  pode pegar a oferta mais fácil. Meça com os eventos de `dataLayer` — a métrica
  que importa é se o formulário principal **caiu** no mesmo período.
- **A PixelX captura campos no `blur`, independente de submit.** Os campos do
  popup usam `name="name|email|phone"`, que casam com as keywords dela, então
  dados parciais chegam ao painel como captura de lead. Isso **não** é evento de
  `Lead` e não afeta as campanhas.
- **Uma regra de conversão por clique no painel duplicaria**, e nenhum código de
  site consegue impedir: o clique acontece antes do submit.
