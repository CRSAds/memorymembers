document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("access_token");

  if (!token) {
    document.body.innerHTML = "<p style='text-align:center;margin-top:40vh;font-size:24px'>Je bent niet ingelogd. Log in om te spelen.</p>";
    return;
  }

  // Token bestaat, valideer deze via Directus
  fetch("https://cms.core.909play.com/users/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Ongeldige token");
      }
      return res.json();
    })
    .then(data => {
      console.log("✅ Ingelogd als:", data.data.email || data.data.username);
      initMemoryGame(); // Je spel starten
    })
    .catch(err => {
      console.error("Fout bij authenticatie:", err);
      document.body.innerHTML = "<p style='text-align:center;margin-top:40vh;font-size:24px'>Je sessie is verlopen. Log opnieuw in om verder te spelen.</p>";
    });
});

function initMemoryGame() {
  // Hier start je de game
  const levelEl = document.getElementById("level-indicator");
  const board = document.getElementById("game-board");
  const progress = document.getElementById("progress-fill");

  if (!levelEl || !board || !progress) {
    console.warn("⛔️ Vereiste HTML-elementen ontbreken");
    return;
  }

  // Start bijvoorbeeld met level 1
  let currentLevel = 1;
  levelEl.innerText = `Level ${currentLevel} van 10`;

  // Init gameboard
  board.innerHTML = "<p>⚙️ Memory game wordt geladen...</p>";

  // Hier kun je later cards laden of renderen per level
}
