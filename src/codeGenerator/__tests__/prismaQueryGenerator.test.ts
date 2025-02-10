import { describe, it, expect } from 'vitest';
import { generatePrismaQuery } from '../prismaQueryGenerator';
import { PrismaModel } from '../../webview/types/schema';

describe('generatePrismaQuery', () => {
  const mockUserModel: PrismaModel = {
    name: 'User',
    fields: [
      { name: 'id', type: 'Int', isRequired: true, isList: false, isId: true, isUnique: true },
      { name: 'email', type: 'String', isRequired: true, isList: false, isId: false, isUnique: true },
      { name: 'name', type: 'String', isRequired: false, isList: false, isId: false, isUnique: false },
      { name: 'posts', type: 'Post', isRequired: false, isList: true, isId: false, isUnique: false, relation: { fields: [], references: [] } }
    ]
  };

  describe('基本的なCRUD操作', () => {
    it('creates a create query with selected fields', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'create',
        selectedFields: ['email', 'name'],
        conditions: {}
      });

      expect(result).toContain('prisma.user.create');
      expect(result).toContain('"email": true');
      expect(result).toContain('"name": true');
      expect(result).not.toContain('"id": true');
      expect(result).not.toContain('"posts": true');
    });

    it('creates a read query with selected fields', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: ['id', 'email'],
        conditions: {}
      });

      expect(result).toContain('prisma.user.findMany');
      expect(result).toContain('"id": true');
      expect(result).toContain('"email": true');
      expect(result).not.toContain('"name": true');
    });

    it('creates an update query with selected fields', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'update',
        selectedFields: ['name', 'email'],
        conditions: {}
      });

      expect(result).toContain('prisma.user.update');
      expect(result).toContain('where: {');
      expect(result).toContain('id: 1');
      expect(result).toContain('"name": true');
      expect(result).toContain('"email": true');
    });

    it('creates a delete query with selected fields', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'delete',
        selectedFields: ['id', 'email', 'name'],
        conditions: {}
      });

      expect(result).toContain('prisma.user.delete');
      expect(result).toContain('where: {');
      expect(result).toContain('id: 1');
      expect(result).toContain('"id": true');
      expect(result).toContain('"email": true');
      expect(result).toContain('"name": true');
    });
  });

  describe('エッジケース', () => {
    it('空のフィールド選択でクエリを生成', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: [],
        conditions: {}
      });

      expect(result).toContain('prisma.user.findMany');
      expect(result).toContain('select: {}');
    });

    it('全フィールドを選択してクエリを生成', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: mockUserModel.fields.map(f => f.name),
        conditions: {}
      });

      mockUserModel.fields.forEach(field => {
        expect(result).toContain(`"${field.name}": true`);
      });
    });

    it('リレーションフィールドを含むクエリを生成', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: ['id', 'posts'],
        conditions: {}
      });

      expect(result).toContain('"posts": true');
      expect(result).toContain('"id": true');
    });
  });

  describe('モデル名の処理', () => {
    it('大文字で始まるモデル名を正しく処理', () => {
      const result = generatePrismaQuery({
        model: { ...mockUserModel, name: 'UserProfile' },
        operation: 'read',
        selectedFields: ['id'],
        conditions: {}
      });

      expect(result).toContain('prisma.userProfile.findMany');
    });

    it('小文字で始まるモデル名を正しく処理', () => {
      const result = generatePrismaQuery({
        model: { ...mockUserModel, name: 'user' },
        operation: 'read',
        selectedFields: ['id'],
        conditions: {}
      });

      expect(result).toContain('prisma.user.findMany');
    });
  });

  describe('クエリフォーマット', () => {
    it('生成されたクエリが適切にフォーマットされている', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'create',
        selectedFields: ['email'],
        conditions: {}
      });

      expect(result).toMatch(/\{\n\s+data:/);
      expect(result).toMatch(/\n\s+select:/);
      expect(result).toMatch(/\n\}/);
    });

    it('selectオブジェクトが適切にインデントされている', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: ['id', 'email', 'name'],
        conditions: {}
      });

      const selectPattern = /select: \{\n\s+"id": true,\n\s+"email": true,\n\s+"name": true\n\s*\}/;
      expect(result).toMatch(selectPattern);
    });
  });

  describe('条件付きクエリ', () => {
    it('単一の等価条件でクエリを生成', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: ['id', 'email'],
        conditions: {
          field: 'email',
          operator: 'equals',
          value: 'test@example.com'
        }
      });

      expect(result).toContain('where: {');
      expect(result).toContain('email: "test@example.com"');
      expect(result).toContain('prisma.user.findMany');
    });

    it('数値型の比較条件でクエリを生成', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: ['id', 'email'],
        conditions: {
          field: 'id',
          operator: 'gt',
          value: 100
        }
      });

      expect(result).toContain('where: {');
      expect(result).toContain('id: {');
      expect(result).toContain('gt: 100');
      expect(result).toContain('prisma.user.findMany');
    });

    it('文字列の部分一致条件でクエリを生成', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: ['id', 'name'],
        conditions: {
          field: 'name',
          operator: 'contains',
          value: 'John'
        }
      });

      expect(result).toContain('where: {');
      expect(result).toContain('name: {');
      expect(result).toContain('contains: "John"');
      expect(result).toContain('prisma.user.findMany');
    });

    it('複数の条件を組み合わせてクエリを生成', () => {
      const result = generatePrismaQuery({
        model: mockUserModel,
        operation: 'read',
        selectedFields: ['id', 'email', 'name'],
        conditions: {
          AND: [
            {
              field: 'email',
              operator: 'contains',
              value: '@example.com'
            },
            {
              field: 'id',
              operator: 'gt',
              value: 10
            }
          ]
        }
      });

      expect(result).toContain('where: {');
      expect(result).toContain('AND: [');
      expect(result).toContain('email: {');
      expect(result).toContain('contains: "@example.com"');
      expect(result).toContain('id: {');
      expect(result).toContain('gt: 10');
      expect(result).toContain('prisma.user.findMany');
    });
  });
}); 