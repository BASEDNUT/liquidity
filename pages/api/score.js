export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { score, misses } = req.body || {};
  const s = Number(score) || 0;

  const titles = [
    { min: 100, title: "🥥 Peanut Sovereign — Legendary harvest" },
    { min: 50, title: "🌰 Cashew Commander — Elite basket skills" },
    { min: 25, title: "🌰 Squirrel Sergeant — Solid nut catcher" },
    { min: 10, title: "🌰 Squirrel Apprentice — Getting the hang of it" },
    { min: 1, title: "🌰 Squirrel Cadet — First nuts collected" },
    { min: 0, title: "🌰 Harvest logged — Try again, squirrel" }
  ];

  const rank = titles.find(t => s >= t.min);
  res.status(200).json({ score: s, misses: Number(misses) || 0, title: rank ? rank.title : titles[titles.length - 1].title });
}
