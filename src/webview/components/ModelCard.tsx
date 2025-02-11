import React from 'react';
import { Card, Text, Title, Badge, Group, Stack } from '@mantine/core';
import { PrismaModel, PrismaField } from '../types/schema';

interface ModelCardProps {
  model: PrismaModel;
  isSelected?: boolean;
  onSelect?: (modelName: string) => void;
}

function FieldRow({ field }: { field: PrismaField }) {
  return (
    <Group justify="space-between" py="xs" px="sm" style={{ 
      backgroundColor: 'var(--mantine-color-gray-0)',
      borderRadius: 'var(--mantine-radius-sm)',
    }}>
      <Group gap="xs">
        <Text fw={500}>{field.name}</Text>
        <Text size="sm" c="dimmed">
          {field.type}
          {field.isList ? '[]' : ''}
          {!field.isRequired ? '?' : ''}
        </Text>
      </Group>
      <Group gap="xs">
        {field.isId && (
          <Badge variant="light" color="blue">ID</Badge>
        )}
        {field.isUnique && (
          <Badge variant="light" color="blue">Unique</Badge>
        )}
        {field.relation && (
          <Badge variant="light" color="blue">Relation</Badge>
        )}
      </Group>
    </Group>
  );
}

export function ModelCard({ model, isSelected = false, onSelect }: ModelCardProps) {
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
        borderWidth: isSelected ? '2px' : '1px',
        cursor: 'pointer',
      }}
      onClick={() => onSelect?.(model.name)}
    >
      <Card.Section inheritPadding py="sm">
        <Group justify="space-between" align="center">
          <Title order={3}>{model.name}</Title>
          {model.dbName && (
            <Text size="sm" c="dimmed">
              → {model.dbName}
            </Text>
          )}
        </Group>
      </Card.Section>

      <Card.Section inheritPadding pt="xs">
        <Stack gap="xs">
          {model.fields.map(field => (
            <FieldRow key={field.name} field={field} />
          ))}
        </Stack>
      </Card.Section>
    </Card>
  );
} 