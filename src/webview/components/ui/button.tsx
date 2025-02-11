import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import React from 'react';

export interface ButtonProps extends Omit<MantineButtonProps, 'variant'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const variantMap: Record<NonNullable<ButtonProps['variant']>, MantineButtonProps['variant']> = {
  default: 'filled',
  destructive: 'filled-error',
  outline: 'outline',
  secondary: 'light',
  ghost: 'subtle',
  link: 'transparent',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    return (
      <MantineButton
        ref={ref}
        variant={variantMap[variant]}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button'; 