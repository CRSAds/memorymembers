export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { token, email } = req.body;

  if (!token || !email) {
    return res.status(400).json({ message: "Token en e-mailadres zijn verplicht." });
  }

  try {
    // 1. Haal token op uit Directus
    const tokenRes = await fetch(`https://cms.core.909play.com/items/payment_tokens?filter[token][_eq]=${encodeURIComponent(token)}`, {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });

    const tokenData = await tokenRes.json();
    const record = tokenData?.data?.[0];

    if (!record) {
      return res.status(404).json({ message: "Token niet gevonden." });
    }

    const validUntil = new Date(record.valid_until);
    const now = new Date();
    if (validUntil < now) {
      return res.status(410).json({ message: "Token is verlopen." });
    }

    // 2. Zoek speler op
    const playerRes = await fetch(`https://cms.core.909play.com/items/players?filter[email][_eq]=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });

    const playerData = await playerRes.json();
    const player = playerData?.data?.[0];

    if (!player) {
      return res.status(404).json({ message: "Gebruiker niet gevonden." });
    }

    // 3. Zet paid_access_until op basis van token
    await fetch(`https://cms.core.909play.com/items/players/${player.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      },
      body: JSON.stringify({
        paid_access_until: validUntil.toISOString()
      })
    });

    return res.status(200).json({ message: "Toegang geactiveerd via token." });

  } catch (err) {
    console.error("Fout bij verwerken van token:", err);
    return res.status(500).json({ message: "Interne serverfout bij tokenverwerking." });
  }
}
