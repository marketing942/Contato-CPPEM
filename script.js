/* =========================================================
   CPPEM — Formulário de captura
   (rastreamento é feito 100% via Google Tag Manager server-side)

   >>> Envio para Google Sheets REMOVIDO temporariamente.
   >>> Redirecionamento agora usa um único link rastreado (PixelX).
   ========================================================= */

/* Link de destino após o envio — link rastreado (PixelX, domínio próprio). */
const REDIRECT_URL = "https://pxa.cppem.com.br/lt/cppem-contato-grupos";

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

  if (tel.length < 1) {
    setError("phone", telefoneInput, "Informe seu WhatsApp.");
    ok = false;
  }

  return ok;
}

/* --- Envio --- */
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validate()) return;

    const btn = form.querySelector("button[type='submit']");

    if (btn) {
      btn.disabled = true;
      btn.textContent = "ENVIANDO...";
    }

    // Envia o evento de conversão para o GTM server-side.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "lead_submit",
      form_id: "cppem_captura"
    });

    // Mostra sucesso
    form.reset();

    const successEl = document.getElementById("form-success");

    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    // Redireciona para o link rastreado
    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 700);
  });
}
