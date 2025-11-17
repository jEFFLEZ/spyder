import { exec } from "child_process";
import { logger } from "./logger";
import { SERVICE_MAP } from "./paths";

export async function detectModules() {
  // detect installed packages and running processes
  const out: Record<string, any> = {};
  for (const name of Object.keys(SERVICE_MAP))
    out[name] = { running: false, installed: false };

  // check installed via npm ls -g
  for (const name of Object.keys(SERVICE_MAP)) {
    try {
      // try require.resolve for local node_modules first
      try {
        require.resolve(SERVICE_MAP[name].pkg);
        out[name].installed = true;
      } catch {
        // fallback to global check
        // noop, we'll check processes later
      }
    } catch {}
  }

  await new Promise<void>((resolve) => {
    exec(process.platform === "win32" ? "tasklist" : "ps aux", (err, stdout) => {
      if (err) {
        logger.warn(`Failed to list processes: ${err.message}`);
        return resolve();
      }
      const s = stdout.toString();
      for (const name of Object.keys(SERVICE_MAP)) {
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
  const names = Object.keys(SERVICE_MAP);
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
