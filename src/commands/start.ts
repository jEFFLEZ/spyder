import { detectModules } from "../utils/detect";
import { logger } from "../utils/logger";
import { spawnSafe, ensurePackageInstalled } from "../utils/exec";
import { resolvePaths, SERVICE_MAP } from "../utils/paths";
import { QFlashOptions } from "../chain/smartChain";

export async function runStart(opts?: QFlashOptions) {
  logger.info("qflash: starting modules...");
  const detected = opts?.detected || (await detectModules());
  const paths = resolvePaths(detected);

  const services = opts?.services && opts.services.length ? opts.services : Object.keys(SERVICE_MAP);

  for (const mod of services) {
    const p = (opts?.modulePaths && opts.modulePaths[mod]) || paths[mod];
    const pkg = SERVICE_MAP[mod] && SERVICE_MAP[mod].pkg;
    if (!p && pkg) {
      // try to ensure the package is installed globally
      const ok = ensurePackageInstalled(pkg);
      if (!ok) {
        logger.warn(`${mod} not found and failed to install ${pkg}, skipping`);
        continue;
      }
    }

    // prefer local path if present
    if (p) {
      logger.info(`Launching ${mod} from ${p}`);
      const proc = spawnSafe("node", [p], { cwd: p });
      proc.on("exit", (code: any) => {
        logger.info(`${mod} exited with ${code}`);
      });
      continue;
    }

    if (pkg) {
      logger.info(`Launching ${mod} via npx ${pkg}`);
      const proc = spawnSafe("npx", [pkg]);
      proc.on("exit", (code: any) => {
        logger.info(`${mod} exited with ${code}`);
      });
      continue;
    }

    logger.warn(`${mod} path and package not found, skipping`);
  }
}
