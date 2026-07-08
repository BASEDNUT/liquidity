// /api/score — Nut Catcher score endpoint
export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, game: "🥜 /NUTIFY! Nut Catcher", status: "ready" });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const score = Number(body.score ?? 0);
    const misses = Number(body.misses ?? 0);

    if (!Number.isFinite(score) || score < 0 || score > 9999) {
      return res.status(400).json({ ok: false, error: "Invalid score" });
    }

    const cleanScore = Math.floor(score);
    const title =
      cleanScore >= 60 ? "👑 Peanut sovereign" :
      cleanScore >= 35 ? "🥜 Nut monarch" :
      cleanScore >= 18 ? "🧺 Basket menace" :
      cleanScore >= 8 ? "🐿️ Squirrel apprentice" :
      "🌱 Tiny harvest";

    return res.status(200).json({
      ok: true,
      title,
      score: cleanScore,
      misses: Math.max(0, Math.floor(misses))
    });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
