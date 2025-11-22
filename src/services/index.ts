import { join } from 'path';
import fs from 'fs';
import logger from '../utils/logger';

export type ServiceEntry = {
  start: (opts?: any) => Promise<void>;
  stop?: () => Promise<void>;
};

export const ServiceState: Record<string, { running: boolean; lastError: any | null; lastStart: number | null }> = {
  bat: { running: false, lastError: null, lastStart: null },
  spyder: { running: false, lastError: null, lastStart: null },
  nezlephant: { running: false, lastError: null, lastStart: null },
  freeland: { running: false, lastError: null, lastStart: null },
};

function tryRequireService(modulePath: string): any | null {
  try {
    if (fs.existsSync(modulePath)) {
      // require cache-safe
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(modulePath);
      return mod;
    }
  } catch (e) {
    logger.warn(`service loader: failed to require ${modulePath}: ${e}`);
  }
  return null;
}

async function makeWrapper(name: string): Promise<ServiceEntry> {
  // try local dist/<name>/index.js then <name>/dist/index.js then node_modules
  const cand1 = join(process.cwd(), name, 'dist', 'index.js');
  const cand2 = join(process.cwd(), 'dist', name, 'index.js');
  const cand3 = join(process.cwd(), 'node_modules', name, 'dist', 'index.js');

  const m = tryRequireService(cand1) || tryRequireService(cand2) || tryRequireService(cand3);
  if (m) {
    const startFn = (m && (m.start || m.default || m.main)) ? (m.start || m.default || m.main) : null;
    const stopFn = (m && (m.stop)) ? m.stop : undefined;
    if (startFn) {
      return {
        start: async (opts?: any) => {
          try {
            await Promise.resolve(startFn(opts));
          } catch (e) {
            throw e;
          }
        },
        stop: stopFn ? async () => Promise.resolve(stopFn()) : undefined,
      };
    }
  }

  // fallback: no embedded API available, provide noop that throws to signal fallback
  return {
    start: async () => {
      throw new Error(`embedded start not available for service ${name}`);
    },
    stop: async () => {},
  };
}

const registry: Record<string, ServiceEntry> = {} as any;

async function ensureRegistered(name: string) {
  const key = name.toLowerCase();
  if (!registry[key]) {
    registry[key] = await makeWrapper(key);
  }
  return registry[key];
}

export function listAvailableServices() {
  return Object.keys(ServiceState);
}

export async function startService(name: string, opts?: any) {
  const key = String(name || '').toLowerCase();
  if (!ServiceState[key]) throw new Error(`Unknown service: ${name}`);

  // safe CI mode
  if (process.env.QFLUSH_SAFE_CI === '1') {
    logger.info(`[SAFE_CI] Skipping service ${key}`);
    return;
  }

  const svc = await ensureRegistered(key);
  try {
    ServiceState[key].lastError = null;
    ServiceState[key].lastStart = Date.now();
    await svc.start(opts);
    ServiceState[key].running = true;
    logger.info(`[SERVICE] started ${key}`);
  } catch (e) {
    ServiceState[key].running = false;
    ServiceState[key].lastError = e;
    logger.error(`[SERVICE] failed to start ${key}: ${e}`);
    throw e;
  }
}

export async function stopService(name: string) {
  const key = String(name || '').toLowerCase();
  if (!ServiceState[key]) throw new Error(`Unknown service: ${name}`);
  const svc = await ensureRegistered(key);
  try {
    if (svc.stop) await svc.stop();
    ServiceState[key].running = false;
    logger.info(`[SERVICE] stopped ${key}`);
  } catch (e) {
    ServiceState[key].lastError = e;
    logger.error(`[SERVICE] failed to stop ${key}: ${e}`);
    throw e;
  }
}
