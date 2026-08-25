import { Redirect } from "expo-router";

import { useAuth } from "@/src/presentation/auth/AuthProvider";

export default function IndexRoute() {
  const { loading, session } = useAuth();
  if (loading) return null;
  return <Redirect href={session ? "/(tabs)/home" : "/(onboarding)/welcome"} />;
}
