import React from 'react';
import { PrismaSchema } from '../types/schema';
import { ModelCard } from './ModelCard';

interface ModelGridProps {
  schema: PrismaSchema;
  selectedModels?: string[];
  onModelSelect?: (modelName: string) => void;
}

export function ModelGrid({ schema, selectedModels = [], onModelSelect }: ModelGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {schema.models.map(model => (
        <ModelCard
          key={model.name}
          model={model}
          isSelected={selectedModels.includes(model.name)}
          onSelect={onModelSelect}
        />
      ))}
    </div>
  )
} 