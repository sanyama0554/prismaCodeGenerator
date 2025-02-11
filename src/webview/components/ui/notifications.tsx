import { Notifications, notifications } from '@mantine/notifications';
import { MantineProvider } from '@mantine/core';
import React from 'react';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <Notifications position="top-right" zIndex={1000} />
      {children}
    </MantineProvider>
  );
}

// 通知のヘルパー関数
export const showNotification = {
  success: (message: string) => {
    notifications.show({
      title: '成功',
      message,
      color: 'green',
    });
  },
  error: (message: string) => {
    notifications.show({
      title: 'エラー',
      message,
      color: 'red',
    });
  },
  info: (message: string) => {
    notifications.show({
      title: '情報',
      message,
      color: 'blue',
    });
  },
}; 