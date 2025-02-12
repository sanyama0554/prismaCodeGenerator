import React, { useState } from 'react';
import { PrismaSchema, PrismaModel, Condition, Operator } from '../types/schema';
import { WhereCondition } from './WhereCondition';
import { Card, Title, Select, Button, Stack, Group, Checkbox, ScrollArea, rem, useMantineTheme } from '@mantine/core';

type OperationType = 'create' | 'read' | 'update' | 'delete';

interface CodeGeneratorPanelProps {
  schema: PrismaSchema;
  onGenerate: (config: {
    model: PrismaModel;
    operation: OperationType;
    selectedFields: string[];
    conditions: {
      AND?: Condition[];
      OR?: Condition[];
    };
  }) => void;
}

export function CodeGeneratorPanel({ schema, onGenerate }: CodeGeneratorPanelProps) {
  const theme = useMantineTheme();
  const [selectedModel, setSelectedModel] = useState<PrismaModel | null>(null);
  const [operation, setOperation] = useState<OperationType>('read');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [conditionType, setConditionType] = useState<'AND' | 'OR'>('AND');

  const handleAddCondition = () => {
    if (selectedModel) {
      setConditions([
        ...conditions,
        {
          field: selectedModel.fields[0].name,
          operator: 'equals',
          value: ''
        }
      ]);
    }
  };

  const handleConditionChange = (index: number, field: string, operator: Operator, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { field, operator, value };
    setConditions(newConditions);
  };

  const handleConditionDelete = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  return (
    <Card 
      shadow="sm" 
      radius="md" 
      p="lg" 
      withBorder
      style={{
        transition: theme.other.transition.default,
        borderColor: theme.colors.gray[3],
      }}
    >
      <Stack gap={rem(20)}>
        <Title order={3}>コード生成</Title>
        
        {/* モデル選択 */}
        <Stack gap={rem(8)}>
          <Title order={4} size="sm">モデルを選択</Title>
          <Select
            data={schema.models.map(model => ({
              value: model.name,
              label: model.name
            }))}
            value={selectedModel?.name || null}
            onChange={(value) => {
              const model = schema.models.find(m => m.name === value);
              setSelectedModel(model || null);
              setSelectedFields([]);
              setConditions([]);
            }}
            placeholder="選択してください"
            styles={{
              input: {
                transition: theme.other.transition.default,
                '&:focus': {
                  borderColor: theme.colors.blue[6],
                }
              }
            }}
          />
        </Stack>

        {/* 操作タイプの選択 */}
        {selectedModel && (
          <Stack gap={rem(8)}>
            <Title order={4} size="sm">操作タイプ</Title>
            <Group grow>
              <Button
                variant={operation === 'create' ? 'filled' : 'light'}
                onClick={() => setOperation('create')}
                styles={{
                  root: {
                    transition: theme.other.transition.default,
                  }
                }}
              >
                作成
              </Button>
              <Button
                variant={operation === 'read' ? 'filled' : 'light'}
                onClick={() => setOperation('read')}
                styles={{
                  root: {
                    transition: theme.other.transition.default,
                  }
                }}
              >
                取得
              </Button>
              <Button
                variant={operation === 'update' ? 'filled' : 'light'}
                onClick={() => setOperation('update')}
                styles={{
                  root: {
                    transition: theme.other.transition.default,
                  }
                }}
              >
                更新
              </Button>
              <Button
                variant={operation === 'delete' ? 'filled' : 'light'}
                onClick={() => setOperation('delete')}
                styles={{
                  root: {
                    transition: theme.other.transition.default,
                  }
                }}
              >
                削除
              </Button>
            </Group>
          </Stack>
        )}

        {/* フィールド選択 */}
        {selectedModel && (
          <Stack gap={rem(8)}>
            <Title order={4} size="sm">使用するフィールド</Title>
            <ScrollArea.Autosize mah={300}>
              <Stack gap={rem(8)}>
                {selectedModel.fields.map(field => (
                  <Checkbox
                    key={field.name}
                    label={
                      <Group gap="xs">
                        <span>{field.name}</span>
                        <span style={{ color: theme.colors.gray[6] }}>
                          ({field.type}{field.isList ? '[]' : ''}{field.isRequired ? '' : '?'})
                        </span>
                      </Group>
                    }
                    checked={selectedFields.includes(field.name)}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        setSelectedFields([...selectedFields, field.name]);
                      } else {
                        setSelectedFields(selectedFields.filter(f => f !== field.name));
                      }
                    }}
                    styles={{
                      input: {
                        transition: theme.other.transition.default,
                        '&:checked': {
                          backgroundColor: theme.colors.blue[6],
                          borderColor: theme.colors.blue[6],
                        }
                      }
                    }}
                  />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </Stack>
        )}

        {/* 検索条件 */}
        {selectedModel && (operation === 'read' || operation === 'update' || operation === 'delete') && (
          <Stack gap={rem(8)}>
            <Group justify="space-between" align="center">
              <Title order={4} size="sm">検索条件</Title>
              <Group>
                <Select
                  value={conditionType}
                  onChange={(value) => value && setConditionType(value as 'AND' | 'OR')}
                  data={[
                    { value: 'AND', label: 'AND' },
                    { value: 'OR', label: 'OR' }
                  ]}
                  size="xs"
                  styles={{
                    input: {
                      transition: theme.other.transition.default,
                      '&:focus': {
                        borderColor: theme.colors.blue[6],
                      }
                    }
                  }}
                />
                <Button
                  variant="light"
                  size="xs"
                  onClick={handleAddCondition}
                  styles={{
                    root: {
                      transition: theme.other.transition.default,
                    }
                  }}
                >
                  条件を追加
                </Button>
              </Group>
            </Group>
            <Stack gap={rem(8)}>
              {conditions.map((condition, index) => (
                <WhereCondition
                  key={index}
                  id={`condition-${index}`}
                  fields={selectedModel.fields}
                  field={condition.field}
                  operator={condition.operator}
                  value={condition.value}
                  onChange={(field, operator, value) => handleConditionChange(index, field, operator, value)}
                  onDelete={() => handleConditionDelete(index)}
                />
              ))}
              {conditions.length === 0 && (
                <Card 
                  withBorder 
                  p="sm"
                  style={{
                    borderColor: theme.colors.gray[3],
                    transition: theme.other.transition.default,
                  }}
                >
                  <Card.Section inheritPadding py="xs">
                    条件が設定されていません
                  </Card.Section>
                </Card>
              )}
            </Stack>
          </Stack>
        )}

        {/* 生成ボタン */}
        {selectedModel && selectedFields.length > 0 && (
          <Button
            onClick={() => onGenerate({
              model: selectedModel,
              operation,
              selectedFields,
              conditions: conditions.length > 0 ? {
                [conditionType]: conditions
              } : {}
            })}
            fullWidth
            size="lg"
            styles={{
              root: {
                transition: theme.other.transition.default,
              }
            }}
          >
            コードを生成
          </Button>
        )}
      </Stack>
    </Card>
  );
} 