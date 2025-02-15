import React, { useState } from 'react';
import { 
  PrismaSchema, 
  PrismaModel, 
  Condition, 
  Operator,
  SortOption,
  PaginationOption,
  RelationOption,
  AggregateOption
} from '../types/schema';
import { WhereCondition } from './WhereCondition';
import { 
  Card, 
  Title, 
  Select, 
  Button, 
  Stack, 
  Group, 
  Checkbox, 
  ScrollArea, 
  rem, 
  useMantineTheme, 
  NumberInput,
  TextInput,
  Divider,
  Collapse,
  Switch,
  ActionIcon,
  Tooltip,
  Badge,
  Text
} from '@mantine/core';
import { 
  IconPlus, 
  IconArrowsSort, 
  IconList, 
  IconLink,
  IconCalculator,
  IconChevronDown,
  IconChevronUp,
  IconMinus
} from '@tabler/icons-react';

type OperationType = 'create' | 'read' | 'update' | 'delete' | 'aggregate';

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
    sort?: SortOption[];
    pagination?: PaginationOption;
    relation?: RelationOption;
    aggregate?: AggregateOption;
  }) => void;
}

export function CodeGeneratorPanel({ schema, onGenerate }: CodeGeneratorPanelProps) {
  const theme = useMantineTheme();
  const [selectedModel, setSelectedModel] = useState<PrismaModel | null>(null);
  const [operation, setOperation] = useState<OperationType>('read');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [conditionType, setConditionType] = useState<'AND' | 'OR'>('AND');

  // 新しい状態
  const [sortOptions, setSortOptions] = useState<SortOption[]>([]);
  const [paginationOption, setPaginationOption] = useState<PaginationOption>({});
  const [relationOption, setRelationOption] = useState<RelationOption>({});
  const [aggregateOption, setAggregateOption] = useState<AggregateOption>({});
  
  // 各セクションの開閉状態
  const [openSections, setOpenSections] = useState({
    sort: false,
    pagination: false,
    relation: false,
    aggregate: false
  });

  const handleAddCondition = () => {
    if (!selectedModel?.fields?.length) return;
    
    const initialField = selectedModel.fields[0];
    if (!initialField?.name || !initialField?.type) return;
    
    const isNumericField = initialField.type === 'Int' || initialField.type === 'Float';
    setConditions([
      ...conditions,
      {
        field: initialField.name,
        operator: isNumericField ? 'equals' : 'contains',
        value: ''
      }
    ]);
  };

  const handleConditionChange = (index: number, field: string, operator: Operator, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { field, operator, value };
    setConditions(newConditions);
  };

  const handleConditionDelete = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  // ソートオプションの追加
  const handleAddSort = () => {
    if (!selectedModel) return;
    setSortOptions([...sortOptions, { field: selectedModel.fields[0].name, order: 'asc' }]);
  };

  // リレーションの深さ制限の設定
  const handleRelationDepthChange = (value: number | string) => {
    setRelationOption(prev => ({
      ...prev,
      maxDepth: typeof value === 'number' ? value : undefined
    }));
  };

  // 集計オプションの設定
  const handleAggregateOptionChange = (type: keyof AggregateOption, enabled: boolean) => {
    if (enabled) {
      setAggregateOption(prev => ({
        ...prev,
        [type]: type === '_count' ? true : { select: [] }
      }));
    } else {
      const { [type]: _, ...rest } = aggregateOption;
      setAggregateOption(rest);
    }
  };

  // 生成ボタンのクリック時
  const handleGenerate = () => {
    if (!selectedModel || selectedFields.length === 0) return;

    onGenerate({
      model: selectedModel,
      operation,
      selectedFields,
      conditions: conditions.length > 0 ? {
        [conditionType]: conditions
      } : {},
      sort: sortOptions.length > 0 ? sortOptions : undefined,
      pagination: Object.keys(paginationOption).length > 0 ? paginationOption : undefined,
      relation: Object.keys(relationOption).length > 0 ? relationOption : undefined,
      aggregate: Object.keys(aggregateOption).length > 0 ? aggregateOption : undefined
    });
  };

  // NumberInputのonChangeハンドラーを修正
  const handleSkipChange = (value: number | string) => {
    setPaginationOption(prev => ({
      ...prev,
      skip: typeof value === 'number' ? value : undefined
    }));
  };

  const handleTakeChange = (value: number | string) => {
    setPaginationOption(prev => ({
      ...prev,
      take: typeof value === 'number' ? value : undefined
    }));
  };

  // リレーション設定の型を修正
  const handleRelationFieldSelect = (fieldName: string, checked: boolean) => {
    setRelationOption(prev => ({
      ...prev,
      include: {
        ...prev.include,
        [fieldName]: checked ? { select: [] } : undefined
      }
    } as RelationOption));
  };

  const handleRelationFieldValuesChange = (fieldName: string, values: string[]) => {
    setRelationOption(prev => ({
      ...prev,
      include: {
        ...prev.include,
        [fieldName]: {
          ...prev.include?.[fieldName],
          select: values
        }
      }
    } as RelationOption));
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
              {Array.isArray(conditions) && conditions.map((condition, index) => (
                <WhereCondition
                  key={`condition-${index}`}
                  id={`condition-${index}`}
                  fields={selectedModel?.fields ?? []}
                  field={condition.field}
                  operator={condition.operator}
                  value={condition.value}
                  onChange={(field, operator, value) => handleConditionChange(index, field, operator, value)}
                  onDelete={() => handleConditionDelete(index)}
                />
              ))}
              {(!Array.isArray(conditions) || conditions.length === 0) && (
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

        {/* ソートオプション */}
        <Stack gap={rem(8)}>
          <Group justify="space-between">
            <Group gap="xs">
              <IconArrowsSort size={16} />
              <Title order={4} size="sm">ソート</Title>
            </Group>
            <ActionIcon
              variant="subtle"
              onClick={() => setOpenSections(prev => ({ ...prev, sort: !prev.sort }))}
            >
              {openSections.sort ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Collapse in={openSections.sort}>
            <Stack gap="xs">
              {sortOptions.map((sort, index) => (
                <Group key={index} grow>
                  <Select
                    data={selectedModel?.fields.map(f => ({
                      value: f.name,
                      label: f.name
                    })) || []}
                    value={sort.field}
                    onChange={(value) => {
                      if (!value) return;
                      const newSortOptions = [...sortOptions];
                      newSortOptions[index].field = value;
                      setSortOptions(newSortOptions);
                    }}
                  />
                  <Select
                    data={[
                      { value: 'asc', label: '昇順' },
                      { value: 'desc', label: '降順' }
                    ]}
                    value={sort.order}
                    onChange={(value) => {
                      if (!value) return;
                      const newSortOptions = [...sortOptions];
                      newSortOptions[index].order = value as 'asc' | 'desc';
                      setSortOptions(newSortOptions);
                    }}
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => {
                      setSortOptions(sortOptions.filter((_, i) => i !== index));
                    }}
                  >
                    <IconMinus size={16} />
                  </ActionIcon>
                </Group>
              ))}
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={handleAddSort}
                fullWidth
              >
                ソートを追加
              </Button>
            </Stack>
          </Collapse>
        </Stack>

        {/* ページネーション */}
        <Stack gap={rem(8)}>
          <Group justify="space-between">
            <Group gap="xs">
              <IconList size={16} />
              <Title order={4} size="sm">ページネーション</Title>
            </Group>
            <ActionIcon
              variant="subtle"
              onClick={() => setOpenSections(prev => ({ ...prev, pagination: !prev.pagination }))}
            >
              {openSections.pagination ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Collapse in={openSections.pagination}>
            <Stack gap="xs">
              <NumberInput
                label="スキップ"
                value={paginationOption.skip}
                onChange={handleSkipChange}
                min={0}
              />
              <NumberInput
                label="取得件数"
                value={paginationOption.take}
                onChange={handleTakeChange}
                min={1}
              />
              <Group grow>
                <Select
                  label="カーソルフィールド"
                  data={selectedModel?.fields.map(f => ({
                    value: f.name,
                    label: f.name
                  })) || []}
                  value={paginationOption.cursor?.field}
                  onChange={(value) => {
                    if (!value) {
                      const { cursor, ...rest } = paginationOption;
                      setPaginationOption(rest);
                    } else {
                      setPaginationOption(prev => ({
                        ...prev,
                        cursor: {
                          field: value,
                          value: prev.cursor?.value || ''
                        }
                      }));
                    }
                  }}
                />
                <TextInput
                  label="カーソル値"
                  value={paginationOption.cursor?.value || ''}
                  onChange={(e) => setPaginationOption(prev => ({
                    ...prev,
                    cursor: {
                      field: prev.cursor?.field || '',
                      value: e.currentTarget.value
                    }
                  }))}
                  disabled={!paginationOption.cursor?.field}
                />
              </Group>
            </Stack>
          </Collapse>
        </Stack>

        {/* リレーション設定 */}
        <Stack gap={rem(8)}>
          <Group justify="space-between">
            <Group gap="xs">
              <IconLink size={16} />
              <Title order={4} size="sm">リレーション</Title>
            </Group>
            <ActionIcon
              variant="subtle"
              onClick={() => setOpenSections(prev => ({ ...prev, relation: !prev.relation }))}
            >
              {openSections.relation ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Collapse in={openSections.relation}>
            <Stack gap="xs">
              <NumberInput
                label="最大深さ"
                value={relationOption.maxDepth}
                onChange={handleRelationDepthChange}
                min={0}
              />
              {selectedModel?.fields.filter(f => f.relation).map(field => (
                <Card key={field.name} withBorder p="xs">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>{field.name}</Text>
                      <Badge>{field.type}</Badge>
                    </Group>
                    <Checkbox
                      label="フィールドを選択"
                      checked={!!relationOption.include?.[field.name]?.select}
                      onChange={(e) => handleRelationFieldSelect(field.name, e.currentTarget.checked)}
                    />
                    {relationOption.include?.[field.name]?.select && (
                      <Select
                        data={schema.models
                          .find(m => m.name === field.type)
                          ?.fields.map(f => ({
                            value: f.name,
                            label: f.name
                          })) || []}
                        value={relationOption.include[field.name].select?.[0] || null}
                        onChange={(value) => {
                          if (!value) return;
                          handleRelationFieldValuesChange(field.name, [value]);
                        }}
                        searchable
                        clearable
                      />
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Collapse>
        </Stack>

        {/* 集計オプション */}
        {operation === 'aggregate' && (
          <Stack gap={rem(8)}>
            <Group justify="space-between">
              <Group gap="xs">
                <IconCalculator size={16} />
                <Title order={4} size="sm">集計</Title>
              </Group>
              <ActionIcon
                variant="subtle"
                onClick={() => setOpenSections(prev => ({ ...prev, aggregate: !prev.aggregate }))}
              >
                {openSections.aggregate ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
            <Collapse in={openSections.aggregate}>
              <Stack gap="xs">
                <Switch
                  label="件数をカウント"
                  checked={!!aggregateOption._count}
                  onChange={(e) => handleAggregateOptionChange('_count', e.currentTarget.checked)}
                />
                {['_sum', '_avg', '_min', '_max'].map((op) => (
                  <Group key={op} grow>
                    <Switch
                      label={
                        op === '_sum' ? '合計' :
                        op === '_avg' ? '平均' :
                        op === '_min' ? '最小' :
                        '最大'
                      }
                      checked={!!aggregateOption[op as keyof AggregateOption]}
                      onChange={(e) => handleAggregateOptionChange(op as keyof AggregateOption, e.currentTarget.checked)}
                    />
                    {aggregateOption[op as keyof AggregateOption] && (
                      <Select
                        data={selectedModel?.fields
                          .filter(f => f.type === 'Int' || f.type === 'Float')
                          .map(f => ({
                            value: f.name,
                            label: f.name
                          })) || []}
                        value={(aggregateOption[op as keyof AggregateOption] as any)?.select || []}
                        onChange={(values) => {
                          if (!values) return;
                          setAggregateOption(prev => ({
                            ...prev,
                            [op]: { select: values }
                          }));
                        }}
                        multiple
                        searchable
                        clearable
                      />
                    )}
                  </Group>
                ))}
              </Stack>
            </Collapse>
          </Stack>
        )}

        {/* 生成ボタン */}
        {selectedModel && selectedFields.length > 0 && (
          <Button
            onClick={handleGenerate}
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