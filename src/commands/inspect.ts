import { logger } from "../utils/logger";
import { detectModules } from "../utils/detect";
import { QFlashOptions } from "../chain/smartChain";

export async function runInspect(opts?: QFlashOptions) {
  logger.info("qflash: inspecting ecosystem...");
  const detected = opts?.detected || (await detectModules());
  for (const key of Object.keys(detected)) {
    const v = detected[key];
    logger.info(`${key}: ${v.running ? `running (pid=${v.pid || 'unknown'})` : 'stopped'}`);
    if (v.port) logger.info(`  port: ${v.port}`);
  }
}
