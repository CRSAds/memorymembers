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
    // Haal betaling op bij Mollie
    const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: {
        Authorization: "Bearer test_T6uA72u6RRaKEg2mJHM2e4wyJNHBuN"
      }
    });
    const payment = await mollieRes.json();

    if (payment.status !== "paid") {
      return res.status(200).json({ message: "Betaling niet succesvol" }); // niks doen
    }

    const email = payment.metadata?.email;
    if (!email) {
      return res.status(400).json({ error: "Geen email in metadata" });
    }

    // Zoek player op via Directus
    const playerRes = await fetch(`https://cms.core.909play.com/items/players?filter[email][_eq]=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      }
    });
    const playerData = await playerRes.json();
    const player = playerData?.data?.[0];

    if (!player) {
      return res.status(404).json({ error: "Speler niet gevonden" });
    }

    // Bepaal nieuwe datum
    const accessUntil = new Date();
    accessUntil.setDate(accessUntil.getDate() + 7);

    // Update player
    await fetch(`https://cms.core.909play.com/items/players/${player.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
      },
      body: JSON.stringify({ paid_access_until: accessUntil.toISOString() })
    });

    return res.status(200).json({ message: "Toegang geactiveerd" });

  } catch (err) {
    console.error("Webhook fout:", err);
    return res.status(500).json({ error: "Webhook-fout" });
  }
}
