// utils/memory.js
// NeuroGen Learning Memory Core (SAFE, CAPPED)

const intentStats = {
  betting: 0,
  psychology: 0,
  urgency: 0,
  exploration: 0
};

export function analyzeIntent(text) {
  const lower = text.toLowerCase();

  if (/(bet|odds|fixture|match|prediction)/.test(lower)) {
    intentStats.betting++;
  }

  if (/(feel|mind|stress|control|discipline|addiction|emotion)/.test(lower)) {
    intentStats.psychology++;
  }

  if (/(now|urgent|immediately|no error|asap|god mode)/.test(lower)) {
    intentStats.urgency++;
  }

  if (/(learn|explain|how does|why|theory)/.test(lower)) {
    intentStats.exploration++;
  }
}

export function getDominantIntent() {
  return Object.entries(intentStats)
    .sort((a, b) => b[1] - a[1])[0][0];
}

export function getIntentSnapshot() {
  return { ...intentStats };
}
