// memory10.js - versie voor 10 levels met score opslag

const levels = [3, 4, 5, 6, 7, 8, 9, 10, 10, 10]; // aantal kaartparen per level (6-20 kaarten)
const maxTime = 120; // max per level in seconden

let currentLevel = 0;
let totalScore = 0;
let levelScores = {};
let startTime;
let timer;

const board = document.getElementById("game-board");
const levelDisplay = document.getElementById("level-indicator");
const progressFill = document.getElementById("progress-fill");

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createCard(src) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <div class="front"><img src="./assets/img/card-icon.png" alt=""></div>
    <div class="back"><img src="./assets/img/${src}" alt=""></div>
  `;
  return card;
}

function startLevel(levelIndex) {
  const pairs = levels[levelIndex];
  const icons = [];
  for (let i = 0; i < pairs; i++) {
    const fruit = `fruit${i + 1}.png`;
    icons.push(fruit, fruit);
  }

  const cards = shuffle(icons);
  board.innerHTML = "";
  cards.forEach((icon) => {
    const card = createCard(icon);
    board.appendChild(card);
  });

  levelDisplay.textContent = `Level ${levelIndex + 1} van ${levels.length}`;

  // Start timer
  startTime = Date.now();
  clearInterval(timer);
  timer = setInterval(updateProgress, 1000);
}

function updateProgress() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = Math.max(maxTime - elapsed, 0);
  const pct = (remaining / maxTime) * 100;
  progressFill.style.width = `${pct}%`;

  if (remaining <= 0) {
    clearInterval(timer);
    handleLevelEnd(maxTime);
  }
}

function handleMatchSuccess() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  clearInterval(timer);
  handleLevelEnd(elapsed);
}

function handleLevelEnd(elapsed) {
  const score = Math.max(1000, Math.floor(10000 - (elapsed / maxTime) * 9000));
  totalScore += score;
  levelScores[currentLevel + 1] = score;

  currentLevel++;
  if (currentLevel < levels.length) {
    setTimeout(() => startLevel(currentLevel), 1000);
  } else {
    submitScore();
  }
}

function submitScore() {
  const userId = localStorage.getItem("directus_user_id");
  fetch("https://your-directus-instance.com/items/scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("directus_token")}`,
    },
    body: JSON.stringify({
      user_id: userId,
      total_score: totalScore,
      duration: levels.length * maxTime,
      levels: levelScores,
    }),
  })
    .then((res) => res.json())
    .then(() => {
      window.location.href = "/bedankt?score=" + totalScore;
    });
}

// Init game op DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  startLevel(currentLevel);
});
