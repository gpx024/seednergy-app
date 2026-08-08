import { ScreenStub } from "@/src/ui/ScreenStub";

export default function HowItWorksScreen() {
  return <ScreenStub titleKey="screens.howItWorks.title" descriptionKey="screens.howItWorks.description" links={[{ href: "/(onboarding)/seed-selection", labelKey: "actions.continue" }]} />;
}
