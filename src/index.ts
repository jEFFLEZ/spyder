#!/usr/bin/env node
import { buildPipeline, executePipeline } from "./chain/smartChain";
import { showHelp } from "./cli/help";
import { runCompose } from "./commands/compose";
import { runDoctor } from "./commands/doctor";

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
  showHelp();
  process.exit(0);
}

const first = argv[0];
if (first === 'compose') {
  void runCompose(argv.slice(1));
  process.exit(0);
}
if (first === 'doctor') {
  void runDoctor(argv.slice(1));
  process.exit(0);
}
if (first === 'daemon') {
  // start qflashd in-process
  void import('./daemon/qflashd').then((m) => {
    // module starts itself and logs
  }).catch((err) => { console.error('failed to start daemon', err); process.exit(1); });
  process.exit(0);
}

const { pipeline, options } = buildPipeline(argv);

executePipeline(pipeline, options).catch((err) => {
  console.error("qflash: fatal", err);
  process.exit(1);
});
