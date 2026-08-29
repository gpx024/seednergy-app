import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { CrimsonText_400Regular_Italic } from "@expo-google-fonts/crimson-text/400Regular_Italic";
import { CrimsonText_600SemiBold } from "@expo-google-fonts/crimson-text/600SemiBold";
import { CrimsonText_700Bold } from "@expo-google-fonts/crimson-text/700Bold";

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
