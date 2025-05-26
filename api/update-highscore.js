export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { playerId, score } = req.body;

  if (!playerId || typeof score === "undefined") {
    return res.status(400).json({ error: "Missing playerId or score" });
  }

  const parsedScore = parseInt(score, 10);
  if (isNaN(parsedScore)) {
    return res.status(400).json({ error: "Score must be a number" });
  }

  try {
    // ✅ 1. Huidige spelergegevens ophalen
    const currentRes = await fetch(`https://cms.core.909play.com/items/players/${playerId}`, {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });

    const data = await currentRes.json();
    if (!currentRes.ok || !data.data) {
      return res.status(404).json({ error: "Speler niet gevonden", raw: data });
    }

    const currentHigh = data.data.total_score || 0;

    console.log(`[update-highscore] Current: ${currentHigh}, New: ${parsedScore}`);

    // ✅ 2. Alleen updaten als nieuw hoger is
    if (parsedScore > currentHigh) {
      const patchRes = await fetch(`https://cms.core.909play.com/items/players/${playerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        },
        body: JSON.stringify({ total_score: parsedScore })
      });

      const patchResult = await patchRes.json();

      if (!patchRes.ok) {
        console.error("PATCH mislukt:", patchResult);
        return res.status(500).json({ error: "Bijwerken mislukt", details: patchResult });
      }

      console.log("[update-highscore] ✅ Highscore bijgewerkt.");
      return res.status(200).json({ message: "Highscore bijgewerkt." });
    }

    return res.status(200).json({ message: "Geen update nodig (score niet hoger)." });

  } catch (err) {
    console.error("Highscore update error:", err);
    return res.status(500).json({ error: "Highscore update mislukt" });
  }
}
