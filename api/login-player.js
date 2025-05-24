export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const response = await fetch("https://cms.core.909play.com/items/players?filter[email][_eq]=" + encodeURIComponent(email), {
      headers: {
        "Authorization": "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });

    const result = await response.json();

    if (!result || !result.data || result.data.length === 0) {
      return res.status(401).json({ message: "Geen account gevonden met dit e-mailadres." });
    }

    const user = result.data[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Wachtwoord onjuist." });
    }

    return res.status(200).json({ message: "Ingelogd!", user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Interne fout bij inloggen" });
  }
}
