export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const response = await fetch("https://cms.core.909play.com/items/players?sort=-total_score&limit=10", {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Fout bij ophalen top 10:", err);
    return res.status(500).json({ message: "Top 10 ophalen mislukt." });
  }
}
