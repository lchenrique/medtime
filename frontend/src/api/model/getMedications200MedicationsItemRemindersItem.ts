/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * MedTime API
 * API do sistema MedTime para gestão de medicamentos e lembretes
 * OpenAPI spec version: 1.0.0
 */

export type GetMedications200MedicationsItemRemindersItem = {
  id: string;
  scheduledFor: string;
  taken: boolean;
  /** @nullable */
  takenAt: string | null;
  skipped: boolean;
  /** @nullable */
  skippedReason: string | null;
  createdAt: string;
  updatedAt: string;
};
