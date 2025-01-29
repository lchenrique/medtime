import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Pill, AlertCircle } from "lucide-react";

interface MedicationDetailsProps {
  medication: {
    id: string;
    name: string;
    dosageQuantity: number;
    unit: string;
    description: string | null;
    remainingQuantity: number;
    reminders: Array<{
      id: string;
      scheduledFor: string;
      taken: boolean;
      takenAt: string | null;
      skipped: boolean;
      skippedReason: string | null;
      createdAt: string;
      updatedAt: string;
      medicationId: string;
      notified: boolean;
    }>;
  };
}

export function MedicationDetails({ medication }: MedicationDetailsProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium">Detalhes do Medicamento</h3>
        <p className="text-sm text-muted-foreground">
          Informações sobre dosagem e horários
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <Pill className="w-5 h-5 mt-0.5 text-violet-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Dosagem</p>
              <p className="text-sm text-muted-foreground">
                {medication.dosageQuantity} {medication.unit}
              </p>
              {medication.description && (
                <p className="text-sm text-muted-foreground">
                  {medication.description}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-4">
            <Clock className="w-5 h-5 mt-0.5 text-violet-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Próximas doses</p>
              <div className="space-y-2">
                {medication.reminders
                  .filter((reminder) => !reminder.taken && !reminder.skipped)
                  .map((reminder) => (
                    <p key={reminder.id} className="text-sm text-muted-foreground">
                      {new Date(reminder.scheduledFor).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </Card>

        {medication.remainingQuantity <= 10 && (
          <Card className="p-4 border-destructive">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 mt-0.5 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Estoque Baixo
                </p>
                <p className="text-sm text-destructive/80">
                  Restam apenas {medication.remainingQuantity} {medication.unit}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" className="w-full">
          Editar Medicamento
        </Button>
      </div>
    </div>
  );
} 