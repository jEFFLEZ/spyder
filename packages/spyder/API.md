API — @funeste38/spyder

Exported types and functions

- `SpyderOptions`
  - `port?: number` (default 4000)
  - `host?: string` (default '127.0.0.1')
  - `sendToA11?: (payload: Uint8Array) => Promise<Uint8Array>`

- `class SpyderServer`
  - `constructor(options?: SpyderOptions)`
  - `start(): Promise<void>` — starts the TCP server
  - `stop(): Promise<void>` — stops the TCP server
  - `memory: SpyderMemory` — in-memory store of messages

- `function createSpyderServer(opts?: SpyderOptions): SpyderServer`

Memory types

- `SpyderMessage` — { id: string; bits: Uint8Array; type: number; valid: boolean; score: number; timestamp: number }
- `SpyderMemory` — has `ram: SpyderMessage[]`, `cache: SpyderMessage[]`, `dead: SpyderMessage[][]`, and `add()`/`snapshot()` helpers.

Notes

- `SpyderServer` does not include authentication or rate-limiting. Add wrappers if exposing on public networks.
- Designed to be lightweight and embeddable.
