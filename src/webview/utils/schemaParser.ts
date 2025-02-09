import { PrismaSchema, PrismaModel, PrismaField } from '../types/schema';

function parseField(fieldLine: string): PrismaField | null {
  // 基本的なフィールド定義のパターン: name type @attribute1 @attribute2
  const fieldPattern = /^\s*(\w+)\s+(\w+)(\[\])?\s*(\?)?\s*(.*)$/;
  const match = fieldLine.match(fieldPattern);
  
  if (!match) {
    console.log('Failed to match field pattern:', fieldLine);
    return null;
  }
  
  const [, name, type, isList, isOptional, attributes] = match;
  console.log('Parsing field:', { name, type, isList, isOptional, attributes });
  
  // プリミティブ型をチェック
  const primitiveTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'BigInt', 'Decimal', 'Json'];
  const isModelType = !primitiveTypes.includes(type);
  console.log('Field type info:', { type, isModelType });

  const field: PrismaField = {
    name,
    type,
    isRequired: !isOptional,
    isList: !!isList,
    isId: attributes.includes('@id'),
    isUnique: attributes.includes('@unique'),
  };

  // デフォルト値の解析
  const defaultMatch = attributes.match(/@default\((.*?)\)/);
  if (defaultMatch) {
    field.default = defaultMatch[1];
  }

  // リレーションの解析
  const relationMatch = attributes.match(/@relation\((.*?)\)/);
  if (relationMatch) {
    console.log('Found @relation:', relationMatch[1]);
    const relationStr = relationMatch[1];
    field.relation = {
      fields: [],
      references: []
    };

    // リレーション名の解析（"name: xxx"の形式）
    const nameMatch = relationStr.match(/name:\s*["']([^"']+)["']/);
    if (nameMatch) {
      field.relation.name = nameMatch[1];
    }

    // fields の解析
    const fieldsMatch = relationStr.match(/fields:\s*\[(.*?)\]/);
    if (fieldsMatch) {
      field.relation.fields = fieldsMatch[1].split(',').map(f => f.trim());
    }

    // references の解析
    const referencesMatch = relationStr.match(/references:\s*\[(.*?)\]/);
    if (referencesMatch) {
      field.relation.references = referencesMatch[1].split(',').map(f => f.trim());
    }

    // onDelete の解析
    const onDeleteMatch = relationStr.match(/onDelete:\s*(\w+)/);
    if (onDeleteMatch) {
      field.relation.onDelete = onDeleteMatch[1];
    }

    // onUpdate の解析
    const onUpdateMatch = relationStr.match(/onUpdate:\s*(\w+)/);
    if (onUpdateMatch) {
      field.relation.onUpdate = onUpdateMatch[1];
    }
  } else if (isModelType && !field.isId) {
    // 暗黙的なリレーションとして扱う（ただし、IDフィールドは除外）
    console.log('Implicit relation for model type:', type);
    field.relation = {
      fields: [],
      references: []
    };
  }

  console.log('Parsed field result:', field);
  return field;
}

function parseModel(modelBlock: string): PrismaModel {
  const lines = modelBlock.split('\n');
  const modelNameMatch = lines[0].match(/model\s+(\w+)\s*{/);
  if (!modelNameMatch) throw new Error('Invalid model definition');

  const model: PrismaModel = {
    name: modelNameMatch[1],
    fields: []
  };

  // @@map の解析
  const mapLine = lines.find(line => line.includes('@@map'));
  if (mapLine) {
    const mapMatch = mapLine.match(/@@map\("([^"]+)"\)/);
    if (mapMatch) {
      model.dbName = mapMatch[1];
    }
  }

  // フィールドの解析
  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('@@')) {
      const field = parseField(line);
      if (field) {
        model.fields.push(field);
      }
    }
  }

  return model;
}

export function parseSchema(schemaContent: string): PrismaSchema {
  const schema: PrismaSchema = {
    models: [],
    enums: [],
    datasource: {
      provider: 'postgresql' // デフォルト値
    }
  };

  // モデルブロックの抽出と解析
  const modelBlocks = schemaContent.match(/model\s+\w+\s*{[^}]+}/g) || [];
  schema.models = modelBlocks.map(block => parseModel(block));

  // datasource プロバイダーの解析
  const providerMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
  if (providerMatch) {
    schema.datasource.provider = providerMatch[1];
  }

  // enum の解析
  const enumBlocks = schemaContent.match(/enum\s+\w+\s*{[^}]+}/g) || [];
  schema.enums = enumBlocks.map(block => {
    const lines = block.split('\n');
    const enumNameMatch = lines[0].match(/enum\s+(\w+)\s*{/);
    if (!enumNameMatch) throw new Error('Invalid enum definition');

    return {
      name: enumNameMatch[1],
      values: lines
        .slice(1, -1)
        .map(line => line.trim())
        .filter(line => line.length > 0)
    };
  });

  return schema;
} 