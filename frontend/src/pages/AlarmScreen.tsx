import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetMedicationsId } from '@/api/generated/medications/medications';
import { alarmService } from '@/lib/alarm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AlarmScreenProps {
  medication: {
    id: string;
    name: string;
    dosage: string;
  };
  onTake: () => void;
  onSnooze: () => void;
}

export function AlarmScreen({ medication, onTake, onSnooze }: AlarmScreenProps) {
  useEffect(() => {
    // Previne que o usuário saia da tela sem interagir
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-[90%] max-w-md">
        <CardHeader>
          <CardTitle>Hora do Medicamento!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold">{medication.name}</p>
          <p className="text-lg">{medication.dosage}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onSnooze}>
            Adiar
          </Button>
          <Button onClick={onTake}>
            Tomar Agora
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 