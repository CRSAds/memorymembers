document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const response = await fetch("https://memorymembers.vercel.app/api/login-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok) {
        document.getElementById("login-feedback").textContent = result.message || "Inloggen mislukt.";
        return;
      }

      // Tokens en profiel opslaan
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem("expires", result.expires);
      localStorage.setItem("player", JSON.stringify(result.user));

      // ✅ Toegang checken
      const accessDate = result.user.paid_access_until;
      if (!accessDate || new Date(accessDate) < new Date()) {
        document.getElementById("login-feedback").innerHTML = `
          <p>Je hebt nog geen toegang tot het spel.</p>
          <a href="https://nl.wincadeaukaarten.com/memory-betaalpagina" class="cta-button">Betaal nu om toegang te krijgen</a>
        `;
        return;
      }

      // ✅ Door naar spel
      window.location.href = "/memorygamespelen";

    } catch (err) {
      console.error("Fout bij login:", err);
      document.getElementById("login-feedback").textContent = "Kon niet inloggen. Probeer opnieuw.";
    }
  });
});
