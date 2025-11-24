import * as net from 'net';
import { encodePacket, decodePacket } from './protocol/packet';
import { SpyderMemory } from './memory/memory';
import { sendToA11 as defaultSendToA11 } from './teacher/bridge';

export type SpyderOptions = {
  port?: number;
  host?: string;
  sendToA11?: (payload: Uint8Array) => Promise<Uint8Array>;
};

export class SpyderServer {
  private server: net.Server | null = null;
  public memory: SpyderMemory;
  private opts: Required<SpyderOptions>;

  constructor(options: SpyderOptions = {}) {
    this.opts = {
      port: options.port ?? 4000,
      host: options.host ?? '127.0.0.1',
      sendToA11: options.sendToA11 ?? defaultSendToA11,
    };
    this.memory = new SpyderMemory();
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) return reject(new Error('Server already started'));

      this.server = net.createServer((socket: any) => {
        socket.on('data', async (data: any) => {
          try {
            const buf = Uint8Array.from(data);
            const pkt = decodePacket(buf);
            if (!pkt) return;
            const valid = pkt.checksum !== 0;
            const score = valid ? 2 : 0;
            this.memory.add({ bits: pkt.payload, type: pkt.type, valid, score });
            if (pkt.type === 1) {
              const resp = await this.opts.sendToA11(pkt.payload);
              const out = encodePacket(2 as any, resp);
              const sendBuf = Buffer.from(out);
              socket.write(sendBuf);
              this.memory.add({ bits: resp, type: 2, valid: resp.length > 0, score: resp.length > 0 ? 2 : 0 });
            }
          } catch (e) {
            // ignore errors in MVP
          }
        });
        socket.on('close', () => {});
      });

      this.server.on('error', (err) => reject(err));

      this.server.listen(this.opts.port, this.opts.host, () => resolve());
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) return resolve();
      this.server.close((err) => {
        this.server = null;
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

export function createSpyderServer(opts?: SpyderOptions) {
  return new SpyderServer(opts);
}

// CLI: start server if executed directly
if (require.main === module) {
  const server = new SpyderServer();
  server.start().then(() => {
    console.log(`SPYDER listening on ${server['opts']?.port || 4000}`);
  }).catch((err) => {
    console.error('Failed to start SPYDER server', err);
    process.exit(1);
  });
}
