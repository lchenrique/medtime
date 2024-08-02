import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Avatar } from '../avatar/avatar';
import { Button } from '../button/button';
import Card from '../card/card';
import Icon from '../icon/icon';
import { Section } from '../section/section';

const NextAppointment = () => {
   return (
      <Section title="Next appointment">
         <Card p="$0" overflow="hidden">
            <LinearGradient
               style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%'
               }}
               start={{ x: 0, y: 0 }}
               end={{ x: 0.4, y: 0.7 }}
               colors={['#0a8073', '#14b8a6']}
            />
            <Button
               borderColor="$border"
               h="$10"
               flexDirection="row"
               alignItems="center"
               p="$3"
               style={{ backgroundColor: 'transparent' }}
            >
               <ThemedView
                  flexDirection="row"
                  gap="$3"
                  alignItems="center"
                  justifyContent="flex-start"
                  flex={1}
                  h="100%"
               >
                  <Avatar src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80" />
                  <ThemedView gap="$2">
                     <ThemedText type="subtitle" color="$primaryForeground">
                        Dr. Jessica Smith
                     </ThemedText>
                     <ThemedView
                        flexDirection="row"
                        alignItems="center"
                        gap="$2"
                     >
                        <Icon icon={Calendar} color="primaryForeground" />
                        <ThemedText color="$primaryForeground" fontSize="$4">
                           12th March, 12:00 PM
                        </ThemedText>
                     </ThemedView>
                  </ThemedView>
               </ThemedView>
               <Icon icon={ChevronRight} color="primaryForeground" />
            </Button>
         </Card>
      </Section>
   );
};

export default NextAppointment;
