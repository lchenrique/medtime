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
import { useRef, useState } from 'react'
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { X } from 'lucide-react';

export function Modal() {
  const { isOpen, content, title, close } = useModalStore()


  return (

    <IonModal isOpen={isOpen}>
      <IonHeader className='ion-no-border'>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={close}>
              <X className="w-5 h-5" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {content}
      </IonContent>
    </IonModal>

  )
} 