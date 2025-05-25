document.addEventListener("DOMContentLoaded", function () {
  const playerData = localStorage.getItem("player");
  const root = document.getElementById("game-root");
  if (!root || !playerData) {
    document.body.innerHTML = "<p style='text-align:center;margin-top:40vh;font-size:24px'>Je bent niet ingelogd. Log in om te spelen.</p>";
    return;
  }

  const player = JSON.parse(playerData);
  const icons = [
    "bananas.png", "berries.png", "cherries.png", "coconut.png",
    "grape.png", "grapes.png", "orange.png", "pineapple.png",
    "strawberry.png", "watermelon.png"
  ];

  const levels = [6, 6, 6, 12, 12, 12, 16, 16, 16, 16];
  let currentLevel = 0;
  let totalScore = 0;
  let flipped = [];
  let matched = 0;
  let timerInterval;
  let timeLimit = 120;
  let timeLeft = timeLimit;
  const levelScores = [];

  const gameContainer = document.createElement("div");
  gameContainer.className = "game-inner";
  root.appendChild(gameContainer);

  const levelHeader = document.createElement("h2");
  gameContainer.appendChild(levelHeader);

  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.innerHTML = `<div id="progress-fill" class="progress-fill"></div>`;
  gameContainer.appendChild(progressBar);

  const board = document.createElement("div");
  board.className = "game-board";
  gameContainer.appendChild(board);

  function createCard(src) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="front"><img src="https://memorymembers.vercel.app/assets/img/card-icon.png" alt=""></div>
      <div class="back"><img src="https://memorymembers.vercel.app/assets/img/${src}" alt=""></div>
    `;
    card.addEventListener("click", () => flipCard(card, src));
    return card;
  }

  function flipCard(card, src) {
    if (card.classList.contains("flip") || flipped.length === 2) return;
    card.classList.add("flip");
    flipped.push({ card, src });

    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (a.src === b.src) {
        matched++;
        flipped = [];
        if (matched === levels[currentLevel] / 2) handleWin();
      } else {
        setTimeout(() => {
          a.card.classList.remove("flip");
          b.card.classList.remove("flip");
          flipped = [];
        }, 900);
      }
    }
  }

  function handleWin() {
    clearInterval(timerInterval);
    const timeUsed = timeLimit - timeLeft;
    const score = Math.max(1000, Math.round(10000 - timeUsed * 75));
    totalScore += score;
    levelScores.push({ level: currentLevel + 1, score });

    saveScore(levels[currentLevel], score, timeUsed);
    updateHighscoreIfNeeded(totalScore);

    currentLevel++;
    if (currentLevel < levels.length) {
      board.classList.add("fade-out");
      setTimeout(() => {
        board.classList.remove("fade-out");
        startGame();
      }, 500);
    } else {
      levelHeader.remove();
      progressBar.remove();
      showSummary();
    }
  }

  async function saveScore(levelSize, score, time) {
    try {
      await fetch("https://memorymembers.vercel.app/api/save-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          player: player.id,
          level: currentLevel,
          time_taken: time,
          score: score
        })
      });
    } catch (err) {
      console.error("Fout bij score opslaan:", err);
    }
  }

  async function updateHighscoreIfNeeded(score) {
    try {
      await fetch("https://memorymembers.vercel.app/api/update-highscore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          playerId: player.id,
          score: score
        })
      });
    } catch (err) {
      console.error("Highscore bijwerken mislukt:", err);
    }
  }

  function updateProgress() {
    const fill = document.getElementById("progress-fill");
    const percentage = (timeLeft / timeLimit) * 100;
    fill.style.width = `${percentage}%`;
  }

  async function showSummary() {
    board.innerHTML = "";
    const summary = document.createElement("div");
    summary.className = "score-summary";

    const title = document.createElement("h3");
    title.textContent = "🎉 Scoreoverzicht";
    summary.appendChild(title);

    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th>Level</th><th>Score</th></tr></thead>`;
    const tbody = document.createElement("tbody");
    levelScores.forEach(({ level, score }) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${level}</td><td>${score}</td>`;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    summary.appendChild(table);

    const totaal = document.createElement("p");
    totaal.innerHTML = `<strong>Totaal deze sessie: ${totalScore} punten</strong>`;
    summary.appendChild(totaal);

    // Persoonlijke highscore ophalen
    try {
      const res = await fetch(`https://cms.core.909play.com/items/players/${player.id}`, {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const data = await res.json();
      const best = data.data?.total_score || 0;
      const bestp = document.createElement("p");
      bestp.textContent = `🏆 Jouw hoogste score ooit: ${best} punten`;
      summary.appendChild(bestp);
    } catch (err) {
      console.error("Kon hoogste score niet ophalen", err);
    }

    // Top 10 ophalen
    try {
      const res = await fetch("https://cms.core.909play.com/items/players?sort=-total_score&limit=10", {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const data = await res.json();
      const top = document.createElement("div");
      top.innerHTML = `<h4>🏅 Top 10 Spelers</h4>`;
      const topTable = document.createElement("table");
      topTable.innerHTML = `<thead><tr><th>#</th><th>Speler</th><th>Score</th></tr></thead>`;
      const body = document.createElement("tbody");
      data.data.forEach((p, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${i + 1}</td><td>${p.username}</td><td>${p.total_score}</td>`;
        body.appendChild(row);
      });
      topTable.appendChild(body);
      top.appendChild(topTable);
      summary.appendChild(top);
    } catch (err) {
      console.error("Kon top 10 niet ophalen", err);
    }

    const retry = document.createElement("button");
    retry.textContent = "🔁 Speel opnieuw";
    retry.className = "cta-button";
    retry.addEventListener("click", () => window.location.reload());
    summary.appendChild(retry);

    board.appendChild(summary);
  }

  function startGame() {
    board.innerHTML = "";
    flipped = [];
    matched = 0;
    timeLeft = timeLimit;
    updateProgress();

    const count = levels[currentLevel];
    const pairs = count / 2;
    const selectedIcons = shuffle(icons).slice(0, pairs);
    const gameIcons = shuffle([...selectedIcons, ...selectedIcons]);

    levelHeader.textContent = `Level ${currentLevel + 1} van ${levels.length}`;

    board.style.gridTemplateColumns = count === 6 ? "repeat(3, 1fr)" : "repeat(4, 1fr)";

    gameIcons.forEach(icon => {
      board.appendChild(createCard(icon));
    });

    timerInterval = setInterval(() => {
      timeLeft--;
      updateProgress();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleWin();
      }
    }, 1000);
  }

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  const skipButton = document.createElement("button");
skipButton.textContent = "⏭️ Sla spel over en toon scores";
skipButton.className = "cta-button";
skipButton.style.margin = "16px auto";
skipButton.onclick = () => {
  levelHeader.remove();
  progressBar.remove();
  showSummary();
};
gameContainer.appendChild(skipButton);
  
  startGame();
});
