// utils/trace.js

const ENABLED = false;

export function trace(data) {
  if (!ENABLED) return;
  console.log("[NEUROGEN TRACE]", JSON.stringify(data, null, 2));
}
