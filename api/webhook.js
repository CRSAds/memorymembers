export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id: paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ error: "Geen payment ID ontvangen" });
  }

  try {
    const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: {
        Authorization: "Bearer test_T6uA72u6RRaKEg2mJHM2e4wyJNHBuN"
      }
    });

    const payment = await mollieRes.json();
    if (payment.status !== "paid") {
      return res.status(200).json({ message: "Betaling niet succesvol" });
    }

    const email = payment.metadata?.email;

    if (email) {
      const playerRes = await fetch(`https://cms.core.909play.com/items/players?filter[email][_eq]=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        }
      });
      const playerData = await playerRes.json();
      const player = playerData?.data?.[0];

      if (player) {
        const accessUntil = new Date();
        accessUntil.setDate(accessUntil.getDate() + 7);

        await fetch(`https://cms.core.909play.com/items/players/${player.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
          },
          body: JSON.stringify({ paid_access_until: accessUntil.toISOString() })
        });

        return res.status(200).json({ message: "Toegang toegekend aan bestaande speler" });
      } else {
        // ❗ Speler bestaat nog niet, token koppelen aan e-mailadres
        const token = crypto.randomUUID();
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 7);

        await fetch("https://cms.core.909play.com/items/payment_tokens", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
          },
          body: JSON.stringify({
            token,
            valid_until: validUntil.toISOString(),
            email
          })
        });

        console.log("✅ Token aangemaakt voor e-mailbetaling:", token);
        return res.status(200).json({ message: "Token opgeslagen voor nieuwe speler" });
      }
    }

    // 🔄 Geen e-mail beschikbaar — eventueel fallback
    return res.status(200).json({ message: "Geen e-mail in metadata aanwezig" });

  } catch (err) {
    console.error("Webhook fout:", err);
    return res.status(500).json({ error: "Webhook-fout" });
  }
}
