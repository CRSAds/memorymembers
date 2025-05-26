document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const feedbackEl = document.getElementById("login-feedback");
  if (!form || !feedbackEl) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = form.email?.value.trim();
    const password = form.password?.value.trim();
    if (!email || !password) {
      feedbackEl.textContent = "Vul je e-mailadres en wachtwoord in.";
      feedbackEl.style.display = "block";
      return;
    }

    try {
      const response = await fetch("https://memorymembers.vercel.app/api/login-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok) {
        feedbackEl.textContent = result.message || "Inloggen mislukt.";
        feedbackEl.style.display = "block";
        return;
      }

      // ✅ Tokens en profiel opslaan
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem("expires", result.expires);
      localStorage.setItem("player", JSON.stringify(result.user));

      // ✅ Toegang checken
      const accessDate = result.user.paid_access_until;
      const now = new Date();
      if (!accessDate || new Date(accessDate) < now) {
        feedbackEl.innerHTML = `
          <p>Je hebt nog geen toegang tot het spel.</p>
          <a href="https://nl.wincadeaukaarten.com/memory-betaalpagina" class="cta-button">Betaal nu om toegang te krijgen</a>
        `;
        feedbackEl.style.display = "block";
        return;
      }

      // ✅ Door naar spel
      feedbackEl.style.display = "none";
      window.location.href = "/memorygamespelen";

    } catch (err) {
      console.error("Fout bij login:", err);
      feedbackEl.textContent = "Kon niet inloggen. Probeer het opnieuw.";
      feedbackEl.style.display = "block";
    }
  });
});
