import React from 'react';
import { SimpleGrid, Container, Title, Text, Group, ActionIcon, useMantineTheme, Paper } from '@mantine/core';
import { IconLayoutGrid, IconLayoutList } from '@tabler/icons-react';
import { PrismaSchema } from '../types/schema';
import { ModelCard } from './ModelCard';

interface ModelGridProps {
  schema: PrismaSchema;
  selectedModels?: string[];
  onModelSelect?: (modelName: string) => void;
}

export function ModelGrid({ schema, selectedModels = [], onModelSelect }: ModelGridProps) {
  const theme = useMantineTheme();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  return (
    <Container size="xl" py="md">
      <Paper 
        shadow="xs" 
        p="md" 
        withBorder 
        mb="md"
        style={{
          backgroundColor: 'white',
          borderColor: theme.colors.gray[3],
          transition: theme.other.transition.default,
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Title order={4}>モデル一覧</Title>
            <Text size="sm" c="dimmed">
              {schema.models.length}個のモデル
            </Text>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant={viewMode === 'grid' ? 'filled' : 'light'}
              color="blue"
              onClick={() => setViewMode('grid')}
              aria-label="グリッド表示"
              style={{ transition: theme.other.transition.default }}
            >
              <IconLayoutGrid size={18} />
            </ActionIcon>
            <ActionIcon
              variant={viewMode === 'list' ? 'filled' : 'light'}
              color="blue"
              onClick={() => setViewMode('list')}
              aria-label="リスト表示"
              style={{ transition: theme.other.transition.default }}
            >
              <IconLayoutList size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      <SimpleGrid
        cols={viewMode === 'grid' ? { base: 1, sm: 2, lg: 3 } : 1}
        spacing="md"
        verticalSpacing="md"
        style={{
          transition: theme.other.transition.default,
        }}
      >
        {schema.models.map(model => (
          <div
            key={model.name}
            style={{
              transition: theme.other.transition.default,
              transform: `scale(${selectedModels.includes(model.name) ? '1.02' : '1'})`,
            }}
          >
            <ModelCard
              model={model}
              isSelected={selectedModels.includes(model.name)}
              onSelect={onModelSelect}
            />
          </div>
        ))}
      </SimpleGrid>
    </Container>
  );
} 