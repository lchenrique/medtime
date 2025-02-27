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
import { useModalStore } from '@/stores/modal-store'
import { X } from 'lucide-react';

export function Modal() {
  const { isOpen, content, title, close } = useModalStore()


  return (

    <IonModal isOpen={isOpen} onIonModalDidDismiss={close}
      id="modal"
      trigger="open-modal"
      handleBehavior="cycle"
    >
      <IonHeader className='ion-no-border'>
        <IonToolbar >
          <IonTitle className='px-3'>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={close}>
              <X className="w-5 h-5" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ">
        {content}
      </IonContent>
    </IonModal>

  )
} 