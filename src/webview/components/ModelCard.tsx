import React from 'react';
import { Card, Text, Badge, Group, Stack, useMantineTheme, Paper, Tooltip } from '@mantine/core';
import { IconKey, IconLink, IconList, IconAsterisk } from '@tabler/icons-react';
import { PrismaModel, PrismaField } from '../types/schema';

interface ModelCardProps {
  model: PrismaModel;
  isSelected?: boolean;
  onSelect?: (modelName: string) => void;
}

function FieldRow({ field }: { field: PrismaField }) {
  const theme = useMantineTheme();
  
  const getFieldIcon = () => {
    if (field.isId) return <IconKey size={16} />;
    if (field.relation) return <IconLink size={16} />;
    if (field.isList) return <IconList size={16} />;
    if (field.isRequired) return <IconAsterisk size={16} />;
    return null;
  };

  const getFieldTooltip = () => {
    if (field.isId) return 'ID フィールド';
    if (field.relation) return 'リレーションフィールド';
    if (field.isList) return 'リストフィールド';
    if (field.isRequired) return '必須フィールド';
    return '';
  };

  return (
    <Paper 
      p="xs" 
      style={{ 
        backgroundColor: theme.colors.gray[0],
        transition: theme.other.transition.default,
        '&:hover': {
          backgroundColor: theme.colors.gray[1],
        }
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <Tooltip label={getFieldTooltip()} disabled={!getFieldIcon()}>
            <Group gap={4} wrap="nowrap">
              {getFieldIcon()}
              <Text fw={500} size="sm">{field.name}</Text>
            </Group>
          </Tooltip>
          <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            {field.type}
            {field.isList ? '[]' : ''}
            {!field.isRequired ? '?' : ''}
          </Text>
        </Group>
        <Group gap={4} wrap="nowrap">
          {field.isId && (
            <Badge 
              variant="light" 
              color="blue"
              size="sm"
              style={{ transition: theme.other.transition.default }}
            >
              ID
            </Badge>
          )}
          {field.isUnique && (
            <Badge 
              variant="light" 
              color="violet"
              size="sm"
              style={{ transition: theme.other.transition.default }}
            >
              Unique
            </Badge>
          )}
          {field.relation && (
            <Badge 
              variant="light" 
              color="green"
              size="sm"
              style={{ transition: theme.other.transition.default }}
            >
              Relation
            </Badge>
          )}
        </Group>
      </Group>
    </Paper>
  );
}

export function ModelCard({ model, isSelected = false, onSelect }: ModelCardProps) {
  const theme = useMantineTheme();

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        cursor: 'pointer',
        transition: theme.other.transition.default,
        borderColor: isSelected ? theme.colors.blue[6] : theme.colors.gray[3],
        borderWidth: isSelected ? '2px' : '1px',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows.md,
        }
      }}
      onClick={() => onSelect?.(model.name)}
    >
      <Card.Section inheritPadding py="sm">
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">{model.name}</Text>
          {model.dbName && (
            <Tooltip label="データベースのテーブル名">
              <Text size="sm" c="dimmed">
                → {model.dbName}
              </Text>
            </Tooltip>
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