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

export type Operator = 'equals' | 'not' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

export interface Condition {
  field: string;
  operator: Operator;
  value: string;
}

export interface Conditions {
  AND?: Condition[];
  OR?: Condition[];
}

// 新しい型定義
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: string;
  order: SortOrder;
}

export interface PaginationOption {
  skip?: number;
  take?: number;
  cursor?: {
    field: string;
    value: any;
  };
}

export interface RelationOption {
  maxDepth?: number;
  include?: {
    [key: string]: {
      select?: string[];
      sort?: SortOption[];
      pagination?: PaginationOption;
    };
  };
}

export interface AggregateOption {
  _count?: boolean | { select: string[] };
  _sum?: { select: string[] };
  _avg?: { select: string[] };
  _min?: { select: string[] };
  _max?: { select: string[] };
} 