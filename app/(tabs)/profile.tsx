import { ScreenStub } from "@/src/ui/ScreenStub";

export default function ProfileScreen() {
  return <ScreenStub titleKey="screens.profile.title" descriptionKey="screens.profile.description" links={[{ href: "/settings", labelKey: "actions.openSettings" }, { href: "/paywall", labelKey: "actions.openPaywall" }]} />;
}
