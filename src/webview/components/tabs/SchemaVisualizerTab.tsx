import React, { useState } from 'react';
import { Container, SegmentedControl, Paper, Group, Title, Text, Stack, useMantineTheme, Tooltip } from '@mantine/core';
import { IconLayoutGrid, IconGitBranch } from '@tabler/icons-react';
import { PrismaSchema } from '../../types/schema';
import { ModelFlow } from '../ModelFlow';
import { ModelGrid } from '../ModelGrid';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

interface SchemaVisualizerTabProps {
  schema: PrismaSchema;
}

type ViewMode = 'grid' | 'flow';

export function SchemaVisualizerTab({ schema }: SchemaVisualizerTabProps) {
  const theme = useMantineTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
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

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

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
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Title order={4}>スキーマ可視化</Title>
              <Text size="sm" c="dimmed">
                {selectedModels.length > 0 
                  ? `${selectedModels.length}個のモデルを選択中` 
                  : `${schema.models.length}個のモデル`}
              </Text>
            </Group>
            <SegmentedControl
              value={viewMode}
              onChange={handleViewModeChange}
              data={[
                {
                  value: 'grid',
                  label: (
                    <Tooltip label="グリッド表示">
                      <Group gap={4}>
                        <IconLayoutGrid size={16} />
                        <Text size="sm">グリッド</Text>
                      </Group>
                    </Tooltip>
                  )
                },
                {
                  value: 'flow',
                  label: (
                    <Tooltip label="リレーション表示">
                      <Group gap={4}>
                        <IconGitBranch size={16} />
                        <Text size="sm">リレーション</Text>
                      </Group>
                    </Tooltip>
                  )
                }
              ]}
              styles={{
                root: {
                  transition: theme.other.transition.default,
                },
                control: {
                  transition: theme.other.transition.default,
                },
                label: {
                  transition: theme.other.transition.default,
                }
              }}
            />
          </Group>

          {viewMode === 'flow' && (
            <Paper 
              p="xs" 
              withBorder 
              style={{
                backgroundColor: theme.colors.gray[0],
                borderColor: theme.colors.gray[3],
                transition: theme.other.transition.default,
              }}
            >
              <Group gap="md">
                <Title order={6}>リレーションの種類:</Title>
                <Group gap="md">
                  <Group gap="xs">
                    <div style={{ 
                      width: '2rem', 
                      height: '2px', 
                      backgroundColor: theme.colors.pink[6],
                      transition: theme.other.transition.default,
                    }} />
                    <Text size="sm">1:N</Text>
                  </Group>
                  <Group gap="xs">
                    <div style={{ 
                      width: '2rem', 
                      height: '2px', 
                      backgroundColor: theme.colors.green[6],
                      transition: theme.other.transition.default,
                    }} />
                    <Text size="sm">1:1</Text>
                  </Group>
                  <Group gap="xs">
                    <div style={{ 
                      width: '2rem', 
                      height: '2px', 
                      backgroundColor: theme.colors.blue[6],
                      transition: theme.other.transition.default,
                    }} />
                    <Text size="sm">N:1</Text>
                  </Group>
                </Group>
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>

      <div style={{ 
        transition: theme.other.transition.default,
        opacity: viewMode === 'flow' ? 1 : 0,
        position: viewMode === 'flow' ? 'relative' : 'absolute',
        visibility: viewMode === 'flow' ? 'visible' : 'hidden',
      }}>
        <ReactFlowProvider>
          <ModelFlow
            schema={schema}
            selectedModels={selectedModels}
            onModelSelect={handleModelSelect}
          />
        </ReactFlowProvider>
      </div>

      <div style={{ 
        transition: theme.other.transition.default,
        opacity: viewMode === 'grid' ? 1 : 0,
        position: viewMode === 'grid' ? 'relative' : 'absolute',
        visibility: viewMode === 'grid' ? 'visible' : 'hidden',
      }}>
        <ModelGrid
          schema={schema}
          selectedModels={selectedModels}
          onModelSelect={handleModelSelect}
        />
      </div>
    </Container>
  );
} 