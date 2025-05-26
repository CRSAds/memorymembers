document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  const feedback = document.getElementById("register-feedback");

  // ✅ Check op token in URL (bij betaling zonder email)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    console.log("🟢 Geregistreerd met payment token:", token);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    feedback.textContent = "";
    feedback.style.display = "none";

    try {
      const res = await fetch("https://memorymembers.vercel.app/api/register-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        feedback.textContent = data?.message || "Registratie mislukt.";
        feedback.className = "feedback error";
        feedback.style.display = "block";
        return;
      }

      // ✅ Geregistreerd — eventueel token verwerken
      if (token) {
        await fetch("https://memorymembers.vercel.app/api/use-payment-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token })
        });
      }

      feedback.textContent = "Registratie is gelukt. Je kunt nu inloggen!";
      feedback.className = "feedback success";
      feedback.style.display = "block";
      form.reset();

    } catch (err) {
      console.error("Fout bij registratie:", err);
      feedback.textContent = "Fout bij verzenden. Probeer opnieuw.";
      feedback.className = "feedback error";
      feedback.style.display = "block";
    }
  });
});
