import '@testing-library/jest-dom';
import { vi } from 'vitest';

// グローバルなモックの設定
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})); 