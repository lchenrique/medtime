/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * MedTime API
 * API do sistema MedTime para gestão de medicamentos e lembretes
 * OpenAPI spec version: 1.0.0
 */
import type { GetMedicationsId200RemindersItem } from './getMedicationsId200RemindersItem';

export type GetMedicationsId200 = {
  id: string;
  name: string;
  /** @nullable */
  description: string | null;
  startDate: string;
  /** @nullable */
  duration: number | null;
  interval: number;
  isRecurring: boolean;
  totalQuantity: number;
  remainingQuantity: number;
  unit: string;
  dosageQuantity: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  reminders: GetMedicationsId200RemindersItem[];
};
