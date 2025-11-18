import { parseLogicFile } from '../rome/logic-parser';
import { loadLogicRules } from '../rome/logic-loader';

const rules = parseLogicFile('src/rome/logic/logic.qfl');
console.log('parsed rules:', rules.map(r => r.name));
if (rules.length === 0) throw new Error('no rules parsed');
process.exit(0);
