import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MedicationCardProps {
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
  onClick?: () => void;
  isLate?: boolean;
  showTakeButton?: boolean;
  onTake?: () => void;
}

export function MedicationCard({
  medication,
  onClick,
  isLate = false,
  showTakeButton = false,
  onTake,
}: MedicationCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-muted/50",
        isLate && "bg-red-50 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-950/30"
      )}
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">
            {medication.name}
          </span>
          {medication.remainingQuantity <= 10 && (
            <span className="text-xs font-medium text-destructive">
              Estoque baixo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {medication.dosageQuantity} {medication.unit}
          </span>
          {medication.description && (
            <>
              <span>•</span>
              <span>{medication.description}</span>
            </>
          )}
        </div>
      </div>

      {showTakeButton && (
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onTake?.();
          }}
        >
          <Check className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
} 