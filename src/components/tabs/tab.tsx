import type { ComponentProps } from 'react';
import { Tabs } from 'tamagui';

export interface TabProps extends ComponentProps<typeof Tabs.Tab> {}

const Tab = ({ ...rest }: TabProps) => {
   return <Tabs.Tab {...rest} />;
};

export { Tab };
