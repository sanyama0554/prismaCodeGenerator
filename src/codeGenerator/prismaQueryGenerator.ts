import { PrismaModel } from '../webview/types/schema';

type OperationType = 'create' | 'read' | 'update' | 'delete';
type Operator = 'equals' | 'not' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

interface Condition {
  field: string;
  operator: Operator;
  value: any;
}

interface Conditions {
  AND?: Condition[];
  OR?: Condition[];
  field?: string;
  operator?: Operator;
  value?: any;
}

interface GenerateConfig {
  model: PrismaModel;
  operation: OperationType;
  selectedFields: string[];
  conditions: Conditions;
}

/**
 * 選択されたフィールドに基づいて、TypeScript の型定義を生成します
 */
function generateTypeDefinition(model: PrismaModel, selectedFields: string[]): string {
  const fields = model.fields
    .filter(field => selectedFields.includes(field.name))
    .map(field => {
      const isOptional = !field.isRequired || field.default !== undefined;
      return `  ${field.name}${isOptional ? '?' : ''}: ${field.type}${field.isList ? '[]' : ''};`;
    });

  return `interface ${model.name}Data {
${fields.join('\n')}
}`;
}

/**
 * Prismaクライアントのインポート文とクライアントのインスタンス化コードを生成します
 */
function generatePrismaClientSetup(): string {
  return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();`;
}

/**
 * 条件オブジェクトをPrismaのwhere句に変換します
 */
function generateWhereClause(conditions: Conditions): string {
  if (!conditions || Object.keys(conditions).length === 0) {
    return '// TODO: 検索条件を指定';
  }

  // AND条件の処理
  if (conditions.AND) {
    const andConditions = conditions.AND.map(condition => {
      if (condition.operator === 'equals') {
        return `    ${condition.field}: ${JSON.stringify(condition.value)}`;
      } else {
        return `    ${condition.field}: {
      ${condition.operator}: ${JSON.stringify(condition.value)}
    }`;
      }
    }).join(',\n');

    return `AND: [
${andConditions}
    ]`;
  }

  // 単一条件の処理
  if (conditions.field) {
    if (conditions.operator === 'equals') {
      return `    ${conditions.field}: ${JSON.stringify(conditions.value)}`;
    } else {
      return `    ${conditions.field}: {
      ${conditions.operator}: ${JSON.stringify(conditions.value)}
    }`;
    }
  }

  return '// TODO: 検索条件を指定';
}

/**
 * 選択された設定に基づいて、Prismaクエリを生成します
 */
export function generatePrismaQuery(config: GenerateConfig): string {
  const { model, operation, selectedFields, conditions } = config;
  const lowerModelName = model.name.charAt(0).toLowerCase() + model.name.slice(1);

  // 選択されたフィールドを含むselectオブジェクトを生成
  const selectObject = selectedFields.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {} as Record<string, boolean>);

  // 操作タイプに応じたクエリを生成
  switch (operation) {
    case 'create':
      return `const result = await prisma.${lowerModelName}.create({
  data: {
    // TODO: データを指定
  },
  select: ${JSON.stringify(selectObject, null, 2)}
});`;

    case 'read':
      return `const results = await prisma.${lowerModelName}.findMany({
  where: {
${generateWhereClause(conditions)}
  },
  select: ${JSON.stringify(selectObject, null, 2)}
});`;

    case 'update':
      return `const result = await prisma.${lowerModelName}.update({
  where: {
    id: 1  // TODO: 更新対象のIDを指定
  },
  data: {
    // TODO: 更新データを指定
  },
  select: ${JSON.stringify(selectObject, null, 2)}
});`;

    case 'delete':
      return `const result = await prisma.${lowerModelName}.delete({
  where: {
    id: 1  // TODO: 削除対象のIDを指定
  },
  select: ${JSON.stringify(selectObject, null, 2)}
});`;
  }
}

/**
 * 生成したコードの使用例を生成します
 */
function generateUsageExample(modelName: string, operation: OperationType): string {
  const lowerModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  
  switch (operation) {
    case 'create':
      return `// 新しい${modelName}を作成
const new${modelName} = await create${modelName}({
  // データを指定
});`;

    case 'read':
      return `// ${modelName}一覧を取得
const ${lowerModelName}s = await get${modelName}s();

// 条件を指定して取得
const filtered${modelName}s = await get${modelName}s({
  // 検索条件を指定
});`;

    case 'update':
      return `// ${modelName}を更新
const updated${modelName} = await update${modelName}(1, {
  // 更新データを指定
});`;

    case 'delete':
      return `// ${modelName}を削除
const deleted${modelName} = await delete${modelName}(1);`;
  }
} 