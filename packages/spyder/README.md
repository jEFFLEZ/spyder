SPYDER Core - local copy in D:/spyder

Run:
cd D:/spyder
npm install
npm run start

This is the description of what the code block changes:
Add expanded documentation and usage examples

This is the code block that represents the suggested code change:

````````markdown
SPYDER — local assistant components

Résumé

`@funeste38/spyder` fournit des composants réutilisables pour construire un serveur SPYDER léger :
- `SpyderServer` : serveur TCP extensible pour recevoir des paquets, stocker en mémoire et relayer à un service A-11.
- Mémoire en RAM simple et utilitaires pour encoder/décoder les paquets.

Principales fonctionnalités

- API programmatique (classe `SpyderServer`) pour intégrer SPYDER dans n'importe quel projet Node.js.
- Comportement CLI minimal quand exécuté directement (démarrage du serveur).
- Packagé comme module indépendant (pas de dépendance à qflush).

Installation

- Depuis npm (publier manuellement si nécessaire) :
  npm install @funeste38/spyder

- Localement depuis un tarball :
  npm install /path/to/funeste38-spyder-1.0.0.tgz

Quickstart (programmatique)

```ts
import { createSpyderServer } from '@funeste38/spyder';

const server = createSpyderServer({ port: 4500, sendToA11: async (payload) => { /* your bridge */ return new Uint8Array(); } });
await server.start();
// ...
await server.stop();
```

CLI

Le package peut être exécuté directement (démarre le serveur par défaut sur 127.0.0.1:4000):

node dist/index.js

Documentation

Voir `USAGE.md` et `API.md` pour les exemples détaillés et la référence.

Licence

MIT — voir `package.json`.
