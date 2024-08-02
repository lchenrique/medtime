import { StyleSheet } from 'react-native';

import Icon from '@/components/icon/icon';
import { MedicineCard } from '@/components/medicine-card/medicine-card';
import { PageHeader } from '@/components/page/header';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { medfake } from '@/fake/med-fale';
import { Cross } from 'lucide-react-native';

export default function TabTwoScreen() {
   return (
      <ParallaxScrollView
         headerImage={
            <Icon
               icon={Cross}
               size={310}
               color="background"
               opacity={0.7}
               style={styles.headerImage}
            />
         }
      >
         <PageHeader title="My medicines" description="All medicines list" />
         {medfake().medicines.map((med, index) => {
            return (
               <MedicineCard
                  key={med.id}
                  name={med.name}
                  description={med.description || ''}
               />
            );
         })}
      </ParallaxScrollView>
   );
}

const styles = StyleSheet.create({
   headerImage: {
      color: '#808080',
      bottom: -30,
      left: -35,
      position: 'absolute'
   },
   titleContainer: {
      flexDirection: 'row',
      gap: 8
   }
});
