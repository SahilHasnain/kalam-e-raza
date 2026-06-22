import { TextInput, View } from "react-native";
import { colors, borderRadius, spacing } from "@/src/constants/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search kalams...",
}: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray200,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        style={{
          fontSize: 16,
          color: colors.black,
          paddingVertical: spacing.xs,
        }}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
