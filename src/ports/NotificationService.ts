export type NotificationFrequency = "daily" | "every_other_day" | "important_only";

export interface NotificationPreferences {
  enabled: boolean;
  frequency: NotificationFrequency;
  quietStart: string;
  quietEnd: string;
}

export interface NotificationService {
  getPreferences(): Promise<NotificationPreferences>;
  enable(preferences: NotificationPreferences): Promise<void>;
  disable(preferences: NotificationPreferences): Promise<void>;
  syncExistingPermission(): Promise<void>;
  refreshCycle(cycleId: string): Promise<void>;
}
