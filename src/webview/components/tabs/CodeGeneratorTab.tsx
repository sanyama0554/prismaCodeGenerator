import React, { useState, useEffect } from 'react';
import { PrismaSchema, PrismaModel } from '../../types/schema';
import { CodeGeneratorPanel } from '../CodeGeneratorPanel';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

interface CodeGeneratorTabProps {
  schema: PrismaSchema;
  onGenerate: (config: {
    model: PrismaModel;
    operation: 'create' | 'read' | 'update' | 'delete';
    selectedFields: string[];
    conditions: any;
  }) => void;
}

export function CodeGeneratorTab({ schema, onGenerate }: CodeGeneratorTabProps) {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);

  // コード生成イベントのリスナーを設定
  useEffect(() => {
    const handleCodeGenerated = (event: CustomEvent<{ code: string }>) => {
      console.log('Received generated code:', event.detail.code);
      setGeneratedCode(event.detail.code);
    };

    // CustomEventのため、asを使用して型アサーションを行う
    window.addEventListener('codeGenerated', handleCodeGenerated as EventListener);
    return () => {
      window.removeEventListener('codeGenerated', handleCodeGenerated as EventListener);
    };
  }, []);

  // コードが更新されたらシンタックスハイライトを適用
  useEffect(() => {
    if (generatedCode) {
      const highlighted = Prism.highlight(
        generatedCode,
        Prism.languages.typescript,
        'typescript'
      );
      setHighlightedCode(highlighted);
    } else {
      setHighlightedCode(null);
    }
  }, [generatedCode]);

  const handleGenerate = (config: {
    model: PrismaModel;
    operation: 'create' | 'read' | 'update' | 'delete';
    selectedFields: string[];
    conditions: any;
  }) => {
    onGenerate(config);
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode);
        // TODO: コピー成功通知の表示
      } catch (err) {
        console.error('Failed to copy code:', err);
        // TODO: エラー通知の表示
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>クエリ生成</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeGeneratorPanel
              schema={schema}
              onGenerate={handleGenerate}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>生成されたコード</CardTitle>
            {generatedCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
              >
                コピー
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {highlightedCode ? (
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                <code
                  className="text-sm language-typescript"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                クエリを生成するとここにコードが表示されます
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 