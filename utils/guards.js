// utils/guards.js
// Psychology & control guards (SAFE, READ-ONLY)

export function detectOverride(text = "") {
  const triggers = [
    "no error allowed",
    "god mode",
    "unleash",
    "override",
    "do it now",
    "extreme",
    "no limit"
  ];

  const lower = text.toLowerCase();
  return triggers.some(t => lower.includes(t));
}

export function confirmEscalation(text = "") {
  let score = 0;

  if (text.length > 120) score += 1;
  if (/[A-Z]{3,}/.test(text)) score += 1;
  if (/!{2,}/.test(text)) score += 1;
  if (detectOverride(text)) score += 2;

  return Math.min(score, 5);
}
