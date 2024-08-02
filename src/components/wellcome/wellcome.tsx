import React from 'react';
import { View } from 'tamagui';
import { Avatar } from '../avatar/avatar';
import { HelloWave } from '../HelloWave';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

const Wellcome = () => {
   return (
      <ThemedView
         flexDirection="row"
         alignItems="center"
         justifyContent="space-between"
         p="$2"
      >
         <View>
            <View
               flexDirection="row"
               alignItems="center"
               justifyContent="space-between"
            >
               <View flexDirection="row" alignItems="center">
                  <ThemedText type="title">Hello, Carlos</ThemedText>
                  <HelloWave />
               </View>
            </View>
            <ThemedText opacity={0.7} type="subtitle">
               How you feeling today?
            </ThemedText>
         </View>

         <View flexDirection="row" alignItems="center">
            <Avatar src={'https://github.com/lchenrique.png'} />
         </View>
      </ThemedView>
   );
};

export default Wellcome;
