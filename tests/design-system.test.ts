import { describe, expect, it } from "vitest";

import { colors } from "@/src/ui/tokens/colors";
import { semanticTokens } from "@/src/ui/tokens/semantic";
import { spacing } from "@/src/ui/tokens/spacing";
import { typography } from "@/src/ui/tokens/typography";

describe("Seednergy design system contract", () => {
  it("uses the approved v5 palette and type families", () => {
    expect(semanticTokens.tokenStatus).toBe("handoff-v5");
    expect(colors.canvas).toBe("#E8E2D4");
    expect(colors.card).toBe("#F4F1E9");
    expect(colors.forest).toBe("#2F3D28");
    expect(colors.terracottaText).toBe("#B25F35");
    expect(typography.display.fontFamily).toBe("CrimsonText_600SemiBold");
    expect(typography.body.fontFamily).toBe("Inter_400Regular");
    expect(typography.button.fontFamily).toBe("CrimsonText_700Bold");
    expect(typography.tab.fontFamily).toBe("Inter_600SemiBold");
    expect(typography.display).not.toHaveProperty("fontWeight");
  });

  it("exposes the approved spacing scale for components", () => {
    expect(spacing.gutter).toBe(20);
    expect(spacing.cardPadding).toBe(16);
    expect(spacing.sectionGap).toBe(24);
  });
});
