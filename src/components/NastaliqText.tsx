import { Text, type TextProps } from "react-native";

type Props = TextProps & {
  children: React.ReactNode;
  isRtl?: boolean;
};

export function NastaliqText({ style, children, isRtl, ...props }: Props) {
  return (
    <Text
      style={[
        isRtl && { writingDirection: "rtl" },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
