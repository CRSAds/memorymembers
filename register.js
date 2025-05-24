document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!username || !email || !password) {
      console.warn("Formulier onvolledig ingevuld.");
      return;
    }

    try {
      const response = await fetch("https://memorymembers.vercel.app/api/register-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Account succesvol aangemaakt!");
        window.location.href = "/memorygamespelen";
      } else {
        console.error("Fout bij registreren:", result.errors?.[0]?.message || result.message || "Onbekende fout");
      }
    } catch (err) {
      console.error("Verbinding mislukt:", err);
    }
  });
});
