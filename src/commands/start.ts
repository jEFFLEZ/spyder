import { detectModules } from "../utils/detect";
import { logger } from "../utils/logger";
import { spawnSafe } from "../utils/exec";
import { resolvePaths } from "../utils/paths";
import { QFlashOptions } from "../chain/smartChain";

export async function runStart(opts?: QFlashOptions) {
  logger.info("qflash: starting modules...");
  const detected = opts?.detected || (await detectModules());
  const paths = resolvePaths(detected);

  // choose services from options.services or default set
  const services = opts?.services && opts.services.length ? opts.services : ["a", "b", "c"];

  for (const mod of services) {
    const p = (opts?.modulePaths && opts.modulePaths[mod]) || paths[mod];
    if (!p) {
      logger.warn(`${mod} path not found, skipping`);
      continue;
    }
    logger.info(`Launching ${mod} from ${p}`);
    const proc = spawnSafe("node", [p], { cwd: p });
    proc.on("exit", (code: any) => {
      logger.info(`${mod} exited with ${code}`);
    });
  }
}
