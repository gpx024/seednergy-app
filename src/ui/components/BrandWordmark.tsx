import { useAssets } from "expo-asset";
import { useState } from "react";
import { Text } from "react-native";
import { SvgUri } from "react-native-svg";

import { tokens } from "@/src/ui/tokens";

interface BrandWordmarkProps {
  width?: number;
  color?: string;
}

const wordmarkModule = require("../../../assets/brand/wordmark-olive.svg");

export function BrandWordmark({ width = 112, color = tokens.colors.brand }: BrandWordmarkProps) {
  const [assets, assetError] = useAssets([wordmarkModule]);
  const [renderFailed, setRenderFailed] = useState(false);
  const asset = assets?.[0];

  if (!asset || assetError || renderFailed) {
    return <Text accessibilityLabel="Seednergy" numberOfLines={1} style={{ color, fontFamily: "CrimsonText_600SemiBold", fontSize: width / 4.7, lineHeight: width / 4.2 }}>Seednergy</Text>;
  }

  return <SvgUri accessibilityLabel="Seednergy" height={width / 4.68} onError={() => setRenderFailed(true)} uri={asset.localUri ?? asset.uri} width={width} />;
}
