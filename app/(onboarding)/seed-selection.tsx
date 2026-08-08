import { ScreenStub } from "@/src/ui/ScreenStub";

export default function SeedSelectionScreen() {
  return <ScreenStub titleKey="screens.seedSelection.title" descriptionKey="screens.seedSelection.description" links={[{ href: "/home", labelKey: "actions.finish" }]} />;
}
