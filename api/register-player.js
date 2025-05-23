export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, email, password } = req.body;

  try {
    const response = await fetch("https://cms.core.909play.com/items/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      },
      body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: result });
    }

    return res.status(200).json({ message: "Player registered", data: result });
  } catch (err) {
    console.error("Error registering player:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
