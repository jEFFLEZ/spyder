"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDoctor = runDoctor;
const logger_1 = require("../utils/logger");
const detect_1 = require("../utils/detect");
const health_1 = require("../utils/health");
async function runDoctor() {
    logger_1.logger.info('qflash: running doctor checks...');
    const detected = await (0, detect_1.detectModules)();
    for (const k of Object.keys(detected)) {
        const v = detected[k];
        logger_1.logger.info(`${k}: installed=${v.installed} running=${v.running} path=${v.path || 'n/a'}`);
        if (v.bin && v.path) {
            logger_1.logger.info(`  bin: ${v.bin}`);
        }
    }
    // check node version
    logger_1.logger.info(`Node version: ${process.version}`);
    // simple port checks if any
    // check localhost:80 for firewall example
    const httpOk = await (0, health_1.httpProbe)('http://localhost:80', 500);
    logger_1.logger.info(`HTTP localhost:80 reachable: ${httpOk}`);
    logger_1.logger.info('Doctor checks complete');
}
