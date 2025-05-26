document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const paymentToken = urlParams.get("token");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const response = await fetch("https://memorymembers.vercel.app/api/register-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, token: paymentToken })
      });

      const result = await response.json();

      if (!response.ok) {
        document.getElementById("register-feedback").textContent = result.message || "Registratie mislukt.";
        return;
      }

      document.getElementById("register-feedback").textContent = "✅ Registratie gelukt. Je kunt nu inloggen!";
      document.getElementById("register-feedback").style.color = "green";
      form.reset();

    } catch (err) {
      console.error("Fout bij registratie:", err);
      document.getElementById("register-feedback").textContent = "Kon niet registreren. Probeer opnieuw.";
    }
  });
});
