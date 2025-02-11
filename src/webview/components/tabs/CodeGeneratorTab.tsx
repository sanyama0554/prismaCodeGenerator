import React, { useState, useEffect } from 'react';
import { PrismaSchema, PrismaModel } from '../../types/schema';
import { CodeGeneratorPanel } from '../CodeGeneratorPanel';
import { Card, Text, Button, Grid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
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
        notifications.show({
          title: "コピー完了",
          message: "コードをクリップボードにコピーしました",
          color: "green",
        });
      } catch (err) {
        console.error('Failed to copy code:', err);
        notifications.show({
          title: "エラー",
          message: "コードのコピーに失敗しました",
          color: "red",
        });
      }
    }
  };

  return (
    <Grid gutter="md">
      <Grid.Col span={6}>
        <Card shadow="sm" p="md" radius="md" withBorder>
          <Card.Section inheritPadding py="xs">
            <Text size="lg" fw={500}>クエリ生成</Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <CodeGeneratorPanel
              schema={schema}
              onGenerate={handleGenerate}
            />
          </Card.Section>
        </Card>
      </Grid.Col>

      <Grid.Col span={6}>
        <Card shadow="sm" p="md" radius="md" withBorder>
          <Card.Section inheritPadding py="xs">
            <Text size="lg" fw={500}>生成されたコード</Text>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            {generatedCode && (
              <Button
                variant="light"
                size="sm"
                onClick={handleCopyCode}
              >
                コピー
              </Button>
            )}
          </Card.Section>
          <Card.Section inheritPadding py="md">
            {highlightedCode ? (
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                <code
                  className="text-sm language-typescript"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                クエリを生成するとここにコードが表示されます
              </Text>
            )}
          </Card.Section>
        </Card>
      </Grid.Col>
    </Grid>
  );
} 