import { IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
    title: string
    children?: React.ReactNode
    extra?: React.ReactNode
    onBack?: () => void
}

export function PageHeader({ title, children, extra, onBack }: PageHeaderProps) {
    return (
        <IonHeader className='ion-no-border sticky top-0 z-50 bg-background/95 backdrop-blur-md'>
            <IonToolbar>
                <div className="max-w-2xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {onBack && (
                          <IonButtons slot="start">
                            <Button
                              onClick={onBack}
                              variant="ghost"
                              size="icon"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                          </IonButtons>
                        )}

                        <IonTitle   className="text-foreground text-md font-bold px-2">{title}</IonTitle>
                        {children}
                    </div>
                </div>
            </IonToolbar>
            {extra}
        </IonHeader>
    )
}
