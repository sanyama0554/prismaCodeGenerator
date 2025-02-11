import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WhereCondition } from '../WhereCondition';
import { PrismaField } from '../../types/schema';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';

const mockFields: PrismaField[] = [
  { name: 'id', type: 'Int', isRequired: true, isList: false, isId: true, isUnique: true },
  { name: 'email', type: 'String', isRequired: true, isList: false, isId: false, isUnique: true },
  { name: 'name', type: 'String', isRequired: false, isList: false, isId: false, isUnique: false }
];

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <MantineProvider>
      {ui}
    </MantineProvider>
  );
};

describe('WhereCondition', () => {
  it('すべてのフィールドオプションを表示する', () => {
    renderWithProvider(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value=""
        onDelete={() => {}}
        onChange={() => {}}
      />
    );

    const fieldSelect = screen.getByRole('textbox', { name: 'フィールド' });
    expect(fieldSelect).toBeInTheDocument();
    mockFields.forEach(field => {
      expect(screen.getByText(field.name)).toBeInTheDocument();
    });
  });

  it('文字列フィールドの場合、適切な演算子を表示する', () => {
    renderWithProvider(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value=""
        onDelete={() => {}}
        onChange={() => {}}
      />
    );

    const operatorSelect = screen.getByRole('textbox', { name: '演算子' });
    expect(operatorSelect).toBeInTheDocument();
    expect(screen.getByText('等しい')).toBeInTheDocument();
    expect(screen.getByText('含む')).toBeInTheDocument();
    expect(screen.getByText('で始まる')).toBeInTheDocument();
    expect(screen.getByText('で終わる')).toBeInTheDocument();
  });

  it('数値フィールドの場合、適切な演算子を表示する', () => {
    renderWithProvider(
      <WhereCondition
        fields={mockFields}
        field="id"
        operator="equals"
        value=""
        onDelete={() => {}}
        onChange={() => {}}
      />
    );

    const operatorSelect = screen.getByRole('textbox', { name: '演算子' });
    expect(operatorSelect).toBeInTheDocument();
    expect(screen.getByText('等しい')).toBeInTheDocument();
    expect(screen.getByText('より大きい')).toBeInTheDocument();
    expect(screen.getByText('以上')).toBeInTheDocument();
    expect(screen.getByText('より小さい')).toBeInTheDocument();
    expect(screen.getByText('以下')).toBeInTheDocument();
  });

  it('フィールドが変更された時にonChangeを呼び出す', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={() => {}}
        onChange={onChange}
      />
    );

    const fieldSelect = screen.getByRole('textbox', { name: 'フィールド' });
    await user.click(fieldSelect);
    await user.click(screen.getByText('name'));

    expect(onChange).toHaveBeenCalledWith('name', 'equals', 'test');
  });

  it('演算子が変更された時にonChangeを呼び出す', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={() => {}}
        onChange={onChange}
      />
    );

    const operatorSelect = screen.getByRole('textbox', { name: '演算子' });
    await user.click(operatorSelect);
    await user.click(screen.getByText('含む'));

    expect(onChange).toHaveBeenCalledWith('email', 'contains', 'test');
  });

  it('値が変更された時にonChangeを呼び出す', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={() => {}}
        onChange={onChange}
      />
    );

    const valueInput = screen.getByRole('textbox', { name: '値' });
    fireEvent.change(valueInput, { target: { value: 'newtest' } });

    // 最後のonChange呼び出しを待機
    await waitFor(() => {
      const calls = onChange.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall).toEqual(['email', 'equals', 'newtest']);
    });
  });

  it('削除ボタンがクリックされた時にonDeleteを呼び出す', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    renderWithProvider(
      <WhereCondition
        fields={mockFields}
        field="email"
        operator="equals"
        value="test"
        onDelete={onDelete}
        onChange={() => {}}
      />
    );

    const deleteButton = screen.getByRole('button', { name: '条件を削除' });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });
}); 