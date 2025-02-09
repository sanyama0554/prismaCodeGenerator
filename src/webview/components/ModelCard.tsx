import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PrismaModel, PrismaField } from '../types/schema';

interface ModelCardProps {
  model: PrismaModel;
  isSelected?: boolean;
  onSelect?: (modelName: string) => void;
}

function FieldRow({ field }: { field: PrismaField }) {
  return (
    <div className="flex items-center py-1 hover:bg-accent/50 rounded px-2">
      <div className="flex-1 flex items-center gap-2">
        <span className="font-medium">{field.name}</span>
        <span className="text-sm text-muted-foreground">
          {field.type}
          {field.isList ? '[]' : ''}
          {!field.isRequired ? '?' : ''}
        </span>
      </div>
      <div className="flex gap-1">
        {field.isId && (
          <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">ID</span>
        )}
        {field.isUnique && (
          <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">Unique</span>
        )}
        {field.relation && (
          <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">Relation</span>
        )}
      </div>
    </div>
  );
}

export function ModelCard({ model, isSelected = false, onSelect }: ModelCardProps) {
  return (
    <Card className={`
      border-2 transition-colors cursor-pointer
      ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary/50'}
    `}
    onClick={() => onSelect?.(model.name)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{model.name}</span>
          {model.dbName && (
            <span className="text-sm text-muted-foreground">
              → {model.dbName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {model.fields.map(field => (
            <FieldRow key={field.name} field={field} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 