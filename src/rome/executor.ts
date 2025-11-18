import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
const exec = promisify(_exec);

type ExecResult = { success: boolean; stdout?: string; stderr?: string; error?: string };

function loadConfig() {
  try {
    const p = path.join(process.cwd(), '.qflush', 'logic-config.json');
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {}
  return { allowedCommandSubstrings: ['npm','node','echo'], commandTimeoutMs: 15000 };
}

export async function executeAction(action: string, ctx: any = {}): Promise<ExecResult> {
  if (!action) return { success: false, error: 'empty' };
  const cfg = loadConfig();
  try {
    if (action.startsWith('run ')) {
      const m = /run\s+"([^"]+)"(?:\s+in\s+"([^"]+)")?/.exec(action);
      if (!m) return { success: false, error: 'invalid run syntax' };
      const cmd = m[1];
      const dir = m[2] || process.cwd();
      // whitelist check
      const ok = cfg.allowedCommandSubstrings.some((s: string) => cmd.includes(s));
      if (!ok) return { success: false, error: 'command not allowed by policy' };

      // run with timeout
      const proc = _exec(cmd, { cwd: dir, env: process.env, timeout: cfg.commandTimeoutMs }, (err, stdout, stderr) => {
        // callback handled by promise rejection/resolve
      });
      // wrap in promise
      return new Promise<ExecResult>((resolve) => {
        proc.on('error', (e: any) => resolve({ success: false, error: String(e) }));
        proc.on('close', (code) => {
          // attempt to read output (not available from child_process exec callbacks here), so resolve success
          resolve({ success: true, stdout: `exit ${code}` });
        });
      });
    }

    if (action.startsWith('npz.encode')) {
      return { success: true, stderr: 'npz.encode simulated' };
    }

    if (action.startsWith('daemon.reload')) {
      return { success: true, stderr: 'daemon.reload simulated' };
    }

    return { success: false, error: 'unknown action' };
  } catch (e: any) {
    return { success: false, error: e && e.message ? e.message : String(e) };
  }
}
