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
  let levelScores = [];

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

    const cards = document.querySelectorAll(".card");
    cards.forEach(card => card.classList.add("fade-out"));

    setTimeout(() => {
      currentLevel++;
      if (currentLevel < levels.length) {
        startGame();
      } else {
        showSummary();
      }
    }, 1000);
  }

  async function saveScore(levelSize, score, time) {
    try {
      await fetch("https://memorymembers.vercel.app/api/save-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        },
        body: JSON.stringify({
          player: player.id,
          level: currentLevel + 1,
          time_taken: time,
          score: score,
          completed_at: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Fout bij score opslaan:", err);
    }
  }

  function updateProgress() {
    const fill = document.getElementById("progress-fill");
    const percentage = (timeLeft / timeLimit) * 100;
    fill.style.width = `${percentage}%`;
  }

  function showSummary() {
    board.innerHTML = "";
    const summary = document.createElement("div");
    summary.innerHTML = `<h3>🎉 Je scores:</h3>`;

    const ul = document.createElement("ul");
    levelScores.forEach(({ level, score }) => {
      const li = document.createElement("li");
      li.textContent = `Level ${level}: ${score} punten`;
      ul.appendChild(li);
    });

    const total = document.createElement("p");
    total.innerHTML = `<strong>Totaal: ${totalScore} punten</strong>`;

    const retry = document.createElement("button");
    retry.textContent = "Speel opnieuw";
    retry.addEventListener("click", () => location.reload());

    summary.appendChild(ul);
    summary.appendChild(total);
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

    levelHeader.textContent = `Level ${currentLevel + 1} van 10`;

    const columns = count === 6 ? 3 : count === 12 ? 3 : 4;
    board.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

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

  startGame();
});
