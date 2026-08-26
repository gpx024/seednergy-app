import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { type PropsWithChildren, useEffect } from "react";
import { Platform } from "react-native";

import { notificationService } from "@/src/infrastructure/notifications/ExpoNotificationService";
import { useAuth } from "@/src/presentation/auth/AuthProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false })
});

export function NotificationProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) void notificationService.syncExistingPermission().catch(() => undefined);
  }, [session]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const open = (response: Notifications.NotificationResponse) => {
      const url = response.notification.request.content.data.url;
      if (typeof url === "string" && /^\/cycle\/[0-9a-f-]+$/i.test(url)) router.push(url as never);
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => { if (response) open(response); })
      .catch(() => undefined);
    return () => subscription.remove();
  }, [router]);

  return children;
}
