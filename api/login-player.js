export default async function handler(req, res) {
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
    const response = await fetch("https://cms.core.909play.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: result.errors?.[0]?.message || "Inloggen mislukt."
      });
    }

    return res.status(200).json({
      message: "Login succesvol",
      access_token: result.data.access_token,
      refresh_token: result.data.refresh_token,
      expires: result.data.expires,
      user: result.data.user
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Interne serverfout" });
  }
}
