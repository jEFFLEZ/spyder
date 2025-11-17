"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCompose = runCompose;
const parser_1 = require("../compose/parser");
const logger_1 = require("../utils/logger");
const start_1 = require("./start");
const purge_1 = require("./purge");
async function runCompose(argv) {
    const sub = argv[0];
    const compose = (0, parser_1.readCompose)();
    if (!compose) {
        logger_1.logger.error('No funesterie.yml found');
        return;
    }
    if (sub === 'up') {
        // simple: call start for each module with path override
        const modules = Object.keys(compose.modules);
        for (const m of modules) {
            const def = compose.modules[m];
            logger_1.logger.info(`Bringing up ${m} from ${def.path || 'package'}`);
            // delegate to start with service and path
            await (0, start_1.runStart)({ services: [m], modulePaths: { [m]: def.path }, flags: {} });
        }
        return;
    }
    if (sub === 'down') {
        logger_1.logger.info('Bringing down all modules');
        await (0, purge_1.runPurge)();
        return;
    }
    if (sub === 'logs') {
        const name = argv[1];
        // print tail of log
        const p = compose.modules[name]?.path || null;
        if (!p)
            logger_1.logger.info('Specify module name');
        else
            logger_1.logger.info(`Logs at ${p}/logs`);
        return;
    }
    logger_1.logger.info('Usage: qflash compose [up|down|logs|restart]');
}
