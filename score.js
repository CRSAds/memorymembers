document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const playerId = params.get("player");
  const score = parseInt(params.get("score"), 10) || 0;
  const root = document.getElementById("score-root");

  if (!root) {
    console.error("❌ Element met id 'score-root' niet gevonden.");
    return;
  }

  if (!playerId) {
    root.innerHTML = "<p style='text-align:center'>❌ Geen speler ID gevonden in URL.</p>";
    return;
  }

  const summary = document.createElement("div");
  summary.className = "score-summary";
  summary.innerHTML = `
    <h3>🎉 Bedankt voor het spelen!</h3>
    <p><strong>Jouw score in deze sessie:</strong> ${score} punten</p>
  `;

  // 🔸 Persoonlijke highscore ophalen
  try {
    const res = await fetch("https://memorymembers.vercel.app/api/get-player?id=" + playerId);
    const data = await res.json();
    const best = data.data?.total_score || 0;
    const bestp = document.createElement("p");
    bestp.innerHTML = `🏆 <strong>Hoogste score ooit:</strong> ${best} punten`;
    summary.appendChild(bestp);
  } catch (err) {
    console.error("Fout bij ophalen van persoonlijke score:", err);
    summary.innerHTML += "<p>❌ Kon persoonlijke highscore niet ophalen</p>";
  }

  // 🔸 Top 10 ophalen
  try {
    const res = await fetch("https://memorymembers.vercel.app/api/get-top-players");
    const data = await res.json();
    const top = document.createElement("div");
    top.innerHTML = `<h4>🏅 Top 10 Spelers</h4>`;
    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th>#</th><th>Speler</th><th>Score</th></tr></thead>`;
    const body = document.createElement("tbody");

    data.data.forEach((p, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${i + 1}</td><td>${p.username}</td><td>${p.total_score}</td>`;
      body.appendChild(row);
    });

    table.appendChild(body);
    top.appendChild(table);
    summary.appendChild(top);
  } catch (err) {
    console.error("Fout bij ophalen van top 10:", err);
    summary.innerHTML += "<p>❌ Kon top 10 niet ophalen</p>";
  }

  // 🔸 Retry knop
  const retry = document.createElement("button");
  retry.textContent = "🔁 Speel opnieuw";
  retry.className = "cta-button";
  retry.onclick = () => window.location.href = "/memorygamespelen";
  summary.appendChild(retry);

  // 🔸 Injecteren in DOM
  root.innerHTML = "";
  root.appendChild(summary);
});
