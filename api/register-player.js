// api/register-player.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ message: "Alle velden zijn verplicht." });
  }

  try {
    // Controleer op geldige payment token (indien aanwezig)
    const urlParams = new URLSearchParams(req.headers.referer?.split("?")[1]);
    const token = urlParams.get("token");
    let paid_access_until = null;

    if (token) {
      const tokenRes = await fetch(`https://cms.core.909play.com/items/payment_tokens?filter[token][_eq]=${encodeURIComponent(token)}`, {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const tokenData = await tokenRes.json();
      const match = tokenData?.data?.[0];

      if (match && new Date(match.valid_until) > new Date()) {
        paid_access_until = match.valid_until;

        // Token eenmalig verwijderen
        await fetch(`https://cms.core.909play.com/items/payment_tokens/${match.id}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
          }
        });
      }
    }

    // Maak nieuwe speler aan
    const createRes = await fetch("https://cms.core.909play.com/items/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      },
      body: JSON.stringify({
        email,
        password,
        username,
        paid_access_until
      })
    });

    const created = await createRes.json();
    if (!createRes.ok) {
      return res.status(400).json({ message: "Registratie mislukt.", error: created });
    }

    return res.status(200).json({ message: "Registratie gelukt" });
  } catch (err) {
    console.error("Registratiefout:", err);
    return res.status(500).json({ message: "Fout bij registratie" });
  }
}
