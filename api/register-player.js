// api/register-player.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email, password, username, token } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: "Verplichte velden ontbreken." });
  }

  try {
    // 1. ✅ Check of speler al bestaat
    const checkRes = await fetch(`https://cms.core.909play.com/items/players?filter[email][_eq]=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });
    const existing = await checkRes.json();
    if (existing?.data?.length > 0) {
      return res.status(400).json({ error: "Er bestaat al een account met dit e-mailadres." });
    }

    // 2. 🧩 Check op geldig token (optioneel)
    let paid_access_until = null;

    if (token) {
      const tokenCheck = await fetch(`https://cms.core.909play.com/items/payment_tokens?filter[token][_eq]=${token}`, {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const tokenData = await tokenCheck.json();
      const entry = tokenData?.data?.[0];

      if (!entry || new Date(entry.valid_until) < new Date()) {
        return res.status(400).json({ error: "Deze toegangscode is ongeldig of verlopen." });
      }

      paid_access_until = entry.valid_until;

      // Optioneel: token verwijderen na gebruik
      await fetch(`https://cms.core.909play.com/items/payment_tokens/${entry.id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
    }

    // 3. ✅ Maak nieuw player account aan
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
        paid_access_until: paid_access_until ?? null
      })
    });

    const newPlayer = await createRes.json();
    if (!createRes.ok) {
      return res.status(400).json({ error: "Registratie mislukt." });
    }

    return res.status(200).json({ message: "Account aangemaakt", player: newPlayer.data });

  } catch (err) {
    console.error("Registratiefout:", err);
    return res.status(500).json({ error: "Interne fout bij registratie." });
  }
}
