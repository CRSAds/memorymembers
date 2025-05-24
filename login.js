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
        alert(result.message || "Inloggen mislukt.");
        return;
      }

      alert("Welkom terug, " + result.user.username + "!");
      window.location.href = "/memorymembers/level1"; // Pas dit aan naar jouw spelpagina
    } catch (err) {
      console.error("Fout:", err);
      alert("Kon niet inloggen. Probeer opnieuw.");
    }
  });
});
