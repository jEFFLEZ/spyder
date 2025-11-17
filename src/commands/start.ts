import { detectModules } from "../utils/detect";
import { logger } from "../utils/logger";
import { spawnSafe, ensurePackageInstalled } from "../utils/exec";
import { resolvePaths, SERVICE_MAP } from "../utils/paths";
import { QFlashOptions } from "../chain/smartChain";
import { resolvePackagePath, readPackageJson } from "../utils/package";

export async function runStart(opts?: QFlashOptions) {
  logger.info("qflash: starting modules...");
  const detected = opts?.detected || (await detectModules());
  const paths = resolvePaths(detected);

  const services = opts?.services && opts.services.length ? opts.services : Object.keys(SERVICE_MAP);

  for (const mod of services) {
    const p = (opts?.modulePaths && opts.modulePaths[mod]) || paths[mod];
    const pkg = SERVICE_MAP[mod] && SERVICE_MAP[mod].pkg;

    // if local path exists and contains package.json, prefer it
    let pkgPath = p;
    if (!pkgPath && pkg) {
      pkgPath = resolvePackagePath(pkg);
    }

    if (!pkgPath && pkg) {
      const ok = ensurePackageInstalled(pkg);
      if (!ok) {
        logger.warn(`${mod} not found and failed to install ${pkg}, skipping`);
        continue;
      }
      pkgPath = resolvePackagePath(pkg);
    }

    if (!pkgPath) {
      logger.warn(`${mod} path and package not found, skipping`);
      continue;
    }

    const pkgJson = readPackageJson(pkgPath);
    if (pkgJson && pkgJson.bin) {
      // determine binary: if bin is string use it, else pick first key
      const binEntry = typeof pkgJson.bin === "string" ? pkgJson.bin : Object.values(pkgJson.bin)[0];
      const binPath = require("path").join(pkgPath, binEntry);
      logger.info(`Launching ${mod} via binary ${binPath}`);
      const proc = spawnSafe(binPath, [], { cwd: pkgPath });
      proc.on("exit", (code: any) => logger.info(`${mod} exited with ${code}`));
      continue;
    }

    // fallback to npx
    if (pkg) {
      logger.info(`Launching ${mod} via npx ${pkg}`);
      const proc = spawnSafe("npx", [pkg]);
      proc.on("exit", (code: any) => {
        logger.info(`${mod} exited with ${code}`);
      });
      continue;
    }
  }
}
