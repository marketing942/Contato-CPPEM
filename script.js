/* =========================================================
   CPPEM — Formulário de captura
   (rastreamento é feito 100% via Google Tag Manager server-side)

   >>> Envio para Google Sheets REMOVIDO temporariamente.
   >>> Redirecionamento agora usa um único link rastreado (PixelX).
   ========================================================= */

/* Link de destino após o envio — link rastreado (PixelX, domínio próprio). */
const REDIRECT_URL = "https://wa.me/5581973105354?text=Quero%20come%C3%A7ar%20minha%20prepara%C3%A7%C3%A3o!%20%F0%9F%92%80%F0%9F%94%A5";

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
const submitBtn = document.getElementById("lead_submit");

async function enviar() {
  if (!validate()) return;

  /* Captura os valores ANTES do reset do formulário. */
  const nome = nomeInput?.value.trim() || "";
  const email = emailInput?.value.trim() || "";
  const telefone = telefoneInput?.value.trim() || "";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "ENVIANDO...";
  }

  /* PixelX — evento de Lead.
     Precisa ser disparado ANTES de qualquer redirecionamento. */
  try {
    await window.pixel_x_app?.send_event({
      // Evento
      event_name: "Lead",

      // Lead
      lead_name: nome,
      lead_email: email,
      lead_phone: telefone,
    });
  } catch (err) {
    console.error("PixelX send_event falhou:", err);
  }

  form?.reset();

  const successEl = document.getElementById("form-success");
  if (successEl) {
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* Escuta o evento "submit" do próprio formulário (e não o "click" do botão):
   assim o evento nativo continua sendo disparado — é ele que o
   pixel_x_app.monitor_forms() escuta — e o preventDefault apenas impede
   a navegação/recarregamento da página. O Enter também cai aqui. */
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  enviar();
});


//    // Redireciona para o link rastreado
//    setTimeout(() => {
//      window.location.href = REDIRECT_URL;
//    }, 700);

