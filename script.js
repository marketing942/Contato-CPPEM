/* =========================================================
   CPPEM — Formulário de captura
   (rastreamento é feito 100% via Google Tag Manager server-side)

   >>> Envio para Google Sheets REMOVIDO temporariamente.
   >>> Redirecionamento agora usa um único link rastreado (PixelX).
   ========================================================= */

/* Link de destino após o envio — link rastreado (PixelX, domínio próprio). */
const REDIRECT_URL = "https://wa.me/5581973105354?text=Quero%20come%C3%A7ar%20minha%20prepara%C3%A7%C3%A3o!%20%F0%9F%92%80%F0%9F%94%A5";

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

