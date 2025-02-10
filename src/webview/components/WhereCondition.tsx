import React from 'react';
import { PrismaField } from '../types/schema';

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
    <div className="flex items-center gap-2 p-2">
      {/* フィールド選択 */}
      <select
        aria-label="フィールド"
        value={field}
        onChange={(e) => onChange(e.target.value, operator, value)}
        className="min-w-[120px]"
      >
        {fields.map(f => (
          <option key={f.name} value={f.name}>{f.name}</option>
        ))}
      </select>

      {/* 演算子選択 */}
      <select
        aria-label="演算子"
        value={operator}
        onChange={(e) => onChange(field, e.target.value as Operator, value)}
        className="min-w-[120px]"
      >
        {availableOperators.map(op => (
          <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
        ))}
      </select>

      {/* 値の入力 */}
      <input
        aria-label="値"
        type={isNumericField ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(field, operator, e.target.value)}
        className="flex-1 min-w-[200px]"
        placeholder={`${field}の値を入力`}
      />

      {/* 削除ボタン */}
      <button
        onClick={onDelete}
        className="text-destructive hover:text-destructive/80"
      >
        削除
      </button>
    </div>
  );
} 