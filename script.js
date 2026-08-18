/* =========================================================
   CPPEM — Formulário de captura
   (rastreamento é feito 100% via Google Tag Manager server-side)

   >>> Redirecionamento usa um único link rastreado (PixelX).
   >>> Backup do lead na planilha: reativado, agora na aba única LEADS,
   >>> a mesma dos demais projetos (UNICIVE, PMPE, COLEGIO).
   ========================================================= */

/* Todos os projetos gravam na MESMA aba da planilha: CPPEM. O ?aba= não
   escolhe a aba de destino — ele identifica QUEM enviou, e o backend usa isso
   para aceitar (ou barrar) o lead e rotular a origem. */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxdFplWVSfhTjvyIA7HIWb645xRjGNhBVhTdTf5UMjo0lSpW_A_jCuys0qB4uImKXPQ/exec?aba=CPPEM";

/* ---------- UTMs ----------
   As UTMs só existem na URL do PRIMEIRO acesso. Se a pessoa recarrega, volta
   pelo histórico, ou o link do anúncio cai numa página que redireciona, o
   ?utm_source= já não está mais lá na hora do submit — e o lead chegava na
   planilha sem origem nenhuma. Por isso gravamos assim que a página carrega e
   lemos do storage no envio (first touch). O try/catch cobre navegador com
   storage bloqueado (aba anônima, ITP), onde o comportamento volta a ser o
   antigo em vez de quebrar o formulário. */
const UTM_CAMPOS = ["utm_source", "utm_campaign"];

(function guardarUTMs() {
  const qs = new URLSearchParams(window.location.search);

  UTM_CAMPOS.forEach((chave) => {
    const valor = qs.get(chave);
    if (!valor) return;

    try {
      sessionStorage.setItem(chave, valor);
    } catch (e) {
      /* storage indisponível: segue sem persistir */
    }
  });
})();

function utm(chave) {
  const daUrl = new URLSearchParams(window.location.search).get(chave);
  if (daUrl) return daUrl;

  try {
    return sessionStorage.getItem(chave) || "";
  } catch (e) {
    return "";
  }
}

/* Link de destino após o envio. URL ABSOLUTA (com https://) — sem o esquema o
   navegador trata como caminho relativo e cai em contato.cppem.com.br/wa.me/... (404). */
const REDIRECT_URL = "https://wa.me/5581973105354?text=Quero%20come%C3%A7ar%20minha%20prepara%C3%A7%C3%A3o!";

/* Tempo antes de redirecionar. Precisa ser suficiente para a PixelX enviar o
   Lead — o handler dela roda no submit, mas a requisição é assíncrona. */
const REDIRECT_DELAY_MS = 1500;

/* --- Elementos (IDs conforme index.html) --- */
const form = document.getElementById("IPEyzyfmJhKQEYIXAlZH");
const nomeInput = document.getElementById("lead_name");
const emailInput = document.getElementById("lead_email");
const telefoneInput = document.getElementById("lead_phone");

/* --- Validação ---
   Cada campo tem o id do input e a chave usada no data-error-for (= atributo name). */
function setError(errorKey, input, msg) {
  const errorEl = document.querySelector(`[data-error-for="${errorKey}"]`);

  if (input) input.classList.add("is-invalid");
  if (errorEl) errorEl.textContent = msg;
}

