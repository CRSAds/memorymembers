// File: /api/register-player.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const directusRes = await fetch("https://cms.core.909play.com/items/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}`
      },
      body: JSON.stringify({ username, email, password })
    });

    const result = await directusRes.json();
    if (!directusRes.ok) {
      return res.status(500).json({ error: "Directus error", details: result });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
