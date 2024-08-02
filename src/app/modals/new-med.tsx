import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { MedForm } from '@/forms/med-form';
import { useEffect, useState } from 'react';

export default function TabTwoScreen() {
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
   }, []);

   return <ParallaxScrollView>{mounted && <MedForm />}</ParallaxScrollView>;
}

const styles = StyleSheet.create({
   headerImage: {
      height: 270,
      width: '100%',
      marginTop: 50,
      bottom: 0
   },
   titleContainer: {
      flexDirection: 'row',
      gap: 8
   }
});