function clearError(errorKey, input) {
  const errorEl = document.querySelector(`[data-error-for="${errorKey}"]`);

  if (input) input.classList.remove("is-invalid");
  if (errorEl) errorEl.textContent = "";
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* Valida pela contagem de DÍGITOS, não pelo tamanho do texto.

   Atenção ao "+55": a máscara da PixelX ("+{55} (00) [9]0000-0000") renderiza
   o código do país como texto FIXO, e o phone_valid() dela também devolve
   "+5581999674123". Esses dois dígitos entram na contagem e mascaram números
   incompletos — "+55 (81) 9996-741" soma 11 dígitos e passaria por um teste
   ingênuo de "11 dígitos", mesmo faltando 2 do número real.

   Por isso o prefixo de país é removido pelo "+" literal (que a máscara e o
   phone_valid sempre escrevem) antes de contar. Sobra o número nacional, que
   precisa ter DDD (2) + celular (9) = 11 dígitos, com o 9 na terceira posição.
   Remover pelos dígitos seria ambíguo: DDD 55 existe (Santa Maria/RS). */
const isPhone = (v) => {
  const nacional = v.trim().replace(/^\+\s*55\s*/, "");
  const d = nacional.replace(/\D/g, "");

  return d.length === 11 && d[2] === "9";
};

function validate() {
  let ok = true;

  const nome = nomeInput?.value.trim() || "";
  const email = emailInput?.value.trim() || "";
  const tel = telefoneInput?.value.trim() || "";

  clearError("name", nomeInput);
  clearError("email", emailInput);
  clearError("phone", telefoneInput);

  if (nome.length < 2) {
    setError("name", nomeInput, "Informe seu nome completo.");
    ok = false;
  }

  if (!isEmail(email)) {
    setError("email", emailInput, "Informe um e-mail válido.");
    ok = false;
  }

  if (!isPhone(tel)) {
    setError("phone", telefoneInput, "Informe seu WhatsApp com DDD — ex: (81) 90000-0000.");
    ok = false;
  }

  return ok;
}

/* --- Envio --- */
const submitBtn = document.getElementById("lead_submit");

function enviar() {
  if (!validate()) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "ENVIANDO...";
  }

  /* NÃO disparar send_event('Lead') aqui.
     O script da PixelX (servidor) já dispara o Lead no submit deste
     formulário. Chamar send_event manualmente duplicava o evento. */

  /* Backup na planilha. Fire-and-forget de propósito: com mode:"no-cors" não
     dá para ler a resposta, então esperar não garantiria nada — só atrasaria o
     redirect. O REDIRECT_DELAY_MS abaixo já dá folga para a requisição sair. */
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      nome: nomeInput?.value.trim() || "",
      email: emailInput?.value.trim() || "",
      telefone: telefoneInput?.value.trim() || "",
      origem: "CPPEM",
      pagina_url: window.location.href,
      utm_source: utm("utm_source"),
      utm_campaign: utm("utm_campaign")
    })
  }).catch((err) => {
    console.error("[Form] Falha ao salvar na planilha (segue o redirect):", err);
  });

  const successEl = document.getElementById("form-success");
  if (successEl) {
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* Redireciona para o link rastreado.
     O atraso dá tempo do handler de submit da PixelX concluir a requisição
     do Lead antes da página sair — se redirecionar antes, o evento se perde. */
  setTimeout(() => {
    window.location.href = REDIRECT_URL;
  }, REDIRECT_DELAY_MS);
}

/* PRIMEIRA BARREIRA — no clique do botão, fase de captura.
   Se os dados forem inválidos, o preventDefault aqui cancela a ação padrão do
   botão, e o navegador NUNCA chega a disparar o evento "submit". É isso que
   impede a PixelX (que escuta "submit" no formulário) de registrar um Lead
   incompleto. O Enter também passa por aqui: a submissão implícita dispara um
   click no botão de submit padrão do formulário. */
submitBtn?.addEventListener(
  "click",
  (e) => {
    if (!validate()) e.preventDefault();
  },
  true
);

/* SEGUNDA BARREIRA — "submit" capturado no DOCUMENT, não no formulário.
   Um listener de captura no document roda SEMPRE antes de qualquer listener
   registrado no próprio <form>, independente de quem registrou primeiro.
   Isso é o que faltava: a PixelX registra o listener dela no form de dentro do
   start(), que é assíncrono, então não havia garantia de que o nosso viesse
   antes — se o dela rodasse primeiro, ela gravava o Lead antes de vermos que o
   formulário era inválido.

   - Inválido  -> stopImmediatePropagation(): o evento morre aqui e nunca chega
                  à PixelX.
   - Válido    -> deixamos propagar normalmente para ela registrar o Lead.
   Em ambos os casos o preventDefault impede o recarregamento da página. */
document.addEventListener(
  "submit",
  (e) => {
    if (e.target !== form) return;

    e.preventDefault();

    if (!validate()) {
      e.stopImmediatePropagation();
      return;
    }

    enviar();
  },
  true
);

