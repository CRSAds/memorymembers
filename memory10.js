document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("game-root");
  if (!root) return;

  // ✅ Controleer of speler is ingelogd
  const playerData = localStorage.getItem("player");
  if (!playerData) {
    root.innerHTML = "<p style='text-align:center; font-size: 1.5rem;'>Je bent niet ingelogd. Log in om te spelen.</p>";
    return;
  }

  const player = JSON.parse(playerData);
  console.log("Ingelogde speler:", player);

  // ✅ Game instellingen
  const levels = [
    6, 8, 10, 12, 14, 16, 18, 20, 22, 24
  ]; // aantal kaarten per level
  let currentLevel = 0;
  let totalScore = 0;
  let timer = null;
  let startTime = null;

  const levelIndicator = document.createElement("div");
  levelIndicator.id = "level-indicator";
  root.appendChild(levelIndicator);

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.innerHTML = `<div id="progress-fill" class="progress-fill"></div>`;
  root.appendChild(progressBar);

  const gameBoard = document.createElement("div");
  gameBoard.className = "game-board";
  root.appendChild(gameBoard);

  function startLevel(level) {
    const numCards = levels[level];
    const pairs = numCards / 2;
    const symbols = [];
    for (let i = 0; i < pairs; i++) {
      const emoji = String.fromCodePoint(0x1F600 + i);
      symbols.push(emoji, emoji);
    }

    symbols.sort(() => 0.5 - Math.random());

    gameBoard.innerHTML = "";
    symbols.forEach(symbol => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="front"></div>
        <div class="back">${symbol}</div>
      `;
      card.dataset.symbol = symbol;
      card.addEventListener("click", onCardClick);
      gameBoard.appendChild(card);
    });

    document.getElementById("level-indicator").textContent = `Level ${level + 1} van ${levels.length}`;

    startTime = Date.now();
    timer = setInterval(updateProgressBar, 100);
  }

  function updateProgressBar() {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = Math.min(100, (elapsed / 120) * 100);
    document.getElementById("progress-fill").style.width = `${100 - progress}%`;
    if (elapsed > 120) {
      clearInterval(timer);
      alert("Tijd is om!");
    }
  }

  let flippedCards = [];

  function onCardClick(e) {
    const card = e.currentTarget;
    if (card.classList.contains("flip") || flippedCards.length === 2) return;

    card.classList.add("flip");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      const [a, b] = flippedCards;
      if (a.dataset.symbol === b.dataset.symbol) {
        flippedCards = [];
        if (document.querySelectorAll(".card:not(.flip)").length === 0) {
          levelComplete();
        }
      } else {
        setTimeout(() => {
          a.classList.remove("flip");
          b.classList.remove("flip");
          flippedCards = [];
        }, 1000);
      }
    }
  }

  async function levelComplete() {
    clearInterval(timer);
    const elapsed = (Date.now() - startTime) / 1000;
    const score = Math.max(1000, Math.round(10000 - elapsed * 75));
    totalScore += score;

    console.log(`Level ${currentLevel + 1} voltooid. Tijd: ${elapsed}s. Score: ${score}.`);

    // ✅ Score opslaan in Directus
    try {
      await fetch("https://cms.core.909play.com/items/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        },
        body: JSON.stringify({
          player: player.id,
          level: currentLevel + 1,
          time_taken: Math.round(elapsed),
          score,
          completed_at: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Fout bij score opslaan:", err);
    }

    currentLevel++;
    if (currentLevel < levels.length) {
      startLevel(currentLevel);
    } else {
      gameBoard.innerHTML = `<p style="font-size: 2rem; text-align: center;">Gefeliciteerd! Je totale score is ${totalScore} punten.</p>`;
    }
  }

  // ✅ Start game
  startLevel(currentLevel);
});
