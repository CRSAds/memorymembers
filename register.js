document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!username || !email || !password) {
      console.warn("Vul alle velden in.");
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
      console.log("Registratie respons:", result);

      if (!response.ok) {
        console.error("Fout bij registreren:", result.errors?.[0]?.message || result.message || "Onbekende fout");
        return;
      }

      // ✅ Token ophalen uit response
      if (result.data && result.data.access_token) {
        const token = encodeURIComponent(result.data.access_token);
        window.location.href = "/memorygamespelen?token=" + token;
      } else {
        console.warn("Geen toegangstoken ontvangen bij registratie:", result);
      }
    } catch (err) {
      console.error("Verbinding mislukt:", err);
    }
  });
});
