// register.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const feedback = document.querySelector(".feedback");
    if (feedback) feedback.remove();

    if (!username || !email || !password) {
      showMessage("Vul alle velden in.", "error");
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
        showMessage("✅ Registratie is gelukt, je kunt nu inloggen en direct beginnen met spelen!", "success");
        form.reset();
      } else {
        console.error(result);
        showMessage("❌ " + (result.errors?.[0]?.message || result.message || "Fout bij registreren."), "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Verbinding mislukt.", "error");
    }
  });

  function showMessage(msg, type) {
    const div = document.createElement("div");
    div.className = `feedback ${type}`;
    div.textContent = msg;
    form.prepend(div);
  }
});
