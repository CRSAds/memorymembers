export default async function handler(req, res) {
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
      return res.status(response.status).json({ message: result.errors?.[0]?.message || result.message });
    }

    const { access_token, refresh_token, expires } = result.data;

    // Gebruik token om gebruikersprofiel op te halen
    const profileRes = await fetch("https://cms.core.909play.com/users/me", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const profile = await profileRes.json();

    return res.status(200).json({
      data: { access_token, refresh_token, expires },
      user: profile.data
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
