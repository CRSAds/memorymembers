document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const feedback = document.getElementById("login-feedback");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    feedback.textContent = "";

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
        feedback.textContent = result.message || "Inloggen mislukt.";
        feedback.style.color = "#ff0000";
        return;
      }

      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem("player", JSON.stringify(result.user));

      window.location.href = "/memorygamespelen";
    } catch (err) {
      console.error("Fout:", err);
      feedback.textContent = "Er ging iets mis. Probeer opnieuw.";
      feedback.style.color = "#ff0000";
    }
  });
});
