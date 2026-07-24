/* =========================================================
   CPPEM — Formulário de captura
   (rastreamento é feito 100% via Google Tag Manager server-side)

   >>> Envio para Google Sheets REMOVIDO temporariamente.
   >>> Redirecionamento agora usa um único link rastreado (PixelX).
   ========================================================= */

/* Link de destino após o envio — link rastreado (PixelX, domínio próprio). */
const REDIRECT_URL = "https://wa.me/5581973105354?text=Quero%20come%C3%A7ar%20minha%20prepara%C3%A7%C3%A3o!%20%F0%9F%92%80%F0%9F%94%A5";

/* --- Elementos (IDs conforme index.html) --- */
const form = document.getElementById("lead_form");
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
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const btn = form.querySelector("button[type='submit']");

    if (btn) {
      btn.disabled = true;
      btn.textContent = "ENVIANDO...";
    }

    // Dados do lead (capturados antes do reset do formulário)
    const name = nomeInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const phone = telefoneInput?.value.trim() || "";

    // Envia o evento de conversão para o PixelX
    await window.pixel_x_app.send_event({
      // Evento
      event_name: "Lead",

      // Lead
      lead_name: name,
      lead_email: email,
      lead_phone: phone
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
    // >>> DESATIVADO TEMPORARIAMENTE para teste de rastreamento — reativar depois.
    // setTimeout(() => {
    //   window.location.href = REDIRECT_URL;
    // }, 700);
  });
}
