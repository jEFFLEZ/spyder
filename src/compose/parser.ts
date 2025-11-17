import fs from 'fs';
import yaml from 'js-yaml';

export type ModuleDef = {
  path?: string;
  port?: number;
  token?: string;
  env?: Record<string,string>;
};

export type ComposeFile = {
  modules: Record<string, ModuleDef>;
};

export function readCompose(file = 'funesterie.yml'): ComposeFile | null {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const doc = yaml.load(raw) as any;
    if (!doc || !doc.modules) return null;
    return { modules: doc.modules } as ComposeFile;
  } catch (err) {
    return null;
  }
}
