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
      board.innerHTML = `<h3>🎉 Je totale score is ${totalScore} punten! 🎉</h3>`;
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
          level: currentLevel + 1,
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
        handleWin(); // doorgaan zonder melding
      }
    }, 1000);
  }

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  startGame();
});
