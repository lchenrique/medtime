import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import Header from '@/components/layout/header';
import { themes } from '@/constants/Colors';
import { SheetProvider } from '@/context/sheet';
import { useColorScheme } from '@/hooks/useColorScheme';
import { tamaguiConfig } from '@/tamagui.config';
import { TamaguiProvider, Theme } from '@tamagui/core';
import { StatusBar } from 'react-native';
import { PortalProvider } from 'tamagui';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
   const colorScheme = useColorScheme();

   const [loaded] = useFonts({
      SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
      Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
      InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf')
   });

   useEffect(() => {
      if (loaded) {
         SplashScreen.hideAsync();
      }
   }, [loaded]);

   if (!loaded) {
      return null;
   }

   return (
      <TamaguiProvider config={tamaguiConfig}>
         <ThemeProvider value={DarkTheme}>
            <Theme name={colorScheme}>
               <PortalProvider shouldAddRootHost>
                  <SheetProvider>
                     <StatusBar
                        barStyle={'light-content'}
                        backgroundColor={`hsl(${themes.dark.primary.split(' ').join(',')})`}
                        showHideTransition="fade"
                     />
                     <Stack
                        screenOptions={{
                           animation: 'ios',
                           header(p) {
                              return <Header title={p.options.title} />;
                           }
                        }}
                     >
                        <Stack.Screen
                           name="(tabs)"
                           options={{ headerShown: false }}
                        />
                        <Stack.Screen
                           name="modals/edit-med"
                           options={{ presentation: 'containedModal' }}
                        />
                        <Stack.Screen
                           name="modals/new-med"
                           options={{
                              presentation: 'containedModal',
                              title: 'New medicine'
                           }}
                        />
                        <Stack.Screen name="+not-found" />
                     </Stack>
                  </SheetProvider>
               </PortalProvider>
            </Theme>
         </ThemeProvider>
      </TamaguiProvider>
   );
}
