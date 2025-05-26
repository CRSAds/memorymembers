document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  const feedback = document.getElementById("register-feedback");

  if (!form) return;

  // Vul e-mailadres in vanuit de URL (bijv. na Mollie betaling)
  const params = new URLSearchParams(window.location.search);
  const emailFromURL = params.get("email");
  if (emailFromURL) {
    form.email.value = decodeURIComponent(emailFromURL);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    feedback.style.display = "none";

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!username || !email || !password) {
      feedback.textContent = "Alle velden zijn verplicht.";
      feedback.style.display = "block";
      return;
    }

    try {
      const res = await fetch("https://memorymembers.vercel.app/api/register-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        feedback.textContent = data?.message || "Registratie mislukt.";
        feedback.style.display = "block";
        return;
      }

      // ✅ Succes: toegang meegeven als token bestaat in URL
      const token = params.get("token");
      if (token) {
        await fetch("https://memorymembers.vercel.app/api/use-payment-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token })
        });
      }

      feedback.textContent = "Registratie is gelukt. Je kunt nu inloggen!";
      feedback.classList.remove("error");
      feedback.classList.add("success");
      feedback.style.display = "block";

      // Reset formulier of focus naar login
      form.reset();

    } catch (err) {
      console.error("Fout bij registratie:", err);
      feedback.textContent = "Er ging iets mis. Probeer het opnieuw.";
      feedback.style.display = "block";
    }
  });
});
