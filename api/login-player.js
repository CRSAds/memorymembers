export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const response = await fetch(`https://cms.core.909play.com/items/players?filter[email][_eq]=${encodeURIComponent(email)}&filter[password][_eq]=${encodeURIComponent(password)}`, {
      headers: {
        "Authorization": "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u",
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok || result.data.length === 0) {
      return res.status(401).json({ message: "Invalid user credentials." });
    }

    // Login succesvol
    return res.status(200).json({
      message: "Login succesvol",
      user: result.data[0]
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Interne serverfout" });
  }
}
