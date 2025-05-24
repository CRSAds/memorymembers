// memory10.js — Embedded memory game met 10 levels en Directus score opslag

document.addEventListener("DOMContentLoaded", function () {
  const root = document.getElementById("game-root");
  if (!root) return;

  const access_token = localStorage.getItem("access_token");
  const user_id = localStorage.getItem("user_id");

  if (!access_token || !user_id) {
    root.innerHTML = "<p>Je bent niet ingelogd. Log in om te spelen.</p>";
    return;
  }

  let currentLevel = 1;
  const maxLevel = 10;
  let totalScore = 0;

  function startLevel(level) {
    const pairs = level + 2;
    const totalCards = pairs * 2;
    const cards = shuffle(generateCardValues(pairs));
    let matched = [];
    let selected = [];
    let timer;
    let startTime;

    root.innerHTML = `
      <div class="game-inner">
        <h2>Level ${level} van ${maxLevel}</h2>
        <div class="progress-bar"><div class="progress-fill" id="progress"></div></div>
        <div class="game-board" id="board"></div>
      </div>
    `;

    const board = document.getElementById("board");
    const progress = document.getElementById("progress");

    cards.forEach((val, i) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.value = val;
      card.dataset.index = i;
      card.innerHTML = `
        <div class="front"></div>
        <div class="back">${val}</div>
      `;
      card.addEventListener("click", () => selectCard(card));
      board.appendChild(card);
    });

    function selectCard(card) {
      if (selected.length >= 2 || card.classList.contains("flip") || matched.includes(card.dataset.index)) return;
      card.classList.add("flip");
      selected.push(card);
      if (selected.length === 2) {
        const [c1, c2] = selected;
        if (c1.dataset.value === c2.dataset.value) {
          matched.push(c1.dataset.index, c2.dataset.index);
          selected = [];
          if (matched.length === totalCards) finishLevel();
        } else {
          setTimeout(() => {
            c1.classList.remove("flip");
            c2.classList.remove("flip");
            selected = [];
          }, 800);
        }
      }
    }

    function finishLevel() {
      clearInterval(timer);
      const duration = (Date.now() - startTime) / 1000;
      const score = Math.max(1000, Math.floor(10000 - (duration / 120) * 10000));
      totalScore += score;

      fetch("https://cms.core.909play.com/items/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        body: JSON.stringify({
          player: user_id,
          level,
          score,
          time_taken: Math.round(duration)
        })
      });

      if (level < maxLevel) {
        setTimeout(() => startLevel(level + 1), 1500);
      } else {
        setTimeout(showResult, 1500);
      }
    }

    startTime = Date.now();
    let progressValue = 100;
    timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 120 - elapsed);
      progressValue = (remaining / 120) * 100;
      progress.style.width = progressValue + "%";
      if (remaining <= 0) finishLevel();
    }, 200);
  }

  function showResult() {
    root.innerHTML = `
      <div class="overlay show">
        <div class="overlay-content">
          <h2>Spel voltooid!</h2>
          <p>Je totale score: <strong>${totalScore}</strong></p>
          <button onclick="location.reload()" class="cta-button">Opnieuw spelen</button>
        </div>
      </div>
    `;
  }

  function generateCardValues(pairs) {
    const values = [];
    for (let i = 1; i <= pairs; i++) {
      values.push(i, i);
    }
    return values;
  }

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  // Start spel
  startLevel(currentLevel);
});
