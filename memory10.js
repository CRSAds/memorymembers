// memory10.js

const images = [
  "bananas.png",
  "card-icon.png",
  "cherries.png",
  "grape.png",
  "pineapple.png",
  "strawberry.png",
  "watermelon.png"
];

let level = 1;
const maxLevel = 10;
const levelIndicator = document.getElementById("level-indicator");
const progressFill = document.getElementById("progress-fill");
const gameBoard = document.getElementById("game-board");

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function updateLevelDisplay() {
  levelIndicator.textContent = `Level ${level} van ${maxLevel}`;
}

function updateProgress(percent) {
  progressFill.style.width = `${percent}%`;
}

function createCard(image) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="front">
      <img src="/assets/img/card-icon.png" alt="kaart achterkant">
    </div>
    <div class="back">
      <img src="/assets/img/${image}" alt="kaart">
    </div>
  `;
  return card;
}

function setupLevel() {
  updateLevelDisplay();
  updateProgress((level - 1) / (maxLevel - 1) * 100);

  const numCards = Math.min(6 + (level - 1) * 2, 20);
  const selectedImages = shuffle(images).slice(0, numCards / 2);
  const cardImages = shuffle([...selectedImages, ...selectedImages]);

  gameBoard.innerHTML = "";
  cardImages.forEach(image => {
    const card = createCard(image);
    gameBoard.appendChild(card);
  });

  // Extra: hier start je eventueel de timer
}

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("access_token")) {
    document.body.innerHTML = '<p style="text-align:center; padding:2em; font-size:1.5em">Je bent niet ingelogd. Log in om te spelen.</p>';
    return;
  }

  setupLevel();
});
