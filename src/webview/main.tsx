import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SchemaFileSelector } from './components/SchemaFileSelector';
import { ModelGrid } from './components/ModelGrid';
import { parseSchema } from './utils/schemaParser';
import { PrismaSchema } from './types/schema';

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
  const [parsedSchema, setParsedSchema] = useState<PrismaSchema | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const handleFileSelect = () => {
    console.log('Sending selectSchemaFile message to VSCode');
    setIsLoading(true);
    vscode.postMessage({
      type: 'selectSchemaFile'
    });
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        return prev.filter(name => name !== modelName);
      } else {
        return [...prev, modelName];
      }
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
          // スキーマを解析
          try {
            const schema = parseSchema(message.content);
            setParsedSchema(schema);
          } catch (error) {
            console.error('Failed to parse schema:', error);
            // TODO: エラー表示
          }
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">スキーマファイル: {schemaFile.path}</h2>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => {
                setSchemaFile(null);
                setParsedSchema(null);
                setSelectedModels([]);
              }}
            >
              別のファイルを選択
            </button>
          </div>
          {parsedSchema && (
            <ModelGrid
              schema={parsedSchema}
              selectedModels={selectedModels}
              onModelSelect={handleModelSelect}
            />
          )}
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