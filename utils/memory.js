// utils/memory.js

const MAX_SIGNALS = 5;

export function updateMemory(memory = [], newSignal) {
  const cleaned = Array.isArray(memory) ? memory : [];

  if (!newSignal || newSignal === "none") {
    return cleaned.slice(-MAX_SIGNALS);
  }

  const updated = [...cleaned, newSignal];
  return updated.slice(-MAX_SIGNALS);
}

export function summarizeMemory(memory = []) {
  const counts = {};

  for (const sig of memory) {
    counts[sig] = (counts[sig] || 0) + 1;
  }

  return counts;
}
