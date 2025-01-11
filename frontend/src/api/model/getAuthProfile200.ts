/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * MedTime API
 * API do sistema MedTime para gestão de medicamentos e lembretes
 * OpenAPI spec version: 1.0.0
 */

export type GetAuthProfile200 = {
  id: string;
  email: string;
  name: string;
  /** @nullable */
  fcmToken: string | null;
  tauriEnabled: boolean;
  whatsappEnabled: boolean;
  /** @nullable */
  whatsappNumber: string | null;
  telegramEnabled: boolean;
  /** @nullable */
  telegramChatId: string | null;
  createdAt: string;
  updatedAt: string;
};
