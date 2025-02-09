import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface SchemaFileSelectorProps {
  onFileSelect: () => void;
  isLoading?: boolean;
}

export function SchemaFileSelector({ onFileSelect, isLoading = false }: SchemaFileSelectorProps) {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Prismaスキーマファイルを選択</CardTitle>
        <CardDescription>
          schema.prismaファイルを選択してください。
          自動的に検出できない場合は、手動で選択することができます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onFileSelect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'ファイルを検索中...' : 'スキーマファイルを選択'}
        </Button>
      </CardContent>
    </Card>
  );
} 