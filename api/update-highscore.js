export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { playerId, score } = req.body;

  try {
    // eerst ophalen van huidige score
    const currentRes = await fetch(`https://cms.core.909play.com/items/players/${playerId}`, {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });
    const data = await currentRes.json();
    const currentHigh = data.data?.total_score || 0;

    if (score > currentHigh) {
      await fetch(`https://cms.core.909play.com/items/players/${playerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        },
        body: JSON.stringify({ total_score: score })
      });
    }

    res.status(200).json({ message: "Highscore verwerkt." });

  } catch (err) {
    console.error("Highscore update error:", err);
    res.status(500).json({ message: "Highscore update mislukt" });
  }
}
