// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { generatePrismaClientCode } from './codeGenerator/prismaCodeGenerator';
import { parseSchema } from './webview/utils/schemaParser';
import { generatePrismaQuery } from './codeGenerator/prismaQueryGenerator';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Prisma Code Generator is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('prisma-code-generator.openWebView', () => {
		// WebViewパネルを作成
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

		// アセットの設定
		const getAssetUri = (fileName: string) => {
			return panel.webview.asWebviewUri(
				vscode.Uri.file(path.join(context.extensionPath, 'out', 'webview', 'assets', fileName))
			);
		};

		// ビルドされたアセットファイルを検索
		const assetsDir = path.join(context.extensionPath, 'out', 'webview', 'assets');
		const files = fs.readdirSync(assetsDir);
		const jsFile = files.find(file => file.endsWith('.js'));
		const cssFile = files.find(file => file.endsWith('.css'));

		// WebViewのHTMLを設定
		panel.webview.html = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; script-src ${panel.webview.cspSource};">
				<title>Prisma Code Generator</title>
				${cssFile ? `<link href="${getAssetUri(cssFile)}" rel="stylesheet">` : ''}
			</head>
			<body>
				<div id="root"></div>
				${jsFile ? `<script type="module" src="${getAssetUri(jsFile)}"></script>` : ''}
			</body>
			</html>`;

		// メッセージハンドラーを設定
		panel.webview.onDidReceiveMessage(
			async message => {
				console.log('Received message from WebView:', message);
				
				switch (message.type) {
					case 'selectSchemaFile':
						try {
							console.log('Searching for schema.prisma files...');
							// ワークスペース内のschema.prismaファイルを検索
							const files = await vscode.workspace.findFiles('**/schema.prisma', '**/node_modules/**');
							console.log('Found schema files:', files);
							
							let schemaUri: vscode.Uri | undefined;
							
							if (files.length === 0) {
								console.log('No schema files found, showing file picker...');
								// ファイルが見つからない場合、ユーザーに選択を促す
								const result = await vscode.window.showOpenDialog({
									canSelectFiles: true,
									canSelectFolders: false,
									canSelectMany: false,
									filters: {
										'Prisma Schema': ['prisma']
									},
									title: 'Select schema.prisma file'
								});
								
								if (result && result.length > 0) {
									schemaUri = result[0];
									console.log('User selected file:', schemaUri.fsPath);
								}
							} else if (files.length === 1) {
								schemaUri = files[0];
								console.log('Single schema file found:', schemaUri.fsPath);
							} else {
								console.log('Multiple schema files found, showing quick pick...');
								// 複数のファイルが見つかった場合、ユーザーに選択を促す
								const items = files.map(file => ({
									label: vscode.workspace.asRelativePath(file),
									uri: file
								}));
								
								const selected = await vscode.window.showQuickPick(items, {
									placeHolder: 'Select schema.prisma file'
								});
								
								if (selected) {
									schemaUri = selected.uri;
									console.log('User selected file from quick pick:', schemaUri.fsPath);
								}
							}
							
							if (schemaUri) {
								console.log('Reading file content...');
								const content = await vscode.workspace.fs.readFile(schemaUri);
								console.log('Sending file content to WebView...');
								panel.webview.postMessage({
									type: 'schemaFileSelected',
									content: content.toString(),
									path: schemaUri.fsPath
								});
							} else {
								console.log('No file was selected');
								panel.webview.postMessage({
									type: 'error',
									message: 'No file was selected'
								});
							}
						} catch (error) {
							console.error('Error handling schema file selection:', error);
							panel.webview.postMessage({
								type: 'error',
								message: 'Failed to read schema file'
							});
						}
						break;
					case 'generateCRUD':
						try {
							console.log('Executing CRUD code generation...');
							const { schema, config } = message;
							
							// コード生成
							const generatedCode = generatePrismaQuery(config);
							
							// 生成したコードをWebViewに返すのみ
							panel.webview.postMessage({
								type: 'generateCRUDSuccess',
								message: '生成が完了しました',
								code: generatedCode
							});

							console.log('CRUD code generation completed.');
						} catch (error) {
							console.error('Error during CRUD generation:', error);
							panel.webview.postMessage({
								type: 'error',
								message: 'コード生成に失敗しました。'
							});
						}
						break;
					case 'error':
						console.error('Error from WebView:', message.message);
						panel.webview.postMessage({
							type: 'error',
							message: message.message
						});
						break;
					default:
						console.log('Unknown message type:', message.type);
				}
			},
			undefined,
			context.subscriptions
		);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
