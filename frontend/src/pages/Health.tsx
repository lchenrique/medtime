import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'
import { useDrawer } from '@/hooks/useDrawer'
import { EditProfileSheet } from '@/components/EditProfileSheet'
import { Heart, Pill, Activity, AlertCircle, FileText, PenSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSheetStore } from '@/stores/sheet-store'
import { useModalStore } from '@/stores/modal-store'
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/react'
import { PageHeader } from '@/components/PageHeader'

export function Health() {
  const { user } = useUserStore()
  const open = useModalStore(state => state.open)

  if (!user) return null

  return (
    <IonPage>
      <PageHeader title='Informações de Saúde' onBack={() => window.history.back()}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            open({
              title: 'Editar Informações de Saúde',
              content: <EditProfileSheet />
            })
          }}
          className="text-violet-600 dark:text-violet-400"
        >
          <PenSquare className="w-5 h-5" />
        </Button>

      </PageHeader>


      <IonContent>
        <div className="max-w-2xl mx-auto px-4 pb-20">

          {/* Lista de Condições */}
          <div className="divide-y divide-border">
            {/* Diabetes */}
            <div className="flex items-center gap-4 p-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                user.isDiabetic
                  ? "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
                  : "bg-muted text-muted-foreground"
              )}>
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">Diabetes</h3>
                  <Badge variant={user.isDiabetic ? "default" : "secondary"} className="text-xs">
                    {user.isDiabetic ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                {user.isDiabetic && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Você possui diabetes
                  </p>
                )}
              </div>
            </div>

            {/* Condição Cardíaca */}
            <div className="flex items-center gap-4 p-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                user.hasHeartCondition
                  ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
              )}>
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">Condição Cardíaca</h3>
                  <Badge variant={user.hasHeartCondition ? "default" : "secondary"} className="text-xs">
                    {user.hasHeartCondition ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                {user.hasHeartCondition && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Você possui uma condição cardíaca
                  </p>
                )}
              </div>
            </div>

            {/* Hipertensão */}
            <div className="flex items-center gap-4 p-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                user.hasHypertension
                  ? "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
              )}>
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">Hipertensão</h3>
                  <Badge variant={user.hasHypertension ? "default" : "secondary"} className="text-xs">
                    {user.hasHypertension ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                {user.hasHypertension && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Você possui hipertensão
                  </p>
                )}
              </div>
            </div>

            {/* Alergias */}
            {user.allergies && (
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">Alergias</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.allergies}
                  </p>
                </div>
              </div>
            )}

            {/* Observações */}
            {user.observations && (
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-950/50 flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">Observações</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.observations}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}