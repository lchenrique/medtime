import { themes } from '@/constants/Colors';
import { useNavigation } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { type ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../button/button';
import Icon from '../icon/icon';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

const Header = ({ title }: { title: ReactNode }) => {
   const navigation = useNavigation();
   const insets = useSafeAreaInsets();
   return (
      <>
         <ThemedView
            w="100%"
            backgroundColor={`hsl(${themes.dark.primary.split(' ').join(',')})`}
            style={[
               {
                  paddingTop: insets.top,
                  paddingBottom: insets.bottom,
                  paddingLeft: insets.left,
                  paddingRight: insets.right
               }
            ]}
            flexDirection="row"
            alignItems="center"
            marginBottom="$-14"
         >
            <ThemedView
               w="100%"
               pb="$2"
               px="$5"
               flexDirection="row"
               alignItems="center"
               justifyContent="space-between"
            >
               <Button h="$3" w="$3" mt="$2" bg="$primary">
                  <Icon
                     icon={ChevronLeft}
                     size={30}
                     color="primaryForeground"
                     onPress={() => navigation.goBack()}
                  />
               </Button>
               <ThemedText pr="$2">
                  <ThemedText
                     fontSize="$7"
                     fontWeight="bold"
                     color="$primaryForeground"
                  >
                     {title}
                  </ThemedText>
               </ThemedText>
            </ThemedView>
         </ThemedView>
      </>
   );
};

export default Header;
