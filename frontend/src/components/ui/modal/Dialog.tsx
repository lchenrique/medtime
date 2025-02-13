import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonPage,
  IonItem
} from '@ionic/react'
import { X } from 'lucide-react';
import { useDialogStore } from '@/stores/use-deialog';

export function Dialog() {
  const { isOpen, content, title, close } = useDialogStore()


  return (

    <IonModal id="dialog" isOpen={isOpen} onIonModalDidDismiss={close}  >
      <IonHeader className='ion-no-border'>
        <IonToolbar >
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={close}>
              <X className="w-5 h-5" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="flex flex-col gap-4 p-6">
          {content}
        </div>
      </IonContent>
    </IonModal>

  )
} 