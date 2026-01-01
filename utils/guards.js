// utils/guards.js

export function confirmEscalation(previousLevel = 0, currentLevel = 0) {
  // escalation allowed only if severity repeats or increases
  return currentLevel >= 2 && previousLevel >= 2;
}

export function detectOverride(message = "") {
  const msg = message.toLowerCase();

  return (
    msg.includes("override") ||
    msg.includes("proceed anyway") ||
    msg.includes("i accept the risk")
  );
}
