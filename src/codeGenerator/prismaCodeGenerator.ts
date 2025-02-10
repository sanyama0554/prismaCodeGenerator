import { PrismaSchema } from '../webview/types/schema';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Prismaのスキーマから各モデルのCRUD操作コードを生成し、
 * ワークスペース内の generated フォルダにファイルとして書き出します。
 */
export function generatePrismaClientCode(schema: PrismaSchema): void {
  // ワークスペースのルートパスを取得
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    throw new Error('No workspace folder is opened');
  }
  const workspacePath = workspaceFolders[0].uri.fsPath;

  // generated フォルダを作成
  const generatedFolder = path.join(workspacePath, 'generated');
  if (!fs.existsSync(generatedFolder)) {
    fs.mkdirSync(generatedFolder);
  }

  schema.models.forEach(model => {
    // モデル名の先頭を小文字に変換（Prisma Client のプロパティは小文字）
    const lowerModelName = model.name.charAt(0).toLowerCase() + model.name.slice(1);
    const modelCode = `
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function create${model.name}(data: any) {
  return await prisma.${lowerModelName}.create({ data });
}

export async function get${model.name}s() {
  return await prisma.${lowerModelName}.findMany();
}

export async function update${model.name}(id: number, data: any) {
  return await prisma.${lowerModelName}.update({
    where: { id },
    data,
  });
}

export async function delete${model.name}(id: number) {
  return await prisma.${lowerModelName}.delete({
    where: { id },
  });
}
`;
    
    const fileName = path.join(generatedFolder, `${model.name}CRUD.ts`);
    fs.writeFileSync(fileName, modelCode.trim(), 'utf-8');
  });
} 