import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'
import { useDrawer } from '@/hooks/useDrawer'
import { EditProfileSheet } from '@/components/EditProfileSheet'
import { Heart, Pill, Activity, AlertCircle, FileText, PenSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Health() {
  const { user } = useUserStore()
  const { open } = useDrawer()

  if (!user) return null

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Informações de Saúde</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          onClick={() => {
            open({
              title: 'Editar Informações de Saúde',
              content: <EditProfileSheet />
            })
          }}
        >
          <PenSquare className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className={cn(
          "p-4 border-2 transition-colors",
          user.isDiabetic ? "border-primary bg-primary/5" : "border-muted"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              user.isDiabetic ? "bg-primary/10" : "bg-muted"
            )}>
              <Pill className={cn(
                "h-5 w-5",
                user.isDiabetic ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <Label>Diabetes</Label>
              <Badge variant={user.isDiabetic ? "default" : "secondary"} className="ml-2">
                {user.isDiabetic ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-4 border-2 transition-colors",
          user.hasHeartCondition ? "border-primary bg-primary/5" : "border-muted"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              user.hasHeartCondition ? "bg-primary/10" : "bg-muted"
            )}>
              <Heart className={cn(
                "h-5 w-5",
                user.hasHeartCondition ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <Label>Condição Cardíaca</Label>
              <Badge variant={user.hasHeartCondition ? "default" : "secondary"} className="ml-2">
                {user.hasHeartCondition ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-4 border-2 transition-colors",
          user.hasHypertension ? "border-primary bg-primary/5" : "border-muted"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              user.hasHypertension ? "bg-primary/10" : "bg-muted"
            )}>
              <Activity className={cn(
                "h-5 w-5",
                user.hasHypertension ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <Label>Hipertensão</Label>
              <Badge variant={user.hasHypertension ? "default" : "secondary"} className="ml-2">
                {user.hasHypertension ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {user.allergies && (
          <div className="flex gap-3 items-start p-4 rounded-lg bg-muted/30">
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <Label>Alergias</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user.allergies}
              </p>
            </div>
          </div>
        )}

        {user.observations && (
          <div className="flex gap-3 items-start p-4 rounded-lg bg-muted/30">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <Label>Observações</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {user.observations}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 