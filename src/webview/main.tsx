import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { SchemaFileSelector } from './components/SchemaFileSelector';
import { parseSchema } from './utils/schemaParser';
import { PrismaSchema, PrismaModel } from './types/schema';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { SchemaVisualizerTab } from './components/tabs/SchemaVisualizerTab';
import { CodeGeneratorTab } from './components/tabs/CodeGeneratorTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { Toaster } from './components/ui/toaster';

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

interface SchemaFile {
  content: string;
  path: string;
}

const vscode = window.acquireVsCodeApi();

// 状態の永続化のための型定義
interface State {
  schemaFile: SchemaFile | null;
  parsedSchema: PrismaSchema | null;
}

function App() {
  // 初期状態の取得
  const initialState = (() => {
    try {
      return vscode.getState() as State;
    } catch (e) {
      return { schemaFile: null, parsedSchema: null };
    }
  })();

  const [isLoading, setIsLoading] = useState(false);
  const [schemaFile, setSchemaFile] = useState<SchemaFile | null>(initialState?.schemaFile || null);
  const [parsedSchema, setParsedSchema] = useState<PrismaSchema | null>(initialState?.parsedSchema || null);
  const [error, setError] = useState<string | null>(null);

  // 状態が変更されたときに保存
  useEffect(() => {
    vscode.setState({ schemaFile, parsedSchema });
  }, [schemaFile, parsedSchema]);

  const handleFileSelect = () => {
    console.log('Sending selectSchemaFile message to VSCode');
    setIsLoading(true);
    vscode.postMessage({
      type: 'selectSchemaFile'
    });
  };

  const handleGenerateCRUD = (config: {
    model: PrismaModel;
    operation: 'create' | 'read' | 'update' | 'delete';
    selectedFields: string[];
    conditions: any;
  }) => {
    if (schemaFile) {
      vscode.postMessage({
        type: 'generateCRUD',
        schema: schemaFile.content,
        config
      });
    } else {
      console.warn('スキーマファイルが読み込まれていません。');
    }
  };

  // メッセージハンドラーを設定
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('Received message from VSCode:', message);
      
      switch (message.type) {
        case 'schemaFileSelected':
          console.log('Schema file selected:', message.path);
          setIsLoading(false);
          setError(null);
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
            setError('スキーマの解析に失敗しました。');
          }
          break;
        case 'generateCRUDSuccess':
          setError(null);
          // 成功メッセージを表示
          setError(message.message);
          // 生成されたコードをCodeGeneratorTabに渡す
          if (message.code) {
            // イベントを発行してCodeGeneratorTabに通知
            const event = new CustomEvent('codeGenerated', {
              detail: { code: message.code }
            });
            window.dispatchEvent(event);
          }
          break;
        case 'error':
          console.error('Error from VSCode:', message.message);
          setIsLoading(false);
          setError(message.message);
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
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}
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
              }}
            >
              別のファイルを選択
            </button>
          </div>

          {parsedSchema && (
            <Tabs defaultValue="visualizer">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="visualizer">
                  スキーマ可視化
                </TabsTrigger>
                <TabsTrigger value="generator">
                  コード生成
                </TabsTrigger>
                <TabsTrigger value="settings">
                  設定
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visualizer">
                <SchemaVisualizerTab schema={parsedSchema} />
              </TabsContent>

              <TabsContent value="generator">
                <CodeGeneratorTab
                  schema={parsedSchema}
                  onGenerate={handleGenerateCRUD}
                />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
      <Toaster />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 