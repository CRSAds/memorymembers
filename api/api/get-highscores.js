export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const response = await fetch(
      "https://cms.core.909play.com/items/players?sort=-total_score&limit=10&fields=username,total_score",
      {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Fout bij ophalen highscores:", err);
    res.status(500).json({ error: "Interne serverfout" });
  }
}
