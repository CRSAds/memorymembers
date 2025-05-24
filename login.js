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
      console.log("Login respons:", result);

      if (!response.ok) {
        console.warn("Login mislukt:", result.message || "Onbekende fout.");
        return;
      }

      // ✅ Token ophalen uit response
      if (result.data && result.data.access_token) {
        const token = encodeURIComponent(result.data.access_token);
        window.location.href = "/memorygamespelen?token=" + token;
      } else {
        console.warn("Geen toegangstoken ontvangen:", result);
      }
    } catch (err) {
      console.error("Fout:", err);
    }
  });
});
