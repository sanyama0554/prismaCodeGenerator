import React, { useState } from 'react';
import { PrismaSchema, PrismaModel, Condition, Operator } from '../types/schema';
import { WhereCondition } from './WhereCondition';

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
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div>
        <h3 className="text-lg font-medium mb-4">コード生成</h3>
        
        {/* モデル選択 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">モデルを選択</label>
          <select
            className="w-full border rounded-md p-2"
            value={selectedModel?.name || ''}
            onChange={(e) => {
              const model = schema.models.find(m => m.name === e.target.value);
              setSelectedModel(model || null);
              setSelectedFields([]);
              setConditions([]);
            }}
          >
            <option value="">選択してください</option>
            {schema.models.map(model => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* 操作タイプの選択 */}
        {selectedModel && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">操作タイプ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`p-2 rounded-md ${operation === 'create' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                onClick={() => setOperation('create')}
              >
                作成
              </button>
              <button
                className={`p-2 rounded-md ${operation === 'read' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                onClick={() => setOperation('read')}
              >
                取得
              </button>
              <button
                className={`p-2 rounded-md ${operation === 'update' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                onClick={() => setOperation('update')}
              >
                更新
              </button>
              <button
                className={`p-2 rounded-md ${operation === 'delete' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                onClick={() => setOperation('delete')}
              >
                削除
              </button>
            </div>
          </div>
        )}

        {/* フィールド選択 */}
        {selectedModel && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">使用するフィールド</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedModel.fields.map(field => (
                <label key={field.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFields([...selectedFields, field.name]);
                      } else {
                        setSelectedFields(selectedFields.filter(f => f !== field.name));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {field.name}
                    <span className="text-muted-foreground ml-1">
                      ({field.type}{field.isList ? '[]' : ''}{field.isRequired ? '' : '?'})
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 検索条件 */}
        {selectedModel && (operation === 'read' || operation === 'update' || operation === 'delete') && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">検索条件</label>
              <div className="flex items-center gap-2">
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value as 'AND' | 'OR')}
                  className="text-sm border rounded-md p-1"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
                <button
                  onClick={handleAddCondition}
                  className="text-sm bg-secondary hover:bg-secondary/80 rounded-md px-2 py-1"
                >
                  条件を追加
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <WhereCondition
                  key={index}
                  fields={selectedModel.fields}
                  field={condition.field}
                  operator={condition.operator}
                  value={condition.value}
                  onChange={(field, operator, value) => handleConditionChange(index, field, operator, value)}
                  onDelete={() => handleConditionDelete(index)}
                />
              ))}
              {conditions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  条件が設定されていません
                </p>
              )}
            </div>
          </div>
        )}

        {/* 生成ボタン */}
        {selectedModel && selectedFields.length > 0 && (
          <button
            className="mt-6 w-full bg-primary text-primary-foreground rounded-md p-2"
            onClick={() => onGenerate({
              model: selectedModel,
              operation,
              selectedFields,
              conditions: conditions.length > 0 ? {
                [conditionType]: conditions
              } : {}
            })}
          >
            コードを生成
          </button>
        )}
      </div>
    </div>
  );
} 