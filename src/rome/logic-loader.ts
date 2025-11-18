import * as path from 'path';
import * as fs from 'fs';
import { parseLogicFile, LogicRule } from './logic-parser';
import { RomeIndex, RomeTagRecord } from './rome-tag';

const LOGIC_PATH = path.join(process.cwd(), '.qflush', 'logic.qfl');

let rules: LogicRule[] = [];

export function loadLogicRules(): LogicRule[] {
  // prefer .qflush/logic.qfl then src/rome/logic/logic.qfl
  const alt = path.join(process.cwd(), 'src', 'rome', 'logic', 'logic.qfl');
  const p = fs.existsSync(LOGIC_PATH) ? LOGIC_PATH : alt;
  if (!fs.existsSync(p)) { rules = []; return rules; }
  try {
    rules = parseLogicFile(p);
  } catch (e) { rules = []; }
  return rules;
}

export function evaluateRulesForRecord(index: RomeIndex, rec: RomeTagRecord, changedPaths: string[] = []): string[] {
  // naive evaluator: evaluate 'when' expression via simple string checks
  const matched: string[] = [];
  for (const r of rules) {
    const cond = r.when;
    let ok = true;
    const parts = cond.split('and').map(s=>s.trim());
    for (const p of parts) {
      if (p.includes('file.type ==')) {
        const exp = p.split('==')[1].trim().replace(/\"/g,'');
        if (rec.type !== exp) ok = false;
      }
      if (p.includes('file.tagChanged')) {
        // tagChanged: true if this rec.path is in changedPaths
        const isChanged = changedPaths.includes(rec.path);
        if (!isChanged) ok = false;
      }
      if (p.includes('rome.index.updated')) {
        // match if changedPaths non-empty
        if (!changedPaths || changedPaths.length === 0) ok = false;
      }
    }
    if (ok) matched.push(r.do);
  }
  return matched;
}

export function evaluateAllRules(index: RomeIndex, changedPaths: string[] = []) {
  const actions: { path: string; actions: string[] }[] = [];
  for (const rec of Object.values(index)) {
    const a = evaluateRulesForRecord(index, rec as any, changedPaths);
    if (a.length) actions.push({ path: rec.path, actions: a });
  }
  return actions;
}

export function getRules() { return rules; }
