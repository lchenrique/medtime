import Icon from '@/components/icon/icon';
import { Tab } from '@/components/tabs/tab';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CheckCircle } from 'lucide-react-native';

export interface MedDayTabProps {
   value: string;
   active?: boolean;
}

const MedDayTab = ({ value, active }: MedDayTabProps) => {
   return (
      <Tab
         flex={1}
         value={value}
         h={120}
         w={100}
         mx="$1.5"
         borderRadius="$4"
         bg="$card"
      >
         <ThemedView
            h={108}
            w={98}
            animation={'quickest'}
            borderRadius="$4"
            borderWidth="$1"
            p="$2"
            scale={active ? 1.1 : 1}
            borderColor={active ? '$primary' : '$secondary'}
            bg={active ? '$accent' : '$card'}
         >
            <ThemedText fontSize={20} fontWeight="bold">
               Qui
            </ThemedText>
            <ThemedText fontSize={20} fontWeight="bold">
               10
            </ThemedText>
            <Icon icon={CheckCircle} color="primary" />
         </ThemedView>
      </Tab>
   );
};

export { MedDayTab };
