document.addEventListener("DOMContentLoaded", async function () {
  const root = document.getElementById("game-root");
  if (!root) return;

  const playerData = localStorage.getItem("player");
  const player = playerData ? JSON.parse(playerData) : null;

  const container = document.createElement("div");
  container.className = "score-summary";

  const title = document.createElement("h3");
  title.textContent = "🎉 Scoreoverzicht";
  container.appendChild(title);

  // Huidige sessie score (optioneel)
  const current = localStorage.getItem("last_score");
  if (current) {
    const p = document.createElement("p");
    p.innerHTML = `<strong>Totale score van laatst gespeelde sessie:</strong> ${current} punten`;
    container.appendChild(p);
  }

  // Eigen hoogste score
  if (player) {
    try {
      const res = await fetch(\`https://cms.core.909play.com/items/players/\${player.id}\`, {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const data = await res.json();
      const best = data.data?.total_score || 0;
      const p = document.createElement("p");
      p.innerHTML = `🏆 <strong>Jouw hoogste score ooit:</strong> ${best} punten`;
      container.appendChild(p);
    } catch (err) {
      console.error("Kon hoogste score niet ophalen", err);
    }
  }

  // Top 10 spelers ophalen
  try {
    const res = await fetch("https://cms.core.909play.com/items/players?sort=-total_score&limit=10", {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });
    const data = await res.json();

    const top = document.createElement("div");
    top.innerHTML = "<h4>🏅 Top 10 Spelers</h4>";

    const table = document.createElement("table");
    table.innerHTML = "<thead><tr><th>#</th><th>Speler</th><th>Score</th></tr></thead>";
    const tbody = document.createElement("tbody");
    data.data.forEach((p, i) => {
      const row = document.createElement("tr");
      row.innerHTML = \`<td>\${i + 1}</td><td>\${p.username}</td><td>\${p.total_score}</td>\`;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    top.appendChild(table);
    container.appendChild(top);
  } catch (err) {
    console.error("Kon top 10 niet ophalen", err);
  }

  const back = document.createElement("a");
  back.href = "/memoryspel";
  back.className = "cta-button";
  back.textContent = "🔁 Terug naar spel";
  container.appendChild(back);

  root.appendChild(container);
});
