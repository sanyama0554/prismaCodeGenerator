import React from 'react';
import { PrismaField } from '../types/schema';
import { Group, Select, TextInput, NumberInput, ActionIcon, Paper } from '@mantine/core';
import { IconTrash, IconGripVertical } from '@tabler/icons-react';
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

const STRING_OPERATORS: Operator[] = ['equals', 'not', 'contains', 'startsWith', 'endsWith'];
const NUMBER_OPERATORS: Operator[] = ['equals', 'not', 'gt', 'gte', 'lt', 'lte'];

const OPERATOR_LABELS: Record<Operator, string> = {
  equals: '等しい',
  not: '等しくない',
  gt: 'より大きい',
  gte: '以上',
  lt: 'より小さい',
  lte: '以下',
  contains: '含む',
  startsWith: 'で始まる',
  endsWith: 'で終わる'
};

export function WhereCondition({ 
  fields, 
  field, 
  operator, 
  value, 
  onDelete, 
  onChange,
  id,
}: WhereConditionProps) {
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

  const safeFields = React.useMemo(() => {
    return fields || [];
  }, [fields]);

  const selectedField = safeFields.find(f => f.name === field);
  const isNumericField = selectedField?.type === 'Int' || selectedField?.type === 'Float';
  
  const availableOperators = React.useMemo(() => {
    return isNumericField ? NUMBER_OPERATORS : STRING_OPERATORS;
  }, [isNumericField]);

  const fieldOptions = React.useMemo(() => {
    if (!Array.isArray(safeFields)) {
      return [];
    }
    return safeFields.map(f => ({
      value: f.name,
      label: `${f.name} (${f.type}${f.isList ? '[]' : ''}${!f.isRequired ? '?' : ''})`
    }));
  }, [safeFields]);

  const operatorOptions = React.useMemo(() => {
    if (!availableOperators || !Array.isArray(availableOperators)) {
      return [];
    }
    return availableOperators.map(op => ({
      value: op,
      label: OPERATOR_LABELS[op] || op
    }));
  }, [availableOperators]);

  return (
    <div ref={setNodeRef} style={style}>
      <Paper shadow="xs" p="md" withBorder>
        <Group align="flex-start">
          <ActionIcon
            variant="subtle"
            color="gray"
            {...attributes}
            {...listeners}
          >
            <IconGripVertical size={16} />
          </ActionIcon>

          <Group grow>
            <Select
              label="フィールド"
              placeholder="フィールドを選択"
              data={fieldOptions}
              value={field}
              onChange={(newField) => newField && onChange(newField, operator, value)}
            />

            <Select
              label="演算子"
              placeholder="演算子を選択"
              data={operatorOptions}
              value={operator}
              onChange={(newOperator) => newOperator && onChange(field, newOperator as Operator, value)}
            />

            {isNumericField ? (
              <NumberInput
                label="値"
                placeholder="数値を入力"
                value={Number(value) || 0}
                onChange={(newValue) => onChange(field, operator, String(newValue))}
              />
            ) : (
              <TextInput
                label="値"
                placeholder="テキストを入力"
                value={value}
                onChange={(e) => onChange(field, operator, e.currentTarget.value)}
              />
            )}
          </Group>

          <ActionIcon
            color="red"
            variant="subtle"
            onClick={onDelete}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Paper>
    </div>
  );
} 