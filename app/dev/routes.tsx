import { ScreenStub } from "@/src/ui/ScreenStub";
import { featureFlags } from "@/src/config/features";

export default function DevelopmentRoutesScreen() {
  if (!featureFlags.developmentRoutes) {
    return <ScreenStub titleKey="screens.notFound.title" descriptionKey="screens.notFound.description" />;
  }

  return <ScreenStub titleKey="screens.devRoutes.title" descriptionKey="screens.devRoutes.description" links={[
    { href: "/dev/gallery", labelKey: "screens.gallery.title" },
    { href: "/(onboarding)/welcome", labelKey: "routes.welcome" },
    { href: "/home", labelKey: "tabs.home" },
    { href: "/cycles", labelKey: "tabs.cycles" },
    { href: "/explore", labelKey: "tabs.explore" },
    { href: "/garden", labelKey: "tabs.garden" },
    { href: "/profile", labelKey: "tabs.profile" },
    { href: "/cycle/placeholder", labelKey: "routes.cycleDetail" },
    { href: "/cycle/placeholder/check", labelKey: "routes.photoCheck" },
    { href: "/cycle/placeholder/harvest", labelKey: "routes.harvest" },
    { href: "/seeds/cress", labelKey: "routes.seedDetail" },
    { href: "/settings", labelKey: "routes.settings" },
    { href: "/paywall", labelKey: "routes.paywall" }
  ]} />;
}
