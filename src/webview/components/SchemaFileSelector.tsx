import React from 'react';
import { Button, Card, Text, Title, Stack, Group, useMantineTheme } from '@mantine/core';
import { IconFileCode, IconUpload } from '@tabler/icons-react';

interface SchemaFileSelectorProps {
  onFileSelect: () => void;
  isLoading?: boolean;
}

export function SchemaFileSelector({ onFileSelect, isLoading = false }: SchemaFileSelectorProps) {
  const theme = useMantineTheme();

  return (
    <Card 
      shadow="sm" 
      padding="xl" 
      radius="md" 
      withBorder 
      style={{ 
        maxWidth: '500px', 
        margin: '4rem auto',
        transition: theme.other.transition.default,
        borderColor: theme.colors.gray[3],
      }}
    >
      <Stack gap="xl" align="center">
        <IconFileCode 
          size={48} 
          color={theme.colors.blue[6]}
          style={{ 
            transition: theme.other.transition.default,
            opacity: isLoading ? 0.5 : 1 
          }}
        />
        
        <Stack gap="xs" align="center">
          <Title order={2} ta="center">Prismaスキーマファイルを選択</Title>
          <Text size="sm" c="dimmed" ta="center" maw={400}>
            schema.prismaファイルを選択してください。
            自動的に検出できない場合は、手動で選択することができます。
          </Text>
        </Stack>

        <Group>
          <Button
            onClick={onFileSelect}
            disabled={isLoading}
            loading={isLoading}
            size="lg"
            leftSection={<IconUpload size={20} />}
            styles={{
              root: {
                transition: theme.other.transition.default,
              }
            }}
          >
            {isLoading ? 'ファイルを検索中...' : 'スキーマファイルを選択'}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
} 