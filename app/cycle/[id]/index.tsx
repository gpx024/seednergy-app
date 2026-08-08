import { ScreenStub } from "@/src/ui/ScreenStub";

export default function CycleDetailScreen() {
  return <ScreenStub titleKey="screens.cycleDetail.title" descriptionKey="screens.cycleDetail.description" links={[{ href: "/cycle/placeholder/check", labelKey: "actions.openPhotoCheck" }, { href: "/cycle/placeholder/harvest", labelKey: "actions.openHarvest" }]} />;
}
