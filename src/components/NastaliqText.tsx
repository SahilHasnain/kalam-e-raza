import { Text, type TextProps } from "react-native";
import { FONT_DEVANAGARI, FONT_NASTALIQ } from "@/src/constants/fonts";

type Props = TextProps & {
  children: React.ReactNode;
  isRtl?: boolean;
};

export function NastaliqText({ style, children, isRtl, ...props }: Props) {
  const content = typeof children === "string" ? children : "";
  const isUrdu = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(content);
  const isHindi = /[\u0900-\u097F]/.test(content);

  return (
    <Text
      style={[
        isRtl && { writingDirection: "rtl" },
        isUrdu && { fontFamily: FONT_NASTALIQ },
        isHindi && { fontFamily: FONT_DEVANAGARI },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
