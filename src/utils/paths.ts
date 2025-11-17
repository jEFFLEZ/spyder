import { existsSync } from "fs";
import { join } from "path";

const CANDIDATES = {
  a: ["./a", "./A"],
  b: ["./b", "./B"],
  c: ["./c", "./C"],
};

export function resolvePaths(detected: any = {}) {
  const out: Record<string, string | undefined> = {};
  for (const key of Object.keys(CANDIDATES)) {
    if (detected && detected[key] && detected[key].path) {
      out[key] = detected[key].path;
      continue;
    }
    const tries = CANDIDATES[key as keyof typeof CANDIDATES];
    for (const t of tries) {
      const p = join(process.cwd(), t);
      if (existsSync(p)) {
        out[key] = p;
        break;
      }
    }
  }
  return out;
}
