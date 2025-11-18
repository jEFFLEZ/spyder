import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const TRIAL_DAYS = 14;

function isTrialExpired(context: vscode.ExtensionContext): boolean {
  const started = context.globalState.get<number>('qflash.trialStarted');
  if (!started) return false; // start on first use
  const now = Date.now();
  return now - started > TRIAL_DAYS * 24 * 3600 * 1000;
}

function ensureTrialStarted(context: vscode.ExtensionContext) {
  const started = context.globalState.get<number>('qflash.trialStarted');
  if (!started) context.globalState.update('qflash.trialStarted', Date.now());
}

export function activate(context: vscode.ExtensionContext) {
  ensureTrialStarted(context);

  const openDisposable = vscode.commands.registerCommand('qflash.openPanel', () => {
    if (isTrialExpired(context)) {
      vscode.window.showInformationMessage('QFlash trial expired. Click to purchase a license.', 'Purchase', 'Enter Key').then((v) => {
        if (v === 'Purchase') vscode.env.openExternal(vscode.Uri.parse('https://gumroad.com/l/your-product'));
        if (v === 'Enter Key') vscode.commands.executeCommand('qflash.enterLicense');
      });
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'qflashPanel',
      'QFlash',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))],
      }
    );

    const htmlPath = path.join(context.extensionPath, 'src', 'panel.html');
    let html = '';
    try {
      html = fs.readFileSync(htmlPath, 'utf8');
    } catch (e) {
      html = `<html><body><pre>panel.html not found at ${htmlPath}</pre></body></html>`;
    }

    panel.webview.html = html;

    const cfg = vscode.workspace.getConfiguration('qflash');
    const daemonUrl = cfg.get<string>('daemonUrl') || 'http://localhost:4500';
    const token = cfg.get<string>('adminToken') || '';

    // Send config to webview securely via postMessage
    panel.webview.postMessage({ type: 'config', daemonUrl, token });

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message && message.type === 'saveConfig') {
          const cfg = vscode.workspace.getConfiguration('qflash');
          await cfg.update('daemonUrl', message.daemonUrl, vscode.ConfigurationTarget.Global);
          await cfg.update('adminToken', message.token, vscode.ConfigurationTarget.Global);
          panel.webview.postMessage({ type: 'saved', info: 'Configuration saved' });
        }
      },
      undefined,
      context.subscriptions
    );
  });

  const enterLicense = vscode.commands.registerCommand('qflash.enterLicense', async () => {
    const key = await vscode.window.showInputBox({ prompt: 'Enter your QFlash license key' });
    if (!key) return;
    // Placeholder: call CLI or backend to verify key and save locally
    // Example: call `qflash license activate <key>` if CLI exposes it
    vscode.window.showInformationMessage('License received. Activation must be performed via the qflash daemon.');
  });

  context.subscriptions.push(openDisposable, enterLicense);
}

export function deactivate() {}
