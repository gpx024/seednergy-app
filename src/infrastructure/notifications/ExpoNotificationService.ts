import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { cycleRepository } from "@/src/infrastructure/repositories/SupabaseCycleRepository";
import { featureFlags } from "@/src/config/features";
import { profileRepository } from "@/src/infrastructure/repositories/SupabaseProfileRepository";
import { supabase } from "@/src/infrastructure/supabase/client";
import type { NotificationPreferences, NotificationService } from "@/src/ports/NotificationService";

export class ExpoNotificationService implements NotificationService {
  async getPreferences(): Promise<NotificationPreferences> {
    const profile = await profileRepository.getMine();
    return profile?.notificationPreferences ?? defaults;
  }

  async enable(preferences: NotificationPreferences): Promise<void> {
    if (!featureFlags.pushNotifications) throw new Error("Push notifications are not enabled in this private build.");
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== "granted") throw new Error("Notifications are disabled for Seednergy in your phone settings.");
    await this.registerDevice();
    await this.save({ ...preferences, enabled: true });
    await this.refreshAllCycles();
  }

  async disable(preferences: NotificationPreferences): Promise<void> {
    await this.save({ ...preferences, enabled: false });
  }

  async syncExistingPermission(): Promise<void> {
    if (!featureFlags.pushNotifications) return;
    const permission = await Notifications.getPermissionsAsync();
    if (permission.status !== "granted") return;
    const preferences = await this.getPreferences();
    if (!preferences.enabled) return;
    await this.registerDevice();
    await this.refreshAllCycles();
  }

  async refreshCycle(cycleId: string): Promise<void> {
    const { error } = await supabase.rpc("refresh_cycle_notification", { p_cycle_id: cycleId });
    if (error) throw error;
  }

  private async refreshAllCycles(): Promise<void> {
    const cycles = await cycleRepository.getActive();
    await Promise.all(cycles.map((cycle) => this.refreshCycle(cycle.id)));
  }

  private async registerDevice(): Promise<void> {
    if (!Device.isDevice) throw new Error("Push notifications require a physical phone.");
    if (Platform.OS !== "android" && Platform.OS !== "ios") return;
    if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("cycle-actions", { name: "Cycle actions", importance: Notifications.AndroidImportance.DEFAULT });
    const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) throw new Error("The Expo project ID is unavailable.");
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    const { error } = await supabase.rpc("register_push_device", { p_expo_push_token: token.data, p_platform: Platform.OS });
    if (error) throw error;
  }

  private async save(preferences: NotificationPreferences): Promise<void> {
    const { error } = await supabase.rpc("update_notification_preferences", {
      p_enabled: preferences.enabled,
      p_frequency: preferences.frequency,
      p_quiet_start: preferences.quietStart,
      p_quiet_end: preferences.quietEnd
    });
    if (error) throw error;
  }
}

export const defaults: NotificationPreferences = { enabled: false, frequency: "daily", quietStart: "21:00", quietEnd: "08:00" };
export const notificationService = new ExpoNotificationService();
