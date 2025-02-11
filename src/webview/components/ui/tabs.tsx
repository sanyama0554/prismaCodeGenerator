import { Tabs as MantineTabs } from '@mantine/core';
import React from 'react';

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof MantineTabs> {
  defaultValue?: string;
}

const Tabs = ({ defaultValue, ...props }: TabsProps) => (
  <MantineTabs defaultValue={defaultValue} {...props} />
);

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MantineTabs.List>
>(({ ...props }, ref) => (
  <MantineTabs.List
    ref={ref}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof MantineTabs.Tab>
>(({ value, ...props }, ref) => (
  <MantineTabs.Tab
    ref={ref}
    value={value}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MantineTabs.Panel>
>(({ value, ...props }, ref) => (
  <MantineTabs.Panel
    ref={ref}
    value={value}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent }; 