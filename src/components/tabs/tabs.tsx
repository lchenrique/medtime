import {
   type TabsProps as TamaguiTabsProps,
   Tabs as TamaguiTabs
} from 'tamagui';

export interface TabsProps extends TamaguiTabsProps {
   tabs: any[];
}

const Tabs = ({ children, value, onValueChange, tabs }: TabsProps) => {
   return (
      <TamaguiTabs
         orientation="horizontal"
         flexDirection="column"
         width={'100%'}
         overflow="hidden"
         value={value}
         onValueChange={onValueChange}
      >
         {tabs && (
            <TamaguiTabs.List scrollable p="$3">
               {tabs}
            </TamaguiTabs.List>
         )}
         {children}
      </TamaguiTabs>
   );
};

Tabs.Content = TamaguiTabs.Content;

export { Tabs };