/* =========================================================
   EXIT POPUP — intenção de saída → comunidade

   ⚠️ REGRA CRÍTICA DE TRACKING
   Este formulário NÃO pode gerar Lead. A PixelX dispara o Lead no submit do
   formulário principal (Modelo A). Se o submit deste popup propagar, o cadastro
   na comunidade é contado como lead de venda e contamina a otimização das
   campanhas. A barreira no fim deste arquivo usa stopImmediatePropagation em
   FASE DE CAPTURA — é isso que impede a regra do painel de alcançar este form.
   ========================================================= */

/* --- Configuração --- */
const EXIT_POPUP_ENABLED = true;    // kill switch — false desliga tudo
const ENABLE_BACK_TRAP   = false;   // intercepta o "voltar" no mobile (invasivo)
const ARM_DELAY          = 8000;    // ms mínimos na página antes de armar
const IDLE_DELAY         = 25000;   // ms de inatividade (mobile)
const SNOOZE_DAYS        = 3;       // dias de silêncio após fechar/enviar
const STORAGE_PREFIX     = "cppem_captura";

/* Destino do cadastro na comunidade — link rastreado (PixelX, domínio próprio).
   Vazio = cairia no mesmo destino do formulário principal. */
const COMMUNITY_URL = "https://chat.whatsapp.com/BxOuisctuqV3UWT9ldASe4";

/* OPCIONAL: URL do Apps Script que recebe o cadastro da comunidade.
   Vazio = o popup não armazena nada, só redireciona. */
/* Exit popup da comunidade: continua desligado (string vazia = não envia).
   Para ligar, basta usar a mesma implantação, mudando só a identificação:
   SHEET_URL.replace("?aba=CPPEM", "?aba=CAPTURA_COMUNIDADE") */
const COMMUNITY_ENDPOINT = "";

/* Gatilho mobile: "push" bruto de volta ao topo. Só dispara no gesto inteiro —
   arremesso longo, contínuo, terminando no início da página. */
const SCROLL_UP_MIN_PX = 1200;   // subida mínima acumulada, em px
const SCROLL_UP_MIN_VH = 2;      // ...ou 2 telas cheias, o que for maior
const SCROLL_UP_SPEED  = 1.2;    // px/ms médios (~1200 px/s)
const SCROLL_UP_GAP    = 400;    // ms de pausa que quebram o gesto
const SCROLL_UP_JITTER = 60;     // px de descida tolerados sem zerar o gesto
const SCROLL_UP_TOP    = 200;    // precisa terminar a até N px do topo

const KEY_SEEN      = STORAGE_PREFIX + "_exit_seen";
const KEY_SNOOZE    = STORAGE_PREFIX + "_exit_snooze";
const KEY_CONVERTED = STORAGE_PREFIX + "_lead_converted";

const Store = {
  get(k)     { try { return localStorage.getItem(k); }   catch (e) { return null; } },
  set(k, v)  { try { localStorage.setItem(k, v); }       catch (e) {} },
  sGet(k)    { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  sSet(k, v) { try { sessionStorage.setItem(k, v); }     catch (e) {} }
};

function track(event, data) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(Object.assign({ event: event }, data || {}));
}

function snooze() {
  Store.set(KEY_SNOOZE, String(Date.now() + SNOOZE_DAYS * 86400000));
}

/* --- Elementos --- */
const exitModal = document.getElementById("exit-modal");
const exitForm  = document.getElementById("exit-form");
const exitBtn   = document.getElementById("exit_submit");
const EXIT_FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* =========================================================
   ExitPopup — detecção, abertura e fechamento
   ========================================================= */
