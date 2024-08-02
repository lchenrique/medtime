import {
   Card as TamaguiCard,
   type CardProps as TamaguiCardProps
} from 'tamagui';

export interface CardProps extends TamaguiCardProps {}

const Card = ({ children, ...rest }: CardProps) => {
   return (
      <TamaguiCard
         shadowColor="#aaa"
         shadowOffset={{
            width: 0,
            height: 12
         }}
         shadowOpacity={0.24}
         shadowRadius={13.84}
         elevationAndroid={17}
         bg="$card"
         p="$3"
         {...rest}
      >
         {children}
      </TamaguiCard>
   );
};

export default Card;
