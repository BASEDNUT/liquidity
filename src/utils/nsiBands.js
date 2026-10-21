// NSI score -> board weather state mapping (S126 orchard board).
// Documented NSI bands (knowledge/nsi-formula.md): GREEN 70-100, NEUTRAL 30-70, RED 0-30.
// Board states (Boss's v35 board): X-FEAR / FEAR / NEUTRAL / GREED / X-GREED.
// Mapping extends the documented 3-band split into 5 board states at the edges:
//   xfear < 15, fear 15-<30, neutral 30-<70, greed 70-<85, xgreed >= 85.
export const WEATHER_STATE_KEYS = ['xfear', 'fear', 'neutral', 'greed', 'xgreed'];

export function nsiScoreToStateKey(score) {
  if (score === null || score === undefined) return null;
  const s = Number(score);
  if (!Number.isFinite(s)) return null;
  if (s >= 85) return 'xgreed';
  if (s >= 70) return 'greed';
  if (s >= 30) return 'neutral';
  if (s >= 15) return 'fear';
  return 'xfear';
}
