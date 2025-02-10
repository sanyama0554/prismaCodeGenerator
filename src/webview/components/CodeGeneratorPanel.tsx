import React, { useState } from 'react';
import { PrismaSchema, PrismaModel } from '../types/schema';

type OperationType = 'create' | 'read' | 'update' | 'delete';

interface CodeGeneratorPanelProps {
  schema: PrismaSchema;
  onGenerate: (config: {
    model: PrismaModel;
    operation: OperationType;
    selectedFields: string[];
    conditions: any; // TODO: 型を定義
  }) => void;
}

export function CodeGeneratorPanel({ schema, onGenerate }: CodeGeneratorPanelProps) {
  const [selectedModel, setSelectedModel] = useState<PrismaModel | null>(null);
  const [operation, setOperation] = useState<OperationType>('read');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

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

        {/* 生成ボタン */}
        {selectedModel && selectedFields.length > 0 && (
          <button
            className="mt-6 w-full bg-primary text-primary-foreground rounded-md p-2"
            onClick={() => onGenerate({
              model: selectedModel,
              operation,
              selectedFields,
              conditions: {} // TODO: 条件の実装
            })}
          >
            コードを生成
          </button>
        )}
      </div>
    </div>
  );
} 