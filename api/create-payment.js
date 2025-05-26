// api/create-payment.js

import crypto from "crypto"; // ← alleen als je deze runtime ondersteunt

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body;
  let redirectUrl;

  try {
    if (email) {
      redirectUrl = `https://nl.wincadeaukaarten.com/memorymembers?email=${encodeURIComponent(email)}`;
    } else {
      const token = crypto.randomUUID();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7);

      await fetch("https://cms.core.909play.com/items/payment_tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer m-5sBEpExkYWgJ5zuepQWq2WCsS0Yd6u"
        },
        body: JSON.stringify({ token, valid_until: validUntil.toISOString() })
      });

      redirectUrl = `https://nl.wincadeaukaarten.com/memorymembers?token=${token}`;
    }

    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: "Bearer test_T6uA72u6RRaKEg2mJHM2e4wyJNHBuN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: { value: "1.99", currency: "EUR" },
        description: "Toegang tot het memory spel (7 dagen)",
        redirectUrl,
        webhookUrl: "https://memorymembers.vercel.app/api/webhook",
        metadata: { email }
      })
    });

    const data = await mollieRes.json();
    if (!mollieRes.ok) return res.status(400).json({ error: data });

    return res.status(200).json({ paymentUrl: data._links.checkout.href });
  } catch (err) {
    console.error("Mollie error:", err);
    return res.status(500).json({ error: "Interne fout bij betaling" });
  }
}
