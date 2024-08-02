import type { Medicine } from '@/@types/medicine';
import MedDetails from '@/app/modals/med-details/med-details';
import { useSheet } from '@/context/sheet';
import React from 'react';
import MedicineCardGroup from '../medicine-card/nedicine-card-group/medicine-card-group';
import { Section } from '../section/section';
import { ThemedView } from '../ThemedView';

export type NextMedicinesProps = {
   data: any[];
};

const NextMedicines = ({ data }: NextMedicinesProps) => {
   const { openSheet } = useSheet();
   const groupByNextHour = (medicines: Medicine[]) => {
      return medicines.reduce((acc: any, medicine) => {
         const nextHour = new Date(medicine.nextHour)
            .toISOString()
            .substring(11, 16); // Extraindo apenas a hora e minuto
         if (!acc[nextHour]) {
            acc[nextHour] = [];
         }
         acc[nextHour].push(medicine);
         return acc;
      }, {});
   };

   const groupedMedicines = groupByNextHour(data);

   const handleDetails = (med: Medicine) => {
      openSheet(<MedDetails data={{ name: med.name, id: med.id }} />);
   };

   return (
      <>
         <Section title="Medicines">
            <ThemedView alignSelf="center" gap="$2" w="100%">
               {Object.entries(groupedMedicines).map(([key, value]: any, i) => (
                  <MedicineCardGroup
                     key={key}
                     name={key}
                     items={value}
                     onItemPress={handleDetails}
                  />
               ))}
            </ThemedView>
         </Section>
      </>
   );
};

export default NextMedicines;
