/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * MedTime API
 * API do sistema MedTime para gestão de medicamentos e lembretes
 * OpenAPI spec version: 1.0.0
 */
import type { GetMedications200AnyOfThreeGroupsOnTimeItemMedicationsItemMedication } from './getMedications200AnyOfThreeGroupsOnTimeItemMedicationsItemMedication';
import type { GetMedications200AnyOfThreeGroupsOnTimeItemMedicationsItemReminder } from './getMedications200AnyOfThreeGroupsOnTimeItemMedicationsItemReminder';

export type GetMedications200AnyOfThreeGroupsOnTimeItemMedicationsItem = {
  medication: GetMedications200AnyOfThreeGroupsOnTimeItemMedicationsItemMedication;
  reminder: GetMedications200AnyOfThreeGroupsOnTimeItemMedicationsItemReminder;
  isLate: boolean;
};
