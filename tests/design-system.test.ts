import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { colors } from "@/src/ui/tokens/colors";
import { semanticTokens } from "@/src/ui/tokens/semantic";
import { spacing } from "@/src/ui/tokens/spacing";
import { typography } from "@/src/ui/tokens/typography";

describe("Seednergy design system contract", () => {
  it("uses the approved August 2026 palette and type families", () => {
    expect(semanticTokens.tokenStatus).toBe("home-refresh-2026-08-27");
    expect(colors.background).toBe("#EEECE7");
    expect(colors.raised).toBe("#F3F1EC");
    expect(colors.brand).toBe("#472C2A");
    expect(colors.olive).toBe("#6D7A38");
    expect(colors.seed).toBe("#504B24");
    expect(colors.accent).toBe("#A66C6F");
    expect(colors.progressText).toBe("#6A6960");
    expect(colors.highlight).toBe("#70484A");
    expect(colors.coachLabel).toBe("#DCDAD5");
    expect(colors.tabActiveSurface).toBe("#E5E3DE");
    expect(colors.tabInactiveSurface).toBe("#DCDAD5");
    expect(colors.tabActiveContent).toBe("#846967");
    expect(typography.display.fontFamily).toBe("CrimsonText_600SemiBold");
    expect(typography.body.fontFamily).toBe("Inter_400Regular");
    expect(typography.button.fontFamily).toBe("CrimsonText_700Bold");
    expect(typography.button).not.toHaveProperty("fontWeight");
    expect(typography.button.fontSize).toBe(20);
    expect(typography.displayLarge.lineHeight).toBeCloseTo(typography.displayLarge.fontSize * 1.2, 5);
    expect(typography.label.letterSpacing).toBe(0.66);
    expect(typography.tab.fontFamily).toBe("Inter_600SemiBold");
    expect(typography.display).not.toHaveProperty("fontWeight");
  });

  it("exposes the approved spacing scale for components", () => {
    expect(spacing.gutter).toBe(16);
    expect(spacing.cardPadding).toBe(16);
    expect(spacing.sectionGap).toBe(24);
  });

  it("keeps the handoff tokens on the current palette", () => {
    const handoffTokens = readFileSync(resolve("design-system/handoff/tokens.css"), "utf8");

    expect(handoffTokens).toContain("--sd-canvas:      #EEECE7");
    expect(handoffTokens).toContain("--sd-card:        #F3F1EC");
    expect(handoffTokens).toContain("--sd-inv-ground:  #472C2A");
    expect(handoffTokens).not.toMatch(/#(?:E8E2D4|EFEADF|71763B|5C7F3F|2F3D28|9E3521)/i);
  });

  it("keeps back navigation branded and the wordmark recoverable", () => {
    const backHeader = readFileSync(resolve("src/ui/components/BackHeader.tsx"), "utf8");
    const wordmark = readFileSync(resolve("src/ui/components/BrandWordmark.tsx"), "utf8");
    const home = readFileSync(resolve("app/(tabs)/home.tsx"), "utf8");

    expect(backHeader).toContain("<BrandMark");
    expect(backHeader).toContain('name="arrow-back"');
    expect(wordmark).toContain("renderFailed");
    expect(wordmark).toContain(">Seednergy</Text>");
    expect(home).toContain('onProfilePress={() => router.push("/(tabs)/profile")}');
    expect(home).toContain('t("main.greeting", { name })');
  });

  it("keeps Profile behind the Home avatar and makes Garden the fourth primary tab", () => {
    const tabs = readFileSync(resolve("app/(tabs)/_layout.tsx"), "utf8");
    const garden = readFileSync(resolve("app/(tabs)/garden.tsx"), "utf8");

    expect(tabs).toContain('{ name: "garden", label: "tabs.garden", icon: "leaf-outline" }');
    expect(tabs).toContain('<Tabs.Screen name="profile" options={{ href: null }} />');
    expect(garden).toContain('type GardenView = "private" | "public"');
    expect(garden).toContain('t("garden.comingSoon")');
    expect(garden).not.toContain("publicGardenRepository");
  });

  it("applies Review 06 headers, status dots and raised active navigation", () => {
    const home = readFileSync(resolve("app/(tabs)/home.tsx"), "utf8");
    const cycles = readFileSync(resolve("app/(tabs)/cycles.tsx"), "utf8");
    const explore = readFileSync(resolve("app/(tabs)/explore.tsx"), "utf8");
    const garden = readFileSync(resolve("app/(tabs)/garden.tsx"), "utf8");
    const header = readFileSync(resolve("src/ui/components/BrandHeader.tsx"), "utf8");
    const sectionHeader = readFileSync(resolve("src/ui/components/SectionHeader.tsx"), "utf8");
    const badge = readFileSync(resolve("src/ui/components/StageBadge.tsx"), "utf8");
    const tabs = readFileSync(resolve("app/(tabs)/_layout.tsx"), "utf8");

    expect(header).toContain("wordmarkWidth = 125");
    expect(header).toContain("fontSize: 14");
    expect(home).toContain("profileImageUri={profile.avatarUrl}");
    expect(sectionHeader).toContain("<BrandMark width={22}");
    expect(cycles).toContain("<SectionHeader");
    expect(explore).toContain("<SectionHeader");
    expect(garden).toContain("<SectionHeader");
    expect(garden).not.toContain('t("garden.eyebrow")');
    expect(badge).toContain("dotAttention");
    expect(badge).toContain("dotActive");
    expect(tabs).toContain("borderRadius: tokens.radii.card");
    expect(tabs).toContain("...tokens.elevation.card");
    expect(tabs).toContain("borderTopColor:");
    expect(tabs).toContain("borderBottomColor:");
    expect(tabs).toContain("elevation: 9");
  });

  it("uses a persistent private avatar with an editable photo placeholder", () => {
    const header = readFileSync(resolve("src/ui/components/BrandHeader.tsx"), "utf8");
    const profile = readFileSync(resolve("app/(tabs)/profile.tsx"), "utf8");
    const avatar = readFileSync(resolve("src/ui/components/ProfileAvatar.tsx"), "utf8");
    const hook = readFileSync(resolve("src/presentation/profile/useProfile.ts"), "utf8");
    const migration = readFileSync(resolve("supabase/migrations/202608280018_profile_avatar.sql"), "utf8");

    expect(profile).toContain("profile.chooseAvatar()");
    expect(header).toContain("<ProfileAvatar showEditHint");
    expect(avatar).toContain('name="person-outline"');
    expect(avatar).toContain('name="camera-outline"');
    expect(hook).toContain("uploadProfile");
    expect(hook).toContain("createSignedUrl");
    expect(migration).toContain("avatar_path");
    expect(migration).toContain("/profile/%");
  });
});
