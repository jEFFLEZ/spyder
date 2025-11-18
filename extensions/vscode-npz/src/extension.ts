import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand('npz.openScores', async () => {
    const panel = vscode.window.createWebviewPanel('npzScores', 'NPZ Scores', vscode.ViewColumn.One, {});
    panel.webview.html = `<html><body><h3>NPZ Scores</h3><div id="content">Loading...</div><button id="refresh">Refresh</button><button id="reset">Reset Scores</button><script>
      const vscodeApi = acquireVsCodeApi();
      async function load(){
        const res = await fetch('http://localhost:4500/npz/scores?token=changeme');
        const data = await res.json();
        document.getElementById('content').innerText = JSON.stringify(data, null, 2);
      }
      document.getElementById('refresh').addEventListener('click', load);
      document.getElementById('reset').addEventListener('click', async ()=>{ await fetch('http://localhost:4500/npz/scores/reset?token=changeme', { method: 'POST' }); load(); });
      load();
    </script></body></html>`;
  });
  context.subscriptions.push(cmd);
}

export function deactivate() {}
