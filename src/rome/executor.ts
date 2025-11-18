import { exec as _exec } from 'child_process';
import { promisify } from 'util';
const exec = promisify(_exec);

export async function executeAction(action: string, ctx: any = {}) {
  // action strings: run "cmd" in "dir"  OR  npz.encode file.path  OR daemon.reload
  if (!action) return { success: false, error: 'empty' };
  try {
    if (action.startsWith('run ')) {
      // run "npm run build" in "path"
      const m = /run\s+"([^"]+)"(?:\s+in\s+"([^"]+)")?/.exec(action);
      if (!m) return { success: false, error: 'invalid run syntax' };
      const cmd = m[1];
      const dir = m[2] || process.cwd();
      const { stdout, stderr } = await exec(cmd, { cwd: dir, env: process.env });
      return { success: true, stdout, stderr };
    }

    if (action.startsWith('npz.encode')) {
      // just log for now
      return { success: true, note: 'npz.encode simulated' };
    }

    if (action.startsWith('daemon.reload')) {
      // no-op here, return success
      return { success: true, note: 'daemon.reload simulated' };
    }

    // default: return unknown
    return { success: false, error: 'unknown action' };
  } catch (e: any) {
    return { success: false, error: e && e.message ? e.message : String(e) };
  }
}
