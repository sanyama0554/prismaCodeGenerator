import React from 'react';
import { Card, Title, Stack, Checkbox, Select, TextInput, Button, Group, useMantineTheme } from '@mantine/core';

export function SettingsTab() {
  const theme = useMantineTheme();

  return (
    <Card 
      shadow="sm" 
      p="lg" 
      radius="md" 
      withBorder
      style={{
        transition: theme.other.transition.default,
        borderColor: theme.colors.gray[3],
      }}
    >
      <Stack gap="xl">
        <Title order={3}>設定</Title>
        
        {/* 出力設定 */}
        <Stack gap="md">
          <Title order={4} size="sm">出力設定</Title>
          <Stack gap="xs">
            <Checkbox
              label="TypeScript型定義を生成"
              defaultChecked
              styles={{
                input: {
                  transition: theme.other.transition.default,
                  '&:checked': {
                    backgroundColor: theme.colors.blue[6],
                    borderColor: theme.colors.blue[6],
                  }
                }
              }}
            />
            <Checkbox
              label="Zodスキーマを生成"
              defaultChecked
              styles={{
                input: {
                  transition: theme.other.transition.default,
                  '&:checked': {
                    backgroundColor: theme.colors.blue[6],
                    borderColor: theme.colors.blue[6],
                  }
                }
              }}
            />
          </Stack>
        </Stack>

        {/* コードスタイル設定 */}
        <Stack gap="md">
          <Title order={4} size="sm">コードスタイル</Title>
          <Stack gap="xs">
            <Select
              label="インデント"
              defaultValue="2"
              data={[
                { value: '2', label: '2スペース' },
                { value: '4', label: '4スペース' },
                { value: 'tab', label: 'タブ' }
              ]}
              styles={{
                input: {
                  transition: theme.other.transition.default,
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                  }
                }
              }}
            />
            <Select
              label="引用符"
              defaultValue="single"
              data={[
                { value: 'single', label: 'シングルクォート' },
                { value: 'double', label: 'ダブルクォート' }
              ]}
              styles={{
                input: {
                  transition: theme.other.transition.default,
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                  }
                }
              }}
            />
          </Stack>
        </Stack>

        {/* 出力先設定 */}
        <Stack gap="md">
          <Title order={4} size="sm">出力先</Title>
          <Stack gap="xs">
            <TextInput
              label="生成コードの出力先"
              placeholder="./src/generated"
              defaultValue="./src/generated"
              styles={{
                input: {
                  transition: theme.other.transition.default,
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                  }
                }
              }}
            />
            <TextInput
              label="型定義の出力先"
              placeholder="./src/types"
              defaultValue="./src/types"
              styles={{
                input: {
                  transition: theme.other.transition.default,
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                  }
                }
              }}
            />
          </Stack>
        </Stack>

        {/* 保存ボタン */}
        <Group justify="flex-end">
          <Button
            size="md"
            styles={{
              root: {
                transition: theme.other.transition.default,
              }
            }}
          >
            設定を保存
          </Button>
        </Group>
      </Stack>
    </Card>
  );
} 