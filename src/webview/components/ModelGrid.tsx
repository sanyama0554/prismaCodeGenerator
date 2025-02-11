import React from 'react';
import { SimpleGrid } from '@mantine/core';
import { PrismaSchema } from '../types/schema';
import { ModelCard } from './ModelCard';

interface ModelGridProps {
  schema: PrismaSchema;
  selectedModels?: string[];
  onModelSelect?: (modelName: string) => void;
}

export function ModelGrid({ schema, selectedModels = [], onModelSelect }: ModelGridProps) {
  return (
    <SimpleGrid
      cols={{ base: 1, md: 2, lg: 3 }}
      spacing="md"
      p="md"
    >
      {schema.models.map(model => (
        <ModelCard
          key={model.name}
          model={model}
          isSelected={selectedModels.includes(model.name)}
          onSelect={onModelSelect}
        />
      ))}
    </SimpleGrid>
  );
} 