#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const smartChain_1 = require("./chain/smartChain");
const help_1 = require("./cli/help");
const compose_1 = require("./commands/compose");
const doctor_1 = require("./commands/doctor");
const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
    (0, help_1.showHelp)();
    process.exit(0);
}
const first = argv[0];
if (first === 'compose') {
    void (0, compose_1.runCompose)(argv.slice(1));
    process.exit(0);
}
if (first === 'doctor') {
    void (0, doctor_1.runDoctor)();
    process.exit(0);
}
const { pipeline, options } = (0, smartChain_1.buildPipeline)(argv);
(0, smartChain_1.executePipeline)(pipeline, options).catch((err) => {
    console.error("qflash: fatal", err);
    process.exit(1);
});
