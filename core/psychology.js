// core/psychology.js

/**
 * Analyze user psychology and intent pressure
 * This NEVER blocks responses
 */
export function analyzePsychology(text = "") {
  const lower = text.toLowerCase();

  let riskLevel = 0;
  let signals = [];

  if (/all in|must win|sure win|100%|no error/i.test(lower)) {
    riskLevel += 2;
    signals.push("overconfidence");
  }

  if (/now|today|urgent|fast|quick/i.test(lower)) {
    riskLevel += 1;
    signals.push("urgency");
  }

  if (/lost|loss|recover|chase|revenge/i.test(lower)) {
    riskLevel += 3;
    signals.push("loss-chasing");
  }

  if (/angry|mad|tired|frustrated/i.test(lower)) {
    riskLevel += 2;
    signals.push("emotional");
  }

  return {
    riskLevel: Math.min(riskLevel, 5), // cap
    signals,
    disciplineHint:
      riskLevel >= 4
        ? "High emotional risk detected. Reduce stake size."
        : riskLevel >= 2
        ? "Moderate risk detected. Be selective."
        : "Psychology stable.",
  };
}
