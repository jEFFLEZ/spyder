import { spawn } from 'child_process';
import { writeFileSync, existsSync, mkdirSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

type ProcRecord = {
  name: string;
  pid: number;
  cmd: string;
  args: string[];
  cwd?: string;
};

const STATE_DIR = join(process.cwd(), '.qflash');
const STATE_FILE = join(STATE_DIR, 'services.json');
let procs: Record<string, ProcRecord> = {};

function ensureStateDir() {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
}

function persist() {
  try {
    ensureStateDir();
    writeFileSync(STATE_FILE, JSON.stringify(procs, null, 2), 'utf8');
  } catch (err) {
    logger.warn(`Failed to persist supervisor state: ${err}`);
  }
}

function load() {
  try {
    if (existsSync(STATE_FILE)) {
      const raw = readFileSync(STATE_FILE, 'utf8');
      procs = JSON.parse(raw);
    }
  } catch (err) {
    logger.warn(`Failed to load supervisor state: ${err}`);
  }
}

load();

export function listRunning() {
  return Object.values(procs);
}

export function startProcess(name: string, cmd: string, args: string[] = [], opts: any = {}) {
  ensureStateDir();
  logger.info(`supervisor: starting ${name} -> ${cmd} ${args.join(' ')}`);
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true, cwd: opts.cwd || process.cwd() });
  child.on('error', (err) => logger.error(`supervisor: ${name} process error ${err.message}`));
  child.on('exit', (code) => {
    logger.warn(`supervisor: ${name} exited with ${code}`);
    // remove from persisted state
    if (procs[name]) delete procs[name];
    persist();
  });
  procs[name] = { name, pid: child.pid || -1, cmd, args, cwd: opts.cwd };
  persist();
  return child;
}

export function stopProcess(name: string) {
  const entry = procs[name];
  if (!entry) return false;
  try {
    process.kill(entry.pid, 'SIGTERM');
    try { delete procs[name]; persist(); } catch {}
    return true;
  } catch (err) {
    logger.warn(`supervisor: failed to kill ${name} pid=${entry.pid} (${err})`);
    return false;
  }
}

export function stopAll() {
  const names = Object.keys(procs);
  for (const n of names) {
    stopProcess(n);
  }
  // attempt to remove state file
  try {
    if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE);
  } catch {}
}

export function clearState() {
  procs = {};
  try { if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE); } catch {}
}
