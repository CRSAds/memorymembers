export default async function handler(req, res) {
  // ✅ CORS headers toevoegen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight OK
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const directusRes = await fetch("https://cms.core.909play.com/items/players", {
      method: "GET",
      headers: {
        "Authorization": "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });

    const data = await directusRes.json();
    const match = data.data.find(p => p.email === email && p.password === password);

    if (!match) {
      return res.status(401).json({ message: "Onjuiste inloggegevens" });
    }

    return res.status(200).json({ message: "Login succesvol", user: match });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Serverfout" });
  }
}
