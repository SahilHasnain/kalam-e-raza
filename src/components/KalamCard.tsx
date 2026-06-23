import { Pressable, Text, View } from "react-native";
import { colors, borderRadius, spacing } from "@/src/constants/theme";
import { NastaliqText } from "./NastaliqText";
import { useLang } from "@/src/contexts/LangContext";
import { useKalamText } from "@/src/hooks/useKalamText";
import type { Kalam } from "@/src/types";

type Props = {
  kalam: Kalam;
  onPress?: () => void;
};

export function KalamCard({ kalam, onPress }: Props) {
  const { lang } = useLang();
  const { title } = useKalamText();
  const isRtl = lang === "ur" || lang === "hi";

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
          isRtl={isRtl}
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