const ExitPopup = {
  open: false,
  fired: false,
  submitted: false,
  armed: false,
  trigger: null,
  lastFocused: null,
  cleanup: [],

  isBlocked() {
    if (Store.get(KEY_CONVERTED)) return true;
    if (Store.sGet(KEY_SEEN)) return true;
    const until = parseInt(Store.get(KEY_SNOOZE) || "0", 10);
    return !!(until && Date.now() < until);
  },

  canFire() {
    return this.armed && !this.fired && !this.open && !this.isBlocked();
  },

  // force ignora as travas — usado só pelo console
  show(why, force) {
    if (!exitModal) return;
    if ((!force && !this.canFire()) || this.open) return;

    this.fired = true;
    this.trigger = why;
    this.open = true;
    Store.sSet(KEY_SEEN, "1");

    this.lastFocused = document.activeElement;
    exitModal.hidden = false;
    document.body.style.overflow = "hidden";

    const first = exitModal.querySelector("input");
    if (first) setTimeout(() => first.focus(), 60);

    track("exit_popup_view", { trigger: why });
    this.teardown();
  },

  hide(method) {
    if (!this.open) return;

    if (!this.submitted) {
      track("exit_popup_close", { trigger: this.trigger, method: method || "x" });
      snooze();
    }

    this.open = false;
    exitModal.hidden = true;
    document.body.style.overflow = "";

    if (this.lastFocused && typeof this.lastFocused.focus === "function") {
      this.lastFocused.focus();
    }
    this.lastFocused = null;
  },

  on(target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    this.cleanup.push(() => target.removeEventListener(type, handler, opts));
  },

  teardown() {
    this.cleanup.forEach((fn) => fn());
    this.cleanup = [];
  },

  /* Desktop: cursor saindo pelo topo da viewport */
  watchPointer() {
    this.on(document, "mouseout", (e) => {
      if (!e.relatedTarget && e.clientY <= 0) this.show("desktop");
    });
  },

  /* Mobile: inatividade + push bruto ao topo */
  watchMobile() {
    let idleTimer = null;
    let lastY = window.scrollY;
    let lastT = Date.now();
    let burstPx = 0, burstT = 0, burstN = 0;

    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => this.show("inatividade"), IDLE_DELAY);
    };

    this.on(window, "scroll", () => {
      const y = window.scrollY;
      const t = Date.now();
      const subiu = lastY - y;

      // Descidas pequenas (layout shift de imagem carregando) são ignoradas;
      // senão um único evento espúrio mataria o arremesso inteiro.
      if (subiu <= -SCROLL_UP_JITTER) {
        burstPx = 0; burstT = t; burstN = 0;                    // voltou a descer
      } else if (t - lastT > SCROLL_UP_GAP) {
        burstPx = Math.max(0, subiu); burstT = t; burstN = 1;   // gesto novo
      } else if (subiu > 0) {
        burstPx += subiu; burstN++;                             // mesmo gesto
      }

      lastY = y;
      lastT = t;

      const duracao = t - burstT;
      const distancia = Math.max(SCROLL_UP_MIN_PX, window.innerHeight * SCROLL_UP_MIN_VH);

      // burstN >= 2 é obrigatório: com um único evento a duração é ~0 e a
      // velocidade daria infinito, deixando passar rolagem lenta que o browser
      // entregou coalescida. Aqui o falso negativo é preferível.
      if (burstN >= 2 && duracao > 0 &&
          burstPx >= distancia &&
          burstPx / duracao >= SCROLL_UP_SPEED &&
          y <= SCROLL_UP_TOP) {
        this.show("scroll_up");
        return;
      }

      resetIdle();
    }, { passive: true });

    this.on(document, "touchstart", resetIdle, { passive: true });
    this.on(document, "click", resetIdle);
    this.cleanup.push(() => clearTimeout(idleTimer));

    resetIdle();
  },

  /* Opcional: intercepta o primeiro "voltar" no mobile */
  watchBack() {
    try { history.pushState(null, "", location.href); } catch (e) { return; }

    this.on(window, "popstate", () => {
      if (this.canFire()) {
        try { history.pushState(null, "", location.href); } catch (e) {}
        this.show("back");
      }
    });
  },

  init() {
    if (!EXIT_POPUP_ENABLED || !exitModal) return;
    if (this.isBlocked()) return;

    setTimeout(() => { this.armed = true; }, ARM_DELAY);

    if (window.matchMedia("(pointer: fine)").matches) this.watchPointer();
    else this.watchMobile();

    if (ENABLE_BACK_TRAP) this.watchBack();
  }
};

/* --- Fechar: X, overlay, recusa e ESC --- */
document.querySelectorAll("[data-exit-close]").forEach((el) => {
  el.addEventListener("click", () => {
    const method = el.hasAttribute("data-exit-decline")   ? "recusa"
                 : el.classList.contains("modal__overlay") ? "overlay"
                 : "x";
    ExitPopup.hide(method);
  });
});

