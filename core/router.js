// core/router.js
import { runGeneralEngine } from "../engines/general.js";
import { runFootballEngine } from "../engines/football.js";
import { analyzePsychology } from "./psychology.js";

/**
 * Central router
 * Decides which engine should respond
 */
export async function routeMessage({ message, memory, env }) {
  if (!message || typeof message !== "string") {
    return "Please enter a valid message.";
  }

  // --- psychology always observes (never blocks)
  const psychology = analyzePsychology(message);

  // --- intent detection (simple but reliable)
  const lower = message.toLowerCase();

  const wantsFootball =
    /fixture|fixtures|match|matches|odds|bet|prediction|score|correct score/i.test(
      lower
    );

  // --- route to engine
  if (wantsFootball) {
    return await runFootballEngine({
      message,
      psychology,
      memory,
      env,
    });
  }

  // --- default engine
  return await runGeneralEngine({
    message,
    psychology,
    memory,
    env,
  });
}
