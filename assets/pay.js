document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("start-payment");
  if (!button) return;

  button.addEventListener("click", async () => {
    let email = "";

    // Optie 1: uit localStorage ophalen (bijv. na inloggen)
    const playerData = localStorage.getItem("player");
    if (playerData) {
      const player = JSON.parse(playerData);
      email = player.email;
    }

    // Optie 2: uit query string
    if (!email) {
      const params = new URLSearchParams(window.location.search);
      email = params.get("email");
    }

    if (!email) {
      alert("Geen e-mailadres gevonden.");
      return;
    }

    try {
      const res = await fetch("https://memorymembers.vercel.app/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok || !data.paymentUrl) {
        alert("Fout bij starten betaling.");
        console.error(data);
        return;
      }

      // ✅ Ga naar Mollie betaling
      window.location.href = data.paymentUrl;

    } catch (err) {
      console.error("Betaling starten mislukt:", err);
      alert("Kon betaling niet starten. Probeer opnieuw.");
    }
  });
});
