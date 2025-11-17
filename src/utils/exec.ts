import { spawn } from "child_process";
import { logger } from "./logger";
import { unlinkSync, existsSync, rmSync } from "fs";
export function spawnSafe(command: string, args: string[] = [], opts: any = {}) {
  try {
    const proc = spawn(command, args, { stdio: "inherit", shell: true, ...opts });
    proc.on("error", (err) => logger.error(`Process error: ${err.message}`));
    return proc;
  } catch (err: any) {
    logger.error(`Failed to spawn ${command}: ${err.message}`);
    throw err;
  }
}

export function rimrafSync(path: string) {
  if (!path) return;
  if (!existsSync(path)) return;
  try {
    rmSync(path, { recursive: true, force: true });
  } catch (err) {
    // fallback
    try {
      unlinkSync(path);
    } catch {}
  }
}
