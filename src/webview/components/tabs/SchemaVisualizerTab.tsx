import React, { useState } from 'react';
import { PrismaSchema } from '../../types/schema';
import { ModelFlow } from '../ModelFlow';
import { ModelGrid } from '../ModelGrid';

interface SchemaVisualizerTabProps {
  schema: PrismaSchema;
}

export function SchemaVisualizerTab({ schema }: SchemaVisualizerTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'flow'>('flow');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const handleModelSelect = (modelName: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        return prev.filter(name => name !== modelName);
      } else {
        return [...prev, modelName];
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          className={`text-sm ${viewMode === 'grid' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setViewMode('grid')}
        >
          グリッド表示
        </button>
        <button
          className={`text-sm ${viewMode === 'flow' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
          onClick={() => setViewMode('flow')}
        >
          フロー表示
        </button>
      </div>

      {viewMode === 'flow' && (
        <div className="bg-white/95 p-4 rounded-lg shadow-md border inline-block">
          <div className="text-sm font-medium mb-2">リレーションの種類</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ backgroundColor: '#ff0072' }} />
              <span className="text-sm">1:N</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ backgroundColor: '#00ff72' }} />
              <span className="text-sm">1:1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5" style={{ backgroundColor: '#0072ff' }} />
              <span className="text-sm">N:1</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        {viewMode === 'flow' ? (
          <ModelFlow
            schema={schema}
            selectedModels={selectedModels}
            onModelSelect={handleModelSelect}
          />
        ) : (
          <ModelGrid
            schema={schema}
            selectedModels={selectedModels}
            onModelSelect={handleModelSelect}
          />
        )}
      </div>
    </div>
  );
} 