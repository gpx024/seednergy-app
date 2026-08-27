import { Redirect } from "expo-router";

export default function PrivateGardenCompatibilityRoute() {
  return <Redirect href="/(tabs)/garden" />;
}
