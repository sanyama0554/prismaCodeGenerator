// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "prisma-code-generator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('prisma-code-generator.openWebView', () => {
		const panel = vscode.window.createWebviewPanel(
			'prismaCodeGenerator',
			'Prisma Code Generator',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(context.extensionPath, 'out'))
				]
			}
		);

		// Find the built asset files
		const assetsDir = path.join(context.extensionPath, 'out', 'webview', 'assets');
		const files = fs.readdirSync(assetsDir);
		const jsFile = files.find(file => file.endsWith('.js'));
		const cssFile = files.find(file => file.endsWith('.css'));

		// Convert the asset paths to webview URIs
		const getAssetUri = (fileName: string) => {
			return panel.webview.asWebviewUri(
				vscode.Uri.file(path.join(context.extensionPath, 'out', 'webview', 'assets', fileName))
			);
		};

		const scriptUri = jsFile ? getAssetUri(jsFile) : '';
		const styleUri = cssFile ? getAssetUri(cssFile) : '';

		panel.webview.html = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; script-src ${panel.webview.cspSource};">
				<title>Prisma Code Generator</title>
				${cssFile ? `<link href="${styleUri}" rel="stylesheet">` : ''}
			</head>
			<body>
				<div id="root"></div>
				${jsFile ? `<script type="module" src="${scriptUri}"></script>` : ''}
			</body>
			</html>`;
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
