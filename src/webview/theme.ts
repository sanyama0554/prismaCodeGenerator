import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    // VSCodeのデフォルトカラーパレットに近い色を設定
    blue: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3',
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
    ],
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: 'inherit',
    sizes: {
      h1: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '600' },
      h2: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '600' },
      h3: { fontSize: '1.125rem', lineHeight: '1.5rem', fontWeight: '600' },
      h4: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '600' },
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  other: {
    transition: {
      default: 'all 0.2s ease-in-out',
    },
  },
}); 