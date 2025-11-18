import * as fs from 'fs';
import * as path from 'path';
import { RomeIndex } from './rome-tag';

const INDEX_PATH = path.join(process.cwd(), '.qflush', 'rome-index.json');
let cachedIndex: RomeIndex = {};

export function loadRomeIndexFromDisk(): RomeIndex {
  try {
    if (!fs.existsSync(INDEX_PATH)) { cachedIndex = {}; return cachedIndex; }
    const raw = fs.readFileSync(INDEX_PATH, 'utf8') || '{}';
    cachedIndex = JSON.parse(raw) as RomeIndex;
    return cachedIndex;
  } catch (e) {
    // on error return empty
    cachedIndex = {};
    return cachedIndex;
  }
}

export function getCachedRomeIndex(): RomeIndex {
  return cachedIndex;
}

export function startRomeIndexAutoRefresh(intervalMs = 30 * 1000) {
  // initial load
  loadRomeIndexFromDisk();
  try {
    setInterval(() => {
      loadRomeIndexFromDisk();
    }, intervalMs).unref();
  } catch (e) {
    // ignore
  }
}
