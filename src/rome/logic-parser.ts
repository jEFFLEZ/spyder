import * as fs from 'fs';

export type LogicRule = {
  name: string;
  when: string; // simple expression string
  do: string; // simple action string
};

export function parseLogicFile(filePath: string): LogicRule[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l && !l.startsWith('#'));
  const rules: LogicRule[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('rule ')) {
      const m = /^rule\s+(\w+)\s*\{/.exec(l);
      if (!m) { i++; continue; }
      const name = m[1];
      i++;
      let when = '';
      let action = '';
      while (i < lines.length && !lines[i].startsWith('}')) {
        const ln = lines[i];
        if (ln.startsWith('when ')) when = ln.slice('when '.length).trim();
        if (ln.startsWith('do ')) action = ln.slice('do '.length).trim();
        i++;
      }
      // skip closing '}' line
      i++;
      rules.push({ name, when, do: action });
    } else {
      i++;
    }
  }
  return rules;
}

// simple evaluator helper to check basic expressions
export function evaluateConditionExpr(expr: string, ctx: any): boolean {
  // supports: and / or (||) , equality '==' and parentheses
  if (!expr || expr.trim() === '') return false;
  // replace ctx tokens like file.type with quoted values
  let e = expr.replace(/file\.type/g, `"${ctx.file?.type||''}"`);
  e = e.replace(/file\.tagChanged/g, ctx.file?.tagChanged ? 'true' : 'false');
  e = e.replace(/rome\.index\.updated/g, ctx.romeIndexUpdated ? 'true' : 'false');
  // replace == with === for JS eval
  e = e.replace(/==/g, '===');
  // replace 'and' with '&&' and 'or'/'||' with '||'
  e = e.replace(/\band\b/gi, '&&').replace(/\bor\b/gi, '||');
  try {
    // eslint-disable-next-line no-eval
    return !!eval(e);
  } catch (e) {
    return false;
  }
}
