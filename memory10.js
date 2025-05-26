document.addEventListener("DOMContentLoaded", function () {
  const playerData = localStorage.getItem("player");
  if (!playerData) {
    window.location.href = "/"; // terug naar login/registratie
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
  let timeLeft = 120;
  const levelScores = [];

  const root = document.getElementById("game-root");
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

  async function checkAccess() {
    try {
      const res = await fetch(`https://memorymembers.vercel.app/api/get-player?id=${player.id}`);
      const data = await res.json();
      const until = data.data?.paid_access_until;
      const now = new Date().toISOString();

      if (!until || now > until) {
        document.body.innerHTML = `
          <div style="text-align:center;padding:48px;font-size:20px">
            ❌ Je hebt op dit moment geen toegang.<br><br>
            📅 Een betaling van €1,99 is vereist voor 7 dagen toegang.<br><br>
            <a href="https://nl.wincadeaukaarten.com/?email=${encodeURIComponent(player.email)}" class="cta-button">Betaal nu & krijg toegang</a>
          </div>
        `;
        return false;
      }

      return true;
    } catch (err) {
      console.error("Toegangscontrole mislukt:", err);
      return false;
    }
  }

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
        }, 800);
      }
    }
  }

  async function handleWin() {
    clearInterval(timerInterval);
    const timeUsed = 120 - timeLeft;
    const score = Math.max(1000, Math.round(10000 - timeUsed * 75));
    totalScore += score;
    levelScores.push({ level: currentLevel + 1, score });

    await saveScore(score, timeUsed);

    currentLevel++;
    if (currentLevel < levels.length) {
      board.classList.add("fade-out");
      setTimeout(() => {
        board.classList.remove("fade-out");
        startGame();
      }, 600);
    } else {
      await updateHighscoreIfNeeded(totalScore);
      window.location.href = `https://nl.wincadeaukaarten.com/highscores?player=${player.id}&score=${totalScore}`;
    }
  }

  async function saveScore(score, time) {
    try {
      await fetch("https://memorymembers.vercel.app/api/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, score })
      });
    } catch (err) {
      console.error("Highscore bijwerken mislukt:", err);
    }
  }

  function updateProgress() {
    const fill = document.getElementById("progress-fill");
    if (fill) fill.style.width = `${(timeLeft / 120) * 100}%`;
  }

  function startGame() {
    board.innerHTML = "";
    flipped = [];
    matched = 0;
    timeLeft = 120;
    updateProgress();

    const count = levels[currentLevel];
    const pairs = count / 2;
    const selected = shuffle(icons).slice(0, pairs);
    const cards = shuffle([...selected, ...selected]);

    levelHeader.textContent = `Level ${currentLevel + 1} van ${levels.length}`;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      board.style.gridTemplateColumns = currentLevel < 6 ? "repeat(3, 1fr)" : "repeat(4, 1fr)";
    } else {
      board.style.gridTemplateColumns = currentLevel < 3 ? "repeat(3, 140px)" : "repeat(4, 140px)";
    }

    cards.forEach(icon => board.appendChild(createCard(icon)));

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

  checkAccess().then(access => {
    if (access) startGame();
  });
});
