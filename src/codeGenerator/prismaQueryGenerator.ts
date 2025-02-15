import { 
  PrismaModel, 
  PrismaField, 
  Operator, 
  Condition, 
  Conditions,
  SortOption,
  PaginationOption,
  RelationOption,
  AggregateOption
} from '../webview/types/schema';

type OperationType = 'create' | 'read' | 'update' | 'delete' | 'aggregate';

interface GenerateConfig {
  model: PrismaModel;
  operation: OperationType;
  selectedFields: string[];
  conditions: Conditions;
  sort?: SortOption[];
  pagination?: PaginationOption;
  relation?: RelationOption;
  aggregate?: AggregateOption;
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
 * リレーションフィールドの選択オプションを生成します
 */
function generateRelationSelect(field: PrismaField): string {
  if (!field.relation) return 'true';

  // リレーション先のモデルの基本フィールドを選択
  return `{
    select: {
      id: true,
      // 基本的なフィールドを選択
      ${field.relation.references.map(ref => `${ref}: true`).join(',\n      ')}
    }
  }`;
}

/**
 * リレーションの深さを制限したincludeオブジェクトを生成します
 */
function generateIncludeWithDepth(
  model: PrismaModel,
  selectedFields: string[],
  relationOption?: RelationOption,
  currentDepth: number = 0
): string {
  if (relationOption?.maxDepth !== undefined && currentDepth >= relationOption.maxDepth) {
    return '';
  }

  const relationFields = getRelationFields(model.fields);
  const selectedRelationFields = relationFields.filter(field => selectedFields.includes(field.name));
  
  if (selectedRelationFields.length === 0) {
    return '';
  }

  const includeObject = selectedRelationFields.reduce((acc, field) => {
    const relationConfig = relationOption?.include?.[field.name];
    
    acc[field.name] = {
      select: relationConfig?.select ? 
        relationConfig.select.reduce((obj, f) => ({ ...obj, [f]: true }), {}) :
        { id: true },
      
      // ソートオプションの追加
      orderBy: relationConfig?.sort?.map(sort => ({
        [sort.field]: sort.order
      })) || undefined,
      
      // ページネーションオプションの追加
      skip: relationConfig?.pagination?.skip,
      take: relationConfig?.pagination?.take,
      cursor: relationConfig?.pagination?.cursor ? {
        [relationConfig.pagination.cursor.field]: relationConfig.pagination.cursor.value
      } : undefined
    };
    
    return acc;
  }, {} as Record<string, any>);

  return `\n  include: ${JSON.stringify(includeObject, null, 2)}`;
}

/**
 * ソートオプションを生成します
 */
function generateOrderBy(sort?: SortOption[]): string {
  if (!sort || sort.length === 0) {
    return '';
  }

  const orderBy = sort.map(option => ({
    [option.field]: option.order
  }));

  return `\n  orderBy: ${JSON.stringify(orderBy, null, 2)}`;
}

/**
 * ページネーションオプションを生成します
 */
function generatePagination(pagination?: PaginationOption): string {
  if (!pagination) {
    return '';
  }

  const options: string[] = [];
  
  if (pagination.skip !== undefined) {
    options.push(`  skip: ${pagination.skip}`);
  }
  
  if (pagination.take !== undefined) {
    options.push(`  take: ${pagination.take}`);
  }
  
  if (pagination.cursor) {
    options.push(`  cursor: {
    ${pagination.cursor.field}: ${JSON.stringify(pagination.cursor.value)}
  }`);
  }

  return options.length > 0 ? `\n${options.join(',\n')}` : '';
}

/**
 * 集計オプションを生成します
 */
function generateAggregate(model: PrismaModel, aggregate?: AggregateOption): string {
  if (!aggregate) {
    return '';
  }

  const options: string[] = [];

  if (aggregate._count) {
    if (typeof aggregate._count === 'boolean') {
      options.push('  _count: true');
    } else {
      options.push(`  _count: {
    select: ${JSON.stringify(aggregate._count.select.reduce((acc, field) => ({ ...acc, [field]: true }), {}), null, 2)}
  }`);
    }
  }

  ['_sum', '_avg', '_min', '_max'].forEach(op => {
    const option = aggregate[op as keyof AggregateOption];
    if (option && 'select' in option) {
      options.push(`  ${op}: {
    select: ${JSON.stringify(option.select.reduce((acc, field) => ({ ...acc, [field]: true }), {}), null, 2)}
  }`);
    }
  });

  return options.length > 0 ? `\n${options.join(',\n')}` : '';
}

/**
 * リレーションフィールドを抽出します
 */
function getRelationFields(fields: PrismaField[]): PrismaField[] {
  return fields.filter(field => field.relation || field.type.charAt(0).toUpperCase() === field.type.charAt(0));
}

/**
 * ネストされた条件を生成します
 */
function generateNestedWhereClause(conditions: Conditions, model: PrismaModel): string {
  if (!conditions || Object.keys(conditions).length === 0) {
    return '// TODO: 検索条件を指定';
  }

  // リレーションフィールドを取得
  const relationFields = getRelationFields(model.fields);

  // AND条件の処理
  if (conditions.AND) {
    const andConditions = conditions.AND.map(condition => {
      const field = model.fields.find(f => f.name === condition.field);
      
      // リレーションフィールドの場合
      if (field && relationFields.includes(field)) {
        return `    ${condition.field}: {
      some: {
        ${condition.operator}: ${JSON.stringify(condition.value)}
      }
    }`;
      }

      // 通常のフィールドの場合
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

  // OR条件の処理
  if (conditions.OR) {
    const orConditions = conditions.OR.map(condition => {
      const field = model.fields.find(f => f.name === condition.field);
      
      // リレーションフィールドの場合
      if (field && relationFields.includes(field)) {
        return `    ${condition.field}: {
      some: {
        ${condition.operator}: ${JSON.stringify(condition.value)}
      }
    }`;
      }

      // 通常のフィールドの場合
      if (condition.operator === 'equals') {
        return `    ${condition.field}: ${JSON.stringify(condition.value)}`;
      } else {
        return `    ${condition.field}: {
      ${condition.operator}: ${JSON.stringify(condition.value)}
    }`;
      }
    }).join(',\n');

    return `OR: [
${orConditions}
    ]`;
  }

  // 単一条件の処理
  if (conditions.field) {
    const field = model.fields.find(f => f.name === conditions.field);
    
    // リレーションフィールドの場合
    if (field && relationFields.includes(field)) {
      return `    ${conditions.field}: {
      some: {
        ${conditions.operator}: ${JSON.stringify(conditions.value)}
      }
    }`;
    }

    // 通常のフィールドの場合
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
  const { 
    model, 
    operation, 
    selectedFields, 
    conditions,
    sort,
    pagination,
    relation,
    aggregate
  } = config;
  
  const lowerModelName = model.name.charAt(0).toLowerCase() + model.name.slice(1);

  // 集計操作の場合
  if (operation === 'aggregate') {
    return `const result = await prisma.${lowerModelName}.aggregate({
  where: {
${generateNestedWhereClause(conditions, model)}
  },${generateAggregate(model, aggregate)}
});`;
  }

  // 選択されたフィールドからリレーションフィールドを除外
  const relationFields = getRelationFields(model.fields);
  const regularFields = selectedFields.filter(field => 
    !relationFields.find(rf => rf.name === field)
  );

  // selectオブジェクトを生成（リレーションフィールドを除く）
  const selectObject = regularFields.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {} as Record<string, boolean>);

  // includeオブジェクトを生成（リレーションの深さ制限付き）
  const includeClause = generateIncludeWithDepth(model, selectedFields, relation);

  // 操作タイプに応じたクエリを生成
  switch (operation) {
    case 'create':
      return `const result = await prisma.${lowerModelName}.create({
  data: {
    // TODO: データを指定
  },
  select: ${JSON.stringify(selectObject, null, 2)},${includeClause}
});`;

    case 'read':
      return `const results = await prisma.${lowerModelName}.findMany({
  where: {
${generateNestedWhereClause(conditions, model)}
  },
  select: ${JSON.stringify(selectObject, null, 2)},${includeClause}${generateOrderBy(sort)}${generatePagination(pagination)}
});`;

    case 'update':
      return `const result = await prisma.${lowerModelName}.update({
  where: {
    id: 1  // TODO: 更新対象のIDを指定
  },
  data: {
    // TODO: 更新データを指定
  },
  select: ${JSON.stringify(selectObject, null, 2)},${includeClause}
});`;

    case 'delete':
      return `const result = await prisma.${lowerModelName}.delete({
  where: {
    id: 1  // TODO: 削除対象のIDを指定
  },
  select: ${JSON.stringify(selectObject, null, 2)},${includeClause}
});`;

    default:
      throw new Error(`Unsupported operation: ${operation}`);
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