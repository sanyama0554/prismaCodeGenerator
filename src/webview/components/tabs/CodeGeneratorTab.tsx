import React from 'react';
import { PrismaSchema, PrismaModel } from '../../types/schema';
import { CodeGeneratorPanel } from '../CodeGeneratorPanel';

interface CodeGeneratorTabProps {
  schema: PrismaSchema;
  onGenerate: (config: {
    model: PrismaModel;
    operation: 'create' | 'read' | 'update' | 'delete';
    selectedFields: string[];
    conditions: any;
  }) => void;
}

export function CodeGeneratorTab({ schema, onGenerate }: CodeGeneratorTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md">
        <CodeGeneratorPanel
          schema={schema}
          onGenerate={onGenerate}
        />
      </div>
    </div>
  );
} 