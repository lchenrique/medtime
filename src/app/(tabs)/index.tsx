import NextAppointment from '@/components/next-appointment/next-appointment';
import NextMedicines from '@/components/next-medicines/next-medicines';
import { Separator } from '@/components/separator/separator';
import { ThemedView } from '@/components/ThemedView';
import Wellcome from '@/components/wellcome/wellcome';
import { medfake } from '@/fake/med-fale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'tamagui';

export default function HomeScreen() {
   return (
      <SafeAreaView style={{ flex: 1 }}>
         <ScrollView bg="$background">
            <ThemedView p="$4" pb="$15">
               <Wellcome />
               <Separator />
               <NextAppointment />
               <View mt="$4">
                  <NextMedicines data={medfake().medicines} />
               </View>
            </ThemedView>
         </ScrollView>
      </SafeAreaView>
   );
}
