import React from 'react';
import { PrismaField } from '../types/schema';
import { Group, Select, TextInput, NumberInput, ActionIcon, Paper } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

type Operator = 'equals' | 'not' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

interface WhereConditionProps {
  fields: PrismaField[];
  field: string;
  operator: Operator;
  value: string;
  onDelete: () => void;
  onChange: (field: string, operator: Operator, value: string) => void;
}

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

const STRING_OPERATORS: Operator[] = ['equals', 'not', 'contains', 'startsWith', 'endsWith'];
const NUMBER_OPERATORS: Operator[] = ['equals', 'not', 'gt', 'gte', 'lt', 'lte'];

export function WhereCondition({ fields, field, operator, value, onDelete, onChange }: WhereConditionProps) {
  const selectedField = fields.find(f => f.name === field);
  const isNumericField = selectedField?.type === 'Int' || selectedField?.type === 'Float';
  const availableOperators = isNumericField ? NUMBER_OPERATORS : STRING_OPERATORS;

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Group grow align="center">
        {/* フィールド選択 */}
        <Select
          label="フィールド"
          data={fields.map(f => ({
            value: f.name,
            label: f.name
          }))}
          value={field}
          onChange={(newField) => newField && onChange(newField, operator, value)}
        />

        {/* 演算子選択 */}
        <Select
          label="演算子"
          data={availableOperators.map(op => ({
            value: op,
            label: OPERATOR_LABELS[op]
          }))}
          value={operator}
          onChange={(newOperator) => newOperator && onChange(field, newOperator as Operator, value)}
        />

        {/* 値の入力 */}
        {isNumericField ? (
          <NumberInput
            label="値"
            value={value === '' ? '' : Number(value)}
            onChange={(val) => onChange(field, operator, val.toString())}
            placeholder={`${field}の値を入力`}
          />
        ) : (
          <TextInput
            label="値"
            value={value}
            onChange={(e) => onChange(field, operator, e.currentTarget.value)}
            placeholder={`${field}の値を入力`}
          />
        )}

        {/* 削除ボタン */}
        <ActionIcon
          variant="light"
          color="red"
          onClick={onDelete}
          size="lg"
          style={{ marginTop: 'auto' }}
          aria-label="条件を削除"
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
} 