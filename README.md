# qflush — Aperçu et guide développeur

Résumé rapide

Architecture (big picture)
  - `src/daemon/qflushd.ts` : serveur HTTP (endpoints admin & NPZ).
  - `src/rome/*` : moteur d'indexation, linker et logique ( règles, exécution d'actions ).
  - `src/commands/*` : implémentation des commandes CLI exposées dans `package.json`.
  - `src/utils/*` : helpers (redis, secrets, fetch, hmac, etc.).


Convention de build / piège courant

Commandes utiles

Comportements runtime & variables d'environnement importants

SPYDER admin port

Points d'intégration et tests

Où regarder en priorité

Proposition pour la suite
  1) Nettoie le repo pour retirer `dist/` du commit (si vous préférez éviter d'avoir des artefacts de build dans la PR),
  2) Ajoute des extraits d'exemples d'API pour `/npz/*` dans `docs/quick-start.md`,
  3) Ou merge la PR maintenant et continuer l'amélioration de la documentation ?

Pour feedback ou détails supplémentaires, dites-moi quelle partie vous voulez développer en priorité.
# QFLUSH — Funesterie Orchestrator ⚡

QFLUSH est l'orchestrateur local de la Funesterie : un CLI + daemon pour démarrer, arrêter, purger, inspecter et synchroniser des modules et flux de travail dans un workspace. Il fournit des endpoints NPZ pour checksum, index Rome et liens, des utilitaires de build et des scripts d'intégration.

Principales capacités

Pourquoi utiliser QFLUSH ?

Quickstart (rapide)
1) Copier l'exemple d'env :
   - PowerShell: `Copy-Item .env.example .env; notepad .env`
   - Bash: `cp .env.example .env && ${EDITOR:-nano} .env`
2) Installer et builder :
   `npm ci --no-audit --no-fund && npm run build`
3) Lancer les tests :
   `npm test`
4) Lancer le daemon en dev :
   `qflush daemon` (ou `qflush safe-run --detach daemon`)

Où aller ensuite

Si tu veux, je peux :

Exemples d'API (endpoints NPZ)


```bash
curl -X POST "http://localhost:4500/npz/checksum/store" \
   -H "Content-Type: application/json" \
   -d '{"id":"t1","checksum":"abc","ttlMs":60000}'
```


```bash
curl "http://localhost:4500/npz/checksum/list"
```


```bash
curl -X POST "http://localhost:4500/npz/checksum/verify" \
   -H "Content-Type: application/json" \
   -d '{"id":"t1","checksum":"abc"}'
```


```bash
curl -X DELETE "http://localhost:4500/npz/checksum/clear"
```


```bash
curl "http://localhost:4500/npz/rome-index"
```

Notes:

## Optional integration: A-11 (local AI service)

FR
qflush peut piloter un serveur IA local nommé "A-11" (ex: backend Node + Ollama). Cette intégration est entièrement optionnelle : si A-11 n'est pas installé ou activé, qflush l'ignore et continue d'orchestrer les autres services.

Exemple de configuration (dans `.qflush/a11.config.json`):

```json
{
  "enabled": true,
  "path": "D:/projects/a11",
  "startCommand": "pwsh -File start-a11-system.ps1",
  "healthUrl": "http://127.0.0.1:3000/health",
  "pidFile": ".qflush/a11.pid"
}
```

Commandes utiles:

Comportement:

EN
qflush can orchestrate an optional local AI service named "A-11" (for example a Node + Ollama backend). This integration is optional: if A-11 is not installed or enabled, qflush will ignore it and continue orchestrating other services.

Example configuration (put into `.qflush/a11.config.json`):

```json
{
  "enabled": true,
  "path": "D:/projects/a11",
  "startCommand": "pwsh -File start-a11-system.ps1",
  "healthUrl": "http://127.0.0.1:3000/health",
  "pidFile": ".qflush/a11.pid"
}
```

Useful commands:

Behavior notes:

