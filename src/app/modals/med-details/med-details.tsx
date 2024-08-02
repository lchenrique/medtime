import type { Medicine } from '@/@types/medicine';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Tabs } from '@/components/tabs/tabs';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { H5 } from 'tamagui';
import { MedDayTab } from './med-day-tab';
import { MedDetailsHeader } from './med-details-header';

export default function MedDetails({ data }: { data?: Partial<Medicine> }) {
   const [mounted, setMounted] = useState(false);
   const [active, setActive] = useState('1');

   const local = useLocalSearchParams<any>();
   const med: Medicine | undefined = local.medicineId
      ? JSON.parse(local.medicineId)
      : data || undefined;

   useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
   }, []);

   const handleValueChange = (value: string) => {
      setActive(value);
   };

   return (
      <ParallaxScrollView headerImage={<MedDetailsHeader title={med?.name} />}>
         {mounted && (
            <Tabs
               onValueChange={handleValueChange}
               tabs={Array.from({ length: 6 }).map((_, i) => {
                  return (
                     <MedDayTab
                        key={i}
                        value={String(i)}
                        active={active === String(i)}
                     />
                  );
               })}
            >
               <Tabs.Content value={'0'} justifyContent="center">
                  <H5 textAlign="center">{'teste'}</H5>
               </Tabs.Content>
               <Tabs.Content value={'1'} justifyContent="center">
                  <H5 textAlign="center">{'teste2'}</H5>
               </Tabs.Content>
            </Tabs>
         )}
      </ParallaxScrollView>
   );
}
