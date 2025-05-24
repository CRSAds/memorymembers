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
        console.warn("Login mislukt:", result.message || "Onbekende fout.");
        return;
      }

      console.log("Welkom terug, " + result.user.username + "!");
      window.location.href = "/memorygamespelen";
    } catch (err) {
      console.error("Fout:", err);
    }
  });
});
