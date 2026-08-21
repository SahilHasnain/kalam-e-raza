import { Pressable, View } from "react-native";
import { colors, borderRadius, spacing } from "@/src/constants/theme";
import { NastaliqText } from "./NastaliqText";
import { useKalamText } from "@/src/hooks/useKalamText";
import type { Kalam } from "@/src/types";

type Props = {
  kalam: Kalam;
  onPress?: () => void;
};

export function KalamCard({ kalam, onPress }: Props) {
  const { title, isRtl } = useKalamText();

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          backgroundColor: colors.white,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.gray200,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <NastaliqText
          isRtl={isRtl(kalam)}
          style={{
            fontSize: 18,
            color: colors.black,
            lineHeight: 30,
          }}
          numberOfLines={2}
        >
          {title(kalam)}
        </NastaliqText>
      </View>
    </Pressable>
  );
}
