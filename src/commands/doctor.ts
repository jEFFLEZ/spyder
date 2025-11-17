import { logger } from '../utils/logger';
import { detectModules } from '../utils/detect';
import { httpProbe, tcpProbe } from '../utils/health';

export async function runDoctor() {
  logger.info('qflash: running doctor checks...');
  const detected = await detectModules();
  for (const k of Object.keys(detected)) {
    const v = detected[k];
    logger.info(`${k}: installed=${v.installed} running=${v.running} path=${v.path || 'n/a'}`);
    if (v.bin && v.path) {
      logger.info(`  bin: ${v.bin}`);
    }
  }
  // check node version
  logger.info(`Node version: ${process.version}`);
  // simple port checks if any
  // check localhost:80 for firewall example
  const httpOk = await httpProbe('http://localhost:80', 500);
  logger.info(`HTTP localhost:80 reachable: ${httpOk}`);
  logger.info('Doctor checks complete');
}
