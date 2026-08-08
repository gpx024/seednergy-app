import { ScreenStub } from "@/src/ui/ScreenStub";

export default function WelcomeScreen() {
  return <ScreenStub titleKey="screens.welcome.title" descriptionKey="screens.welcome.description" links={[{ href: "/(onboarding)/profile-basics", labelKey: "actions.continue" }]} />;
}
