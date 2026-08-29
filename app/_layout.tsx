import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { CrimsonText_400Regular_Italic, CrimsonText_600SemiBold, CrimsonText_700Bold } from "@expo-google-fonts/crimson-text";

import "@/src/i18n";
import { AuthProvider } from "@/src/presentation/auth/AuthProvider";
import { OnboardingProvider } from "@/src/presentation/onboarding/OnboardingProvider";
import { NotificationProvider } from "@/src/presentation/notifications/NotificationProvider";
import { withMonitoring } from "@/src/presentation/monitoring/MonitoringBoundary";
import { ConnectivityProvider } from "@/src/presentation/network/ConnectivityProvider";

export const unstable_settings = {
  initialRouteName: "index"
};

function RootLayout() {
  const [fontsLoaded] = useFonts({ CrimsonText_400Regular_Italic, CrimsonText_600SemiBold, CrimsonText_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  if (!fontsLoaded) {
    return null;
  }

  return <ConnectivityProvider><AuthProvider><OnboardingProvider><NotificationProvider><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(onboarding)" /><Stack.Screen name="(tabs)" /></Stack></NotificationProvider></OnboardingProvider></AuthProvider></ConnectivityProvider>;
}

export default withMonitoring(RootLayout);
