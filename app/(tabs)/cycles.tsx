import { ScreenStub } from "@/src/ui/ScreenStub";

export default function CyclesScreen() {
  return <ScreenStub titleKey="screens.cycles.title" descriptionKey="screens.cycles.description" links={[{ href: "/cycle/placeholder", labelKey: "actions.viewCycle" }]} />;
}
