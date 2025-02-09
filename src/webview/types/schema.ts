export interface PrismaField {
  name: string;
  type: string;
  isRequired: boolean;
  isList: boolean;
  isId: boolean;
  isUnique: boolean;
  default?: string;
  relation?: {
    name?: string;
    fields: string[];
    references: string[];
    onDelete?: string;
    onUpdate?: string;
  };
}

export interface PrismaModel {
  name: string;
  dbName?: string; // @@map属性の値
  fields: PrismaField[];
}

export interface PrismaSchema {
  models: PrismaModel[];
  enums: {
    name: string;
    values: string[];
  }[];
  datasource: {
    provider: string;
  };
} 