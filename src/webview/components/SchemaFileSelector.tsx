import React from 'react';
import { Button } from '@mantine/core';
import { Card, Text, Title } from '@mantine/core';

interface SchemaFileSelectorProps {
  onFileSelect: () => void;
  isLoading?: boolean;
}

export function SchemaFileSelector({ onFileSelect, isLoading = false }: SchemaFileSelectorProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <Card.Section inheritPadding py="md">
        <Title order={2}>Prismaスキーマファイルを選択</Title>
        <Text size="sm" c="dimmed" mt="xs">
          schema.prismaファイルを選択してください。
          自動的に検出できない場合は、手動で選択することができます。
        </Text>
      </Card.Section>
      <Card.Section inheritPadding pb="md">
        <Button
          onClick={onFileSelect}
          disabled={isLoading}
          fullWidth
          loading={isLoading}
        >
          {isLoading ? 'ファイルを検索中...' : 'スキーマファイルを選択'}
        </Button>
      </Card.Section>
    </Card>
  );
} 