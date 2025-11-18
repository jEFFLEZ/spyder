import { executeAction } from '../rome/executor';

(async ()=>{
  // should reject a dangerous command
  const res1 = await executeAction('run "rm -rf /" in "./"');
  if (res1.success) { console.error('dangerous command should not be allowed'); process.exit(2); }

  // should allow npm echo
  const res2 = await executeAction('run "echo hello" in "./"');
  if (!res2.success) { console.error('echo should be allowed', res2); process.exit(2); }

  console.log('executor tests passed');
  process.exit(0);
})();
