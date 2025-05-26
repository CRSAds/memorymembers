// api/webhook.js
import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Mollie-Signature");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const rawBody = JSON.stringify(req.body);
  const signature = req.headers["mollie-signature"];
  const secret = "e38m6jchMj7BH5JPJVy2eqbS4wxKwzMU";

  if (!signature || !secret) {
    return res.status(400).json({ error: "Webhook authenticatie ontbreekt" });
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: "Ongeldige webhook signature" });
  }

  const { id: paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ error: "Geen payment ID ontvangen" });
  }

  try {
    // 🔍 Haal betaling op bij Mollie
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

    // ✅ Als er een e-mailadres is, koppel direct aan speler
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
      }
    }

    // 🧩 Geen e-mailadres → Genereer token in `payment_tokens`
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
        valid_until: validUntil.toISOString()
      })
    });

    console.log("✅ Token gegenereerd:", token);

    return res.status(200).json({ message: "Token aangemaakt voor registratie" });

  } catch (err) {
    console.error("Webhook fout:", err);
    return res.status(500).json({ error: "Webhook-fout" });
  }
}
