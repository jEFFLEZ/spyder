import { exec } from "child_process";
import { logger } from "./logger";

export async function detectModules() {
  // naive detection: try to find processes by name
  const names = ["a", "b", "c"];
  const out: Record<string, any> = {};
  for (const n of ["a", "b", "c"]) out[n] = { running: false };

  await new Promise<void>((resolve) => {
    exec(process.platform === "win32" ? "tasklist" : "ps aux", (err, stdout) => {
      if (err) {
        logger.warn(`Failed to list processes: ${err.message}`);
        return resolve();
      }
      const s = stdout.toString();
      for (const name of names) {
        const regex = new RegExp(name, "i");
        if (regex.test(s)) {
          out[name].running = true;
        }
      }
      resolve();
    });
  });
  return out;
}

export async function findAndKill() {
  // naive: find processes that match names and kill them
  const names = ["a", "b", "c"];
  const killed: number[] = [];
  for (const n of names) {
    try {
      if (process.platform === "win32") {
        exec(`taskkill /IM ${n}.exe /F`, (err) => {});
      } else {
        exec(`pkill -f ${n}`, (err) => {});
      }
    } catch (err) {
      // ignore
    }
  }
  return killed;
}
