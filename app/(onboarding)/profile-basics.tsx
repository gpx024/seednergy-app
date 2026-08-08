import { ScreenStub } from "@/src/ui/ScreenStub";

export default function ProfileBasicsScreen() {
  return <ScreenStub titleKey="screens.profileBasics.title" descriptionKey="screens.profileBasics.description" links={[{ href: "/(onboarding)/how-it-works", labelKey: "actions.continue" }]} />;
}
