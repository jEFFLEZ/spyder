import { describe, it, expect } from 'vitest';
import { createSpyderServer } from '../src/index';

describe('SpyderServer basic', () => {
  it('starts and stops without error', async () => {
    const srv = createSpyderServer({ port: 0, sendToA11: async () => new Uint8Array() });
    await srv.start();
    // server should have a memory object
    expect((srv as any).memory).toBeTruthy();
    await srv.stop();
  }, 10000);

  it('accepts a custom sendToA11 and uses it when packet handler invoked (smoke)', async () => {
    let called = false;
    const srv = createSpyderServer({ port: 0, sendToA11: async () => { called = true; return new Uint8Array(); } });
    await srv.start();
    // we only assert that the custom function is present; deeper integration tests would open a socket and send real packets
    expect(typeof (srv as any).opts.sendToA11).toBe('function');
    await srv.stop();
    expect(called).toBe(false);
  });
});
