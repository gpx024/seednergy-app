import { ScreenStub } from "@/src/ui/ScreenStub";

export default function ExploreScreen() {
  return <ScreenStub titleKey="screens.explore.title" descriptionKey="screens.explore.description" links={[{ href: "/seeds/cress", labelKey: "actions.viewSeed" }]} />;
}
