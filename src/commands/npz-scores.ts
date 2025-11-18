import engine from '../utils/npz-engine';

export async function runNpzScores() {
  const store = engine.getStore();
  const items = Object.values(store).map((r) => ({ laneId: r.laneId, score: r.score, lastSuccess: r.lastSuccess, lastFailure: r.lastFailure }));
  // sort by score asc
  items.sort((a, b) => (a.score as number) - (b.score as number));
  console.log(JSON.stringify(items, null, 2));
  return 0;
}

export default runNpzScores;
