import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SchemaFileSelector } from './components/SchemaFileSelector';

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: any) => void;
    };
  }
}

interface SchemaFile {
  content: string;
  path: string;
}

const vscode = window.acquireVsCodeApi();

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [schemaFile, setSchemaFile] = useState<SchemaFile | null>(null);

  const handleFileSelect = () => {
    console.log('Sending selectSchemaFile message to VSCode');
    setIsLoading(true);
    vscode.postMessage({
      type: 'selectSchemaFile'
    });
  };

  // メッセージハンドラーを設定
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('Received message from VSCode:', message);
      
      switch (message.type) {
        case 'schemaFileSelected':
          console.log('Schema file selected:', message.path);
          setIsLoading(false);
          setSchemaFile({
            content: message.content,
            path: message.path
          });
          break;
        case 'error':
          console.error('Error from VSCode:', message.message);
          setIsLoading(false);
          // TODO: エラー処理
          break;
        default:
          console.log('Unknown message type:', message.type);
          setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="container mx-auto p-4">
      {!schemaFile ? (
        <SchemaFileSelector onFileSelect={handleFileSelect} isLoading={isLoading} />
      ) : (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">選択されたスキーマファイル:</h2>
          <p className="text-sm text-muted-foreground mb-4">{schemaFile.path}</p>
          <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-[600px]">
            <code>{schemaFile.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 