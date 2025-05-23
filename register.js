document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await fetch("https://cms.core.909play.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registratie gelukt! Je kunt nu inloggen.");
        window.location.href = "/login";
      } else {
        alert("Fout: " + (data.errors?.[0]?.message || "Onbekende fout"));
      }
    } catch (err) {
      console.error("Registratiefout:", err);
      alert("Verbinding mislukt. Probeer het later opnieuw.");
    }
  });
});
