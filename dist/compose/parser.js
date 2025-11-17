"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCompose = readCompose;
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const fclParser_1 = require("./fclParser");
function readCompose(file = 'funesterie.yml') {
    try {
        if (fs_1.default.existsSync('funesterie.fcl')) {
            const fcl = (0, fclParser_1.readFCL)('funesterie.fcl');
            if (fcl && fcl.service) {
                const modules = {};
                for (const k of Object.keys(fcl.service)) {
                    const s = fcl.service[k];
                    modules[k] = { path: s.path, port: s.port, token: s.token, env: s.env };
                }
                return { modules };
            }
        }
        if (!fs_1.default.existsSync(file))
            return null;
        const raw = fs_1.default.readFileSync(file, 'utf8');
        const doc = js_yaml_1.default.load(raw);
        if (!doc || !doc.modules)
            return null;
        return { modules: doc.modules };
    }
    catch (err) {
        return null;
    }
}
