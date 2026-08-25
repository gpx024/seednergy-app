import type { ImageSourcePropType } from "react-native";

import type { SeedAsset } from "@/src/domain/content";

const bundledImages: Record<Extract<SeedAsset, { kind: "bundled" }>["key"], ImageSourcePropType> = {
  cress: require("../../../assets/images/temporary/cress.png"),
  "pea-shoots": require("../../../assets/images/temporary/pea-shoots.png"),
  "radish-microgreens": require("../../../assets/images/temporary/radish-microgreens.png"),
  "broccoli-microgreens": require("../../../assets/images/temporary/broccoli-microgreens.png"),
  basil: require("../../../assets/images/temporary/basil.png")
};

export function resolveSeedImage(assets: readonly SeedAsset[]): ImageSourcePropType | undefined {
  const asset = assets[0];
  if (!asset) return undefined;
  return asset.kind === "remote" ? { uri: asset.url } : bundledImages[asset.key];
}
