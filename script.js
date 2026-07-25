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

/* Valida pela contagem de DÍGITOS, não pelo tamanho do texto — o campo pode
   chegar aqui mascarado "(81) 97310-5354" (15 chars), cru "81973105354"
   (11 chars) ou já normalizado pela PixelX "+5581973105354" (14 chars).
   Exige celular brasileiro: DDD + 9 dígitos = 11 dígitos. */
const isPhone = (v) => {
  let d = v.replace(/\D/g, "");
  if (d.length === 13 && d.startsWith("55")) d = d.slice(2);
  return d.length === 11;
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

/* SEGUNDA BARREIRA — no "submit" do formulário.
   Só é alcançada quando a validação passou, então o evento nativo dispara
   normalmente (a PixelX captura o Lead) e o preventDefault apenas impede o
   recarregamento da página. */
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  enviar();
});

