document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await fetch("https://cms.core.909play.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("refresh_token", data.data.refresh_token);
        localStorage.setItem("expires", data.data.expires);

        // eventueel: haal gebruiker op via /users/me
        const profile = await fetch("https://cms.core.909play.com/users/me", {
          headers: {
            Authorization: `Bearer ${data.data.access_token}`
          }
        });
        const user = await profile.json();
        localStorage.setItem("user_id", user.data.id);

        window.location.href = "/memoryspel";
      } else {
        alert("Inloggen mislukt: " + (data.errors?.[0]?.message || "Onbekende fout"));
      }
    } catch (err) {
      console.error("Login fout:", err);
      alert("Verbinding mislukt. Probeer opnieuw.");
    }
  });
});
