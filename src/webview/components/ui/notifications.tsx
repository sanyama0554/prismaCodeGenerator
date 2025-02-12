import { Notifications, notifications, NotificationData } from '@mantine/notifications';
import { MantineProvider, useMantineTheme, rgba } from '@mantine/core';
import { IconCheck, IconX, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme();
  return (
    <MantineProvider theme={theme}>
      <Notifications 
        position="top-right" 
        zIndex={1000}
        containerWidth={320}
        autoClose={4000}
        styles={{
          notification: {
            transition: theme.other.transition.default,
            '&[data-type="success"]': {
              backgroundColor: rgba(theme.colors.green[1], 0.65),
              borderColor: theme.colors.green[3],
            },
            '&[data-type="error"]': {
              backgroundColor: rgba(theme.colors.red[1], 0.65),
              borderColor: theme.colors.red[3],
            },
            '&[data-type="info"]': {
              backgroundColor: rgba(theme.colors.blue[1], 0.65),
              borderColor: theme.colors.blue[3],
            },
            '&[data-type="warning"]': {
              backgroundColor: rgba(theme.colors.yellow[1], 0.65),
              borderColor: theme.colors.yellow[3],
            },
          },
        }}
      />
      {children}
    </MantineProvider>
  );
}

// 通知のヘルパー関数
export const showNotification = {
  success: (message: string, title: string = '成功') => {
    notifications.show({
      title,
      message,
      color: 'green',
      icon: <IconCheck size={16} />,
      radius: 'md',
      withBorder: true,
      withCloseButton: true,
      classNames: {
        root: 'notification-success',
      },
    });
  },

  error: (message: string, title: string = 'エラー') => {
    notifications.show({
      title,
      message,
      color: 'red',
      icon: <IconX size={16} />,
      radius: 'md',
      withBorder: true,
      withCloseButton: true,
      autoClose: 6000, // エラーは長めに表示
      classNames: {
        root: 'notification-error',
      },
    });
  },

  info: (message: string, title: string = '情報') => {
    notifications.show({
      title,
      message,
      color: 'blue',
      icon: <IconInfoCircle size={16} />,
      radius: 'md',
      withBorder: true,
      withCloseButton: true,
      classNames: {
        root: 'notification-info',
      },
    });
  },

  warning: (message: string, title: string = '警告') => {
    notifications.show({
      title,
      message,
      color: 'yellow',
      icon: <IconAlertCircle size={16} />,
      radius: 'md',
      withBorder: true,
      withCloseButton: true,
      autoClose: 5000, // 警告は標準より長めに表示
      classNames: {
        root: 'notification-warning',
      },
    });
  },

  loading: (message: string, title: string = '処理中') => {
    return notifications.show({
      title,
      message,
      color: 'blue',
      loading: true,
      radius: 'md',
      withBorder: true,
      autoClose: false,
      withCloseButton: false,
      classNames: {
        root: 'notification-loading',
      },
    });
  },

  update: (id: string, notification: NotificationData) => {
    notifications.update({
      id,
      ...notification,
    });
  },
}; 