document.addEventListener("keydown", (e) => {
  if (!ExitPopup.open) return;

  if (e.key === "Escape") { ExitPopup.hide("esc"); return; }
  if (e.key !== "Tab") return;

  const box = exitModal.querySelector(".modal__box");
  if (!box) return;

  const items = Array.from(box.querySelectorAll(EXIT_FOCUSABLE))
    .filter((n) => !n.disabled && n.offsetParent !== null);
  if (!items.length) return;

  const first = items[0];
  const last = items[items.length - 1];

  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* --- Validação do popup ---
   Chaves próprias no data-error-for para não colidir com o formulário
   principal: querySelector devolveria o primeiro match do documento. */
function validateExit() {
  let ok = true;

  const nomeEl  = document.getElementById("exit_name");
  const emailEl = document.getElementById("exit_email");
  const telEl   = document.getElementById("exit_phone");

  clearError("exit_name", nomeEl);
  clearError("exit_email", emailEl);
  clearError("exit_phone", telEl);

  if ((nomeEl?.value.trim() || "").length < 2) {
    setError("exit_name", nomeEl, "Informe seu nome completo.");
    ok = false;
  }

  if (!isEmail(emailEl?.value.trim() || "")) {
    setError("exit_email", emailEl, "Informe um e-mail válido.");
    ok = false;
  }

  if (!isPhone(telEl?.value.trim() || "")) {
    setError("exit_phone", telEl, "Informe seu WhatsApp com DDD — ex: (81) 90000-0000.");
    ok = false;
  }

  return ok;
}

/* --- Envio --- */
async function enviarComunidade() {
  if (exitBtn) {
    exitBtn.disabled = true;
    exitBtn.textContent = "ENVIANDO...";
  }

  const payload = {
    nome: document.getElementById("exit_name").value.trim(),
    email: document.getElementById("exit_email").value.trim(),
    telefone: document.getElementById("exit_phone").value.trim(),
    origem: "exit_popup_comunidade",
    gatilho: ExitPopup.trigger || "",
    pagina: window.location.href,
    data_envio: new Date().toISOString()
  };

  try {
    if (COMMUNITY_ENDPOINT) {
      await fetch(COMMUNITY_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    }

    ExitPopup.submitted = true;
    Store.set(KEY_CONVERTED, "1");
    snooze();
    track("exit_popup_submit", { trigger: ExitPopup.trigger });

    // Sem form.reset() aqui: ferramentas de tracking leem os campos no blur
    // e o reset pode fazê-las gravar valores vazios.
    const successEl = document.getElementById("exit-success");
    if (successEl) successEl.hidden = false;

    setTimeout(() => {
      window.location.href = COMMUNITY_URL || REDIRECT_URL;
    }, REDIRECT_DELAY_MS);

  } catch (err) {
    console.error("[ExitPopup] Erro ao enviar:", err);

    setError("exit_phone", document.getElementById("exit_phone"), "Erro ao enviar. Tente novamente.");

    if (exitBtn) {
      exitBtn.disabled = false;
      exitBtn.textContent = "QUERO ENTRAR NA COMUNIDADE";
    }
  }
}

/* --- Barreira do popup: submit capturado no DOCUMENT ---
   stopImmediatePropagation SEMPRE, válido ou não: este cadastro é de
   comunidade e nunca pode virar Lead. Sem a flag `true` de captura o listener
   rodaria depois dos listeners do <form>, e a regra do painel já teria
   disparado — a proteção simplesmente não existiria. */
document.addEventListener(
  "submit",
  (e) => {
    if (!exitForm || e.target !== exitForm) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    if (!validateExit()) return;

    enviarComunidade();
  },
  true
);

/* Teste no console:
     ExitPopup.show()       → abre agora, ignorando as travas
     ExitPopup.hide()       → fecha
     ExitPopup.isBlocked()  → diz se alguma trava está impedindo
   Rearmar: sessionStorage.clear(); localStorage.clear() */
window.ExitPopup = ExitPopup;

ExitPopup.init();
