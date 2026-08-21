import { Asset } from "expo-asset";
import { SvgUri } from "react-native-svg";

interface BrandWordmarkProps {
  width?: number;
}

const wordmark = Asset.fromModule(require("../../../assets/brand/wordmark-olive.svg"));

export function BrandWordmark({ width = 112 }: BrandWordmarkProps) {
  return <SvgUri accessibilityLabel="Seednergy" height={width / 4.68} uri={wordmark.uri} width={width} />;
}
