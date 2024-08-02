import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
   interpolate,
   useAnimatedRef,
   useAnimatedStyle,
   useScrollViewOffset
} from 'react-native-reanimated';

import { ScrollView, useTheme, View } from 'tamagui';
const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
   headerImage?: ReactElement;
}>;

export default function ParallaxScrollView({ children, headerImage }: Props) {
   const scrollRef = useAnimatedRef<Animated.ScrollView>();
   const scrollOffset = useScrollViewOffset(scrollRef);

   const headerAnimatedStyle = useAnimatedStyle(() => {
      return {
         transform: [
            {
               translateY: interpolate(
                  scrollOffset.value,
                  [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                  [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
               )
            },
            {
               scale: interpolate(
                  scrollOffset.value,
                  [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                  [2, 1, 1]
               )
            }
         ]
      };
   });

   const theme = useTheme();
   return (
      <View
         style={styles.container}
         backgroundColor="$background"
         // $theme-dark={{ backgroundColor: "$background" }}
      >
         <ScrollView ref={scrollRef} scrollEventThrottle={16} flex={1}>
            <View
               bg="$primary"
               pt="$2"
               borderBottomLeftRadius={70}
               borderBottomRightRadius={70}
               style={[styles.header]}
            >
               {headerImage}
            </View>
            <View
               style={styles.content}
               backgroundColor="$card"
               borderRadius={'$5'}
               mx="$4"
               mt="$-15"
               shadowColor="#aaadad"
               shadowOffset={{
                  width: 0,
                  height: 12
               }}
               shadowOpacity={0.24}
               shadowRadius={13.84}
               elevationAndroid={17}
               flex={1}
               mb="$8"
            >
               {children}
            </View>
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1
   },
   background: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 300
   },
   header: {
      marginTop: -20,
      height: 230,
      overflow: 'hidden'
   },
   content: {
      flex: 1,
      padding: 8,
      gap: 16,
      overflow: 'hidden',
      paddingBottom: 80
   }
});
