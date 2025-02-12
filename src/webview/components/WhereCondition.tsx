import React from 'react';
import { PrismaField } from '../types/schema';
import { 
  Group, 
  Select, 
  TextInput, 
  NumberInput, 
  ActionIcon, 
  Paper, 
  useMantineTheme, 
  Tooltip, 
  Stack,
  Text,
  Badge,
  Box,
  ComboboxItem,
} from '@mantine/core';
import { 
  IconTrash, 
  IconGripVertical,
  IconArrowsUpDown,
  IconEqual,
  IconMath,
  IconLetterCase,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Operator = 'equals' | 'not' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

interface WhereConditionProps {
  fields: PrismaField[];
  field: string;
  operator: Operator;
  value: string;
  onDelete: () => void;
  onChange: (field: string, operator: Operator, value: string) => void;
  id: string;
}

const OPERATOR_LABELS: Record<Operator, { label: string; icon: React.ReactNode }> = {
  equals: { 
    label: '等しい', 
    icon: <IconEqual size={16} /> 
  },
  not: { 
    label: '等しくない', 
    icon: <IconX size={16} /> 
  },
  gt: { 
    label: 'より大きい', 
    icon: <IconMath size={16} /> 
  },
  gte: { 
    label: '以上', 
    icon: <IconMath size={16} /> 
  },
  lt: { 
    label: 'より小さい', 
    icon: <IconMath size={16} /> 
  },
  lte: { 
    label: '以下', 
    icon: <IconMath size={16} /> 
  },
  contains: { 
    label: '含む', 
    icon: <IconSearch size={16} /> 
  },
  startsWith: { 
    label: 'で始まる', 
    icon: <IconLetterCase size={16} /> 
  },
  endsWith: { 
    label: 'で終わる', 
    icon: <IconLetterCase size={16} /> 
  }
};

const STRING_OPERATORS: Operator[] = ['equals', 'not', 'contains', 'startsWith', 'endsWith'];
const NUMBER_OPERATORS: Operator[] = ['equals', 'not', 'gt', 'gte', 'lt', 'lte'];

export function WhereCondition({ 
  fields, 
  field, 
  operator, 
  value, 
  onDelete, 
  onChange,
  id,
}: WhereConditionProps) {
  const theme = useMantineTheme();
  const selectedField = fields.find(f => f.name === field);
  const isNumericField = selectedField?.type === 'Int' || selectedField?.type === 'Float';
  const availableOperators = isNumericField ? NUMBER_OPERATORS : STRING_OPERATORS;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getFieldBadge = (field: PrismaField) => {
    if (field.isId) return <Badge color="blue" size="xs">ID</Badge>;
    if (field.relation) return <Badge color="green" size="xs">関連</Badge>;
    if (field.isUnique) return <Badge color="violet" size="xs">一意</Badge>;
    return null;
  };

  const renderFieldLabel = (f: PrismaField) => (
    <Group gap="xs" wrap="nowrap">
      <Text size="sm">{f.name}</Text>
      {getFieldBadge(f)}
      <Text size="xs" c="dimmed">
        {f.type}{f.isList ? '[]' : ''}{!f.isRequired ? '?' : ''}
      </Text>
    </Group>
  );

  const renderOperatorLabel = (op: Operator) => (
    <Group gap="xs" wrap="nowrap">
      {OPERATOR_LABELS[op].icon}
      <Text size="sm">{OPERATOR_LABELS[op].label}</Text>
    </Group>
  );

  return (
    <Box ref={setNodeRef} style={style}>
      <Paper 
        shadow="xs" 
        p="md" 
        withBorder 
        style={{
          backgroundColor: 'white',
          borderColor: theme.colors.gray[3],
          transition: theme.other.transition.default,
        }}
      >
        <Group align="flex-start" wrap="nowrap">
          <Tooltip label="ドラッグして順序を変更">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              style={{ 
                cursor: 'grab',
                transition: theme.other.transition.default,
              }}
              {...attributes}
              {...listeners}
            >
              <IconGripVertical size={16} />
            </ActionIcon>
          </Tooltip>

          <Stack gap="xs" style={{ flex: 1 }}>
            <Group grow align="flex-start">
              <Select
                label="フィールド"
                placeholder="フィールドを選択"
                data={fields.map(f => ({
                  value: f.name,
                  label: OPERATOR_LABELS[f.name as Operator]?.label || f.name,
                  group: f.relation ? 'リレーション' : '基本フィールド'
                }))}
                value={field}
                onChange={(newField) => newField && onChange(newField, operator, value)}
                styles={{
                  input: {
                    transition: theme.other.transition.default,
                    '&:focus': {
                      borderColor: theme.colors.blue[6],
                    }
                  }
                }}
              />

              <Select
                label="演算子"
                placeholder="演算子を選択"
                data={availableOperators.map(op => ({
                  value: op,
                  label: OPERATOR_LABELS[op].label
                }))}
                value={operator}
                onChange={(newOperator) => newOperator && onChange(field, newOperator as Operator, value)}
                styles={{
                  input: {
                    transition: theme.other.transition.default,
                    '&:focus': {
                      borderColor: theme.colors.blue[6],
                    }
                  }
                }}
              />
            </Group>

            {isNumericField ? (
              <NumberInput
                label="値"
                placeholder={`${field}の値を入力`}
                value={value === '' ? '' : Number(value)}
                onChange={(val) => onChange(field, operator, val?.toString() || '')}
                styles={{
                  input: {
                    transition: theme.other.transition.default,
                    '&:focus': {
                      borderColor: theme.colors.blue[6],
                    }
                  }
                }}
              />
            ) : (
              <TextInput
                label="値"
                placeholder={`${field}の値を入力`}
                value={value}
                onChange={(e) => onChange(field, operator, e.currentTarget.value)}
                styles={{
                  input: {
                    transition: theme.other.transition.default,
                    '&:focus': {
                      borderColor: theme.colors.blue[6],
                    }
                  }
                }}
              />
            )}
          </Stack>

          <Tooltip label="条件を削除">
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              onClick={onDelete}
              style={{ 
                marginTop: '1.5rem',
                transition: theme.other.transition.default,
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>
    </Box>
  );
} 