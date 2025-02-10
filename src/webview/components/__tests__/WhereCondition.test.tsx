import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhereCondition } from '../WhereCondition';
import { PrismaField } from '../../types/schema';
import '@testing-library/jest-dom';

const mockFields: PrismaField[] = [
  { name: 'id', type: 'Int', isRequired: true, isList: false, isId: true, isUnique: true },
  { name: 'email', type: 'String', isRequired: true, isList: false, isId: false, isUnique: true },
  { name: 'name', type: 'String', isRequired: false, isList: false, isId: false, isUnique: false }
];

describe('WhereCondition', () => {
  it('すべてのフィールドオプションを表示する', () => {
    render(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value=""
        onDelete={() => {}}
        onChange={() => {}}
      />
    );

    const fieldSelect = screen.getByLabelText('フィールド');
    expect(fieldSelect).toBeInTheDocument();
    mockFields.forEach(field => {
      expect(screen.getByText(field.name)).toBeInTheDocument();
    });
  });

  it('文字列フィールドの場合、適切な演算子を表示する', () => {
    render(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value=""
        onDelete={() => {}}
        onChange={() => {}}
      />
    );

    const operatorSelect = screen.getByLabelText('演算子');
    expect(operatorSelect).toBeInTheDocument();
    expect(screen.getByText('等しい')).toBeInTheDocument();
    expect(screen.getByText('含む')).toBeInTheDocument();
    expect(screen.getByText('で始まる')).toBeInTheDocument();
    expect(screen.getByText('で終わる')).toBeInTheDocument();
  });

  it('数値フィールドの場合、適切な演算子を表示する', () => {
    render(
      <WhereCondition
        fields={mockFields}
        field="id"
        operator="equals"
        value=""
        onDelete={() => {}}
        onChange={() => {}}
      />
    );

    const operatorSelect = screen.getByLabelText('演算子');
    expect(operatorSelect).toBeInTheDocument();
    expect(screen.getByText('等しい')).toBeInTheDocument();
    expect(screen.getByText('より大きい')).toBeInTheDocument();
    expect(screen.getByText('以上')).toBeInTheDocument();
    expect(screen.getByText('より小さい')).toBeInTheDocument();
    expect(screen.getByText('以下')).toBeInTheDocument();
  });

  it('フィールドが変更された時にonChangeを呼び出す', () => {
    const onChange = vi.fn();
    render(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={() => {}}
        onChange={onChange}
      />
    );

    const fieldSelect = screen.getByLabelText('フィールド');
    fireEvent.change(fieldSelect, { target: { value: 'name' } });

    expect(onChange).toHaveBeenCalledWith('name', 'equals', 'test');
  });

  it('演算子が変更された時にonChangeを呼び出す', () => {
    const onChange = vi.fn();
    render(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={() => {}}
        onChange={onChange}
      />
    );

    const operatorSelect = screen.getByLabelText('演算子');
    fireEvent.change(operatorSelect, { target: { value: 'contains' } });

    expect(onChange).toHaveBeenCalledWith('email', 'contains', 'test');
  });

  it('値が変更された時にonChangeを呼び出す', () => {
    const onChange = vi.fn();
    render(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={() => {}}
        onChange={onChange}
      />
    );

    const valueInput = screen.getByLabelText('値');
    fireEvent.change(valueInput, { target: { value: 'newtest' } });

    expect(onChange).toHaveBeenCalledWith('email', 'equals', 'newtest');
  });

  it('削除ボタンがクリックされた時にonDeleteを呼び出す', () => {
    const onDelete = vi.fn();
    render(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={onDelete}
        onChange={() => {}}
      />
    );

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });
}); 