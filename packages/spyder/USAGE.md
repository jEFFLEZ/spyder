USAGE — @funeste38/spyder

1) Installation

- Via npm (après publication):
  npm install @funeste38/spyder

- Local (tarball):
  npm install /path/to/funeste38-spyder-1.0.0.tgz

2) Programmatic usage

- Basic server:

```ts
import { createSpyderServer } from '@funeste38/spyder';

(async () => {
  const server = createSpyderServer({ port: 4500, sendToA11: async (payload) => {
    // forward to your A-11 service and return a Uint8Array response
    return new Uint8Array([0]);
  }});

  await server.start();
  console.log('Spyder started');

  // stop after 10s for demo
  setTimeout(async () => { await server.stop(); console.log('Spyder stopped'); }, 10000);
})();
```

3) CLI

- Build then run:
  npm run build
  node dist/index.js

4) Memory model

- `SpyderMemory` keeps `ram`, `cache`, `dead` snapshots. Use `server.memory` to access stored messages.

5) Extending

- Provide a custom `sendToA11` to integrate with your LLM/service.
- You can integrate plugins by wrapping the server in your own code and calling `memory.add(...)` as needed.
