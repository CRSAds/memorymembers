export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const data = req.body;

  try {
    const response = await fetch("https://cms.core.909play.com/items/scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return res.status(response.status).json(result);

  } catch (err) {
    console.error("Error saving score:", err);
    return res.status(500).json({ message: "Interne fout bij score opslaan." });
  }
}
