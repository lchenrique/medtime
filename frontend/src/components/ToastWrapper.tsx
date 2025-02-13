
import { useToast } from "@/stores/use-toast"
import { IonToast } from "@ionic/react"

export const ToastWrapper = () => {
    const { toasts, close } = useToast()

    return toasts.map((toast) => (
        <IonToast
            key={toast.id}
            isOpen={true}
            message={toast.title}
            duration={toast.duration}
            onDidDismiss={() => close(toast.id)}
            className={`custom-toast ${toast.type}`}
            position="top"
            buttons={[
                {
                  text: 'Fechar',
                  role: 'cancel',
                  handler: () => {
                    close(toast.id)
                  },
                },
              ]}
        />
    ))
} 
