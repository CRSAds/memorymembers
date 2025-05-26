export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { username, email, password, token } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Vul alle velden in" });
  }

  try {
    let paid_access_until = null;

    // 1️⃣ Check op geldige token (direct via parameter)
    if (token) {
      const tokenRes = await fetch(`https://cms.core.909play.com/items/payment_tokens?filter[token][_eq]=${token}`, {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const tokenData = await tokenRes.json();
      const record = tokenData?.data?.[0];

      if (record && new Date(record.valid_until) > new Date()) {
        paid_access_until = record.valid_until;

        // Token wissen na gebruik
        await fetch(`https://cms.core.909play.com/items/payment_tokens/${record.id}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
          }
        });
      }
    }

    // 2️⃣ Als geen token, check op bestaande payment-token via email
    if (!paid_access_until) {
      const emailTokenRes = await fetch(`https://cms.core.909play.com/items/payment_tokens?filter[email][_eq]=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const tokenData = await emailTokenRes.json();
      const record = tokenData?.data?.[0];

      if (record && new Date(record.valid_until) > new Date()) {
        paid_access_until = record.valid_until;

        // Token wissen
        await fetch(`https://cms.core.909play.com/items/payment_tokens/${record.id}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
          }
        });
      }
    }

    // 🔐 Registreer nieuwe speler
    const createRes = await fetch("https://cms.core.909play.com/items/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      },
      body: JSON.stringify({
        username,
        email,
        password,
        paid_access_until: paid_access_until || null
      })
    });

    const data = await createRes.json();
    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: data?.errors?.[0]?.message || "Registratie mislukt" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Fout bij registreren:", err);
    return res.status(500).json({ error: "Interne fout bij registreren" });
  }
}
