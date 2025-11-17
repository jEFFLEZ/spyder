"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFCL = readFCL;
const fs_1 = __importDefault(require("fs"));
function parseValue(raw) {
    const v = raw.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
        // simple list parser
        const inside = v.slice(1, -1).trim();
        if (!inside)
            return [];
        return inside.split(',').map(x => x.trim().replace(/^"|"$/g, ''));
    }
    if (/^\d+$/.test(v))
        return Number(v);
    return v.replace(/^"|"$/g, '');
}
function readFCL(file = 'funesterie.fcl') {
    try {
        const raw = fs_1.default.readFileSync(file, 'utf8');
        const lines = raw.split(/\r?\n/);
        const out = { project: {}, env: {}, service: {}, pipeline: {} };
        let current = {};
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#') || line.startsWith('//'))
                continue;
            if (line.startsWith('@')) {
                const parts = line.split(/	|\s+/).filter(Boolean);
                const sec = parts[0].slice(1);
                const name = parts[1] || undefined;
                current = { section: sec, name };
                if (name) {
                    if (!out[sec])
                        out[sec] = {};
                    out[sec][name] = out[sec][name] || {};
                }
                continue;
            }
            const eq = line.indexOf('=');
            if (eq === -1)
                continue;
            const key = line.slice(0, eq).trim();
            const val = parseValue(line.slice(eq + 1));
            if (current.section) {
                if (current.name) {
                    out[current.section][current.name][key] = val;
                }
                else {
                    out[current.section][key] = val;
                }
            }
        }
        return out;
    }
    catch (err) {
        return null;
    }
}
