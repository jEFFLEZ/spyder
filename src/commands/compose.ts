import { readCompose } from '../compose/parser';
import { logger } from '../utils/logger';
import { runStart } from './start';
import { startProcess } from '../supervisor';
import { runPurge } from './purge';

export async function runCompose(argv: string[]) {
  const sub = argv[0];
  const compose = readCompose();
  if (!compose) {
    logger.error('No funesterie.yml found');
    return;
  }
  if (sub === 'up') {
    // simple: call start for each module with path override
    const modules = Object.keys(compose.modules);
    for (const m of modules) {
      const def = compose.modules[m];
      logger.info(`Bringing up ${m} from ${def.path || 'package'}`);
      // delegate to start with service and path
      await runStart({ services: [m], modulePaths: { [m]: def.path }, flags: {} } as any);
    }
    return;
  }
  if (sub === 'down') {
    logger.info('Bringing down all modules');
    await runPurge();
    return;
  }
  if (sub === 'logs') {
    const name = argv[1];
    // print tail of log
    const p = compose.modules[name]?.path || null;
    if (!p) logger.info('Specify module name');
    else logger.info(`Logs at ${p}/logs`);
    return;
  }
  logger.info('Usage: qflash compose [up|down|logs|restart]');
}
