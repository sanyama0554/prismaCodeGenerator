import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  Title, 
  Text, 
  Button, 
  Group, 
  Stack, 
  useMantineTheme, 
  Paper, 
  CopyButton, 
  Tooltip, 
  ScrollArea,
  SegmentedControl,
  Tabs,
  Divider,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { 
  IconCheck, 
  IconCopy, 
  IconCode, 
  IconBrandTypescript,
  IconBrandPrisma,
  IconDatabase,
  IconRefresh,
  IconDownload,
  IconClipboardCopy,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { PrismaSchema, PrismaModel } from '../../types/schema';
import { CodeGeneratorPanel } from '../CodeGeneratorPanel';
import { CodeHighlight } from '@mantine/code-highlight';
import '@mantine/code-highlight/styles.css';

interface CodeGeneratorTabProps {
  schema: PrismaSchema;
  onGenerate: (config: {
    model: PrismaModel;
    operation: 'create' | 'read' | 'update' | 'delete';
    selectedFields: string[];
    conditions: any;
  }) => void;
}

type CodeType = 'prisma' | 'typescript' | 'sql';

export function CodeGeneratorTab({ schema, onGenerate }: CodeGeneratorTabProps) {
  const theme = useMantineTheme();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<CodeType>('prisma');
  const [activeTab, setActiveTab] = useState<string>('query');

  // コード生成イベントのリスナーを設定
  useEffect(() => {
    const handleCodeGenerated = (event: CustomEvent<{ code: string }>) => {
      console.log('Received generated code:', event.detail.code);
      setGeneratedCode(event.detail.code);
    };

    window.addEventListener('codeGenerated', handleCodeGenerated as EventListener);
    return () => {
      window.removeEventListener('codeGenerated', handleCodeGenerated as EventListener);
    };
  }, []);

  const handleGenerate = (config: {
    model: PrismaModel;
    operation: 'create' | 'read' | 'update' | 'delete';
    selectedFields: string[];
    conditions: any;
  }) => {
    onGenerate(config);
  };

  const handleCopySuccess = () => {
    notifications.show({
      title: 'コピー完了',
      message: 'コードをクリップボードにコピーしました',
      color: 'green',
    });
  };

  const getCodeTypeIcon = (type: CodeType) => {
    switch (type) {
      case 'prisma':
        return <IconBrandPrisma size={16} />;
      case 'typescript':
        return <IconBrandTypescript size={16} />;
      case 'sql':
        return <IconDatabase size={16} />;
      default:
        return <IconCode size={16} />;
    }
  };

  return (
    <Container size="xl" py="md">
      <Grid gutter="md">
        <Grid.Col span={6}>
          <Card 
            shadow="sm" 
            p="lg" 
            radius="md" 
            withBorder
            style={{
              transition: theme.other.transition.default,
              borderColor: theme.colors.gray[3],
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Title order={4}>クエリ生成</Title>
                <Text size="sm" c="dimmed">
                  必要な情報を入力してください
                </Text>
              </Group>

              <CodeGeneratorPanel
                schema={schema}
                onGenerate={handleGenerate}
              />
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card 
            shadow="sm" 
            p="lg" 
            radius="md" 
            withBorder
            style={{
              transition: theme.other.transition.default,
              borderColor: theme.colors.gray[3],
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Title order={4}>生成されたコード</Title>
                  {generatedCode && (
                    <Badge 
                      color="blue" 
                      variant="light"
                      size="sm"
                      leftSection={getCodeTypeIcon(codeType)}
                    >
                      {codeType.toUpperCase()}
                    </Badge>
                  )}
                </Group>
                {generatedCode && (
                  <Group gap="xs">
                    <Tooltip label="コードを再生成">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => handleGenerate}
                      >
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <CopyButton 
                      value={generatedCode}
                    >
                      {({ copied, copy }) => {
                        if (copied) handleCopySuccess();
                        return (
                          <Tooltip label={copied ? 'コピーしました' : 'クリックでコピー'}>
                            <Button
                              variant="light"
                              size="sm"
                              leftSection={copied ? <IconCheck size={16} /> : <IconClipboardCopy size={16} />}
                              onClick={copy}
                              style={{ transition: theme.other.transition.default }}
                            >
                              {copied ? 'コピー完了' : 'コピー'}
                            </Button>
                          </Tooltip>
                        );
                      }}
                    </CopyButton>
                    <Tooltip label="コードをファイルに保存">
                      <Button
                        variant="light"
                        size="sm"
                        leftSection={<IconDownload size={16} />}
                        onClick={() => {
                          // TODO: ファイル保存の実装
                        }}
                      >
                        保存
                      </Button>
                    </Tooltip>
                  </Group>
                )}
              </Group>

              <Divider />

              <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
                <Tabs.List>
                  <Tabs.Tab value="query">クエリ</Tabs.Tab>
                  <Tabs.Tab value="types">型定義</Tabs.Tab>
                  <Tabs.Tab value="validation">バリデーション</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="query">
                  <Stack gap="md">
                    <SegmentedControl
                      value={codeType}
                      onChange={(value) => setCodeType(value as CodeType)}
                      data={[
                        {
                          value: 'prisma',
                          label: (
                            <Group gap="xs">
                              <IconBrandPrisma size={16} />
                              <Text size="sm">Prisma</Text>
                            </Group>
                          ),
                        },
                        {
                          value: 'typescript',
                          label: (
                            <Group gap="xs">
                              <IconBrandTypescript size={16} />
                              <Text size="sm">TypeScript</Text>
                            </Group>
                          ),
                        },
                        {
                          value: 'sql',
                          label: (
                            <Group gap="xs">
                              <IconDatabase size={16} />
                              <Text size="sm">SQL</Text>
                            </Group>
                          ),
                        },
                      ]}
                    />

                    <Paper 
                      withBorder 
                      p="md" 
                      style={{
                        backgroundColor: theme.colors.gray[0],
                        borderColor: theme.colors.gray[3],
                        transition: theme.other.transition.default,
                      }}
                    >
                      <ScrollArea h={400}>
                        {generatedCode ? (
                          <CodeHighlight
                            code={generatedCode}
                            language={codeType === 'sql' ? 'sql' : 'typescript'}
                            copyLabel="コードをコピー"
                            copiedLabel="コピーしました"
                            withCopyButton
                          />
                        ) : (
                          <Group 
                            justify="center" 
                            align="center" 
                            style={{ height: '100%' }}
                          >
                            <Stack align="center" gap="xs">
                              <IconCode size={32} color={theme.colors.gray[5]} />
                              <Text size="sm" c="dimmed">
                                クエリを生成するとここにコードが表示されます
                              </Text>
                            </Stack>
                          </Group>
                        )}
                      </ScrollArea>
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="types">
                  <Paper 
                    withBorder 
                    p="md" 
                    style={{
                      backgroundColor: theme.colors.gray[0],
                      borderColor: theme.colors.gray[3],
                      transition: theme.other.transition.default,
                    }}
                  >
                    <ScrollArea h={400}>
                      {generatedCode ? (
                        <CodeHighlight
                          code={`// 生成された型定義
interface UserWhereInput {
  AND?: UserWhereInput[];
  OR?: UserWhereInput[];
  id?: number;
  email?: string;
  name?: string;
}`}
                          language="typescript"
                          copyLabel="コードをコピー"
                          copiedLabel="コピーしました"
                          withCopyButton
                        />
                      ) : (
                        <Group 
                          justify="center" 
                          align="center" 
                          style={{ height: '100%' }}
                        >
                          <Stack align="center" gap="xs">
                            <IconBrandTypescript size={32} color={theme.colors.gray[5]} />
                            <Text size="sm" c="dimmed">
                              クエリを生成すると型定義が表示されます
                            </Text>
                          </Stack>
                        </Group>
                      )}
                    </ScrollArea>
                  </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="validation">
                  <Paper 
                    withBorder 
                    p="md" 
                    style={{
                      backgroundColor: theme.colors.gray[0],
                      borderColor: theme.colors.gray[3],
                      transition: theme.other.transition.default,
                    }}
                  >
                    <ScrollArea h={400}>
                      {generatedCode ? (
                        <CodeHighlight
                          code={`// 生成されたバリデーションスキーマ
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(120),
});`}
                          language="typescript"
                          copyLabel="コードをコピー"
                          copiedLabel="コピーしました"
                          withCopyButton
                        />
                      ) : (
                        <Group 
                          justify="center" 
                          align="center" 
                          style={{ height: '100%' }}
                        >
                          <Stack align="center" gap="xs">
                            <IconCode size={32} color={theme.colors.gray[5]} />
                            <Text size="sm" c="dimmed">
                              クエリを生成するとバリデーションコードが表示されます
                            </Text>
                          </Stack>
                        </Group>
                      )}
                    </ScrollArea>
                  </Paper>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 