import { colors } from "@/src/ui/tokens/colors";
import { elevation } from "@/src/ui/tokens/elevation";
import { layout } from "@/src/ui/tokens/layout";
import { radii } from "@/src/ui/tokens/radii";
import { semanticTokens } from "@/src/ui/tokens/semantic";
import { spacing } from "@/src/ui/tokens/spacing";
import { typography } from "@/src/ui/tokens/typography";

export const tokens = { colors, elevation, layout, radii, semantic: semanticTokens, spacing, typography } as const;

export { colors, elevation, layout, radii, semanticTokens, spacing, typography };
