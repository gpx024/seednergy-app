import { Asset } from "expo-asset";
import { SvgUri } from "react-native-svg";

import { tokens } from "@/src/ui/tokens";

interface BrandWordmarkProps {
  width?: number;
  color?: string;
}

const wordmark = Asset.fromModule(require("../../../assets/brand/wordmark-olive.svg"));

export function BrandWordmark({ width = 112, color = tokens.colors.brand }: BrandWordmarkProps) {
  return <SvgUri accessibilityLabel="Seednergy" fill={color} height={width / 4.68} uri={wordmark.uri} width={width} />;
}
