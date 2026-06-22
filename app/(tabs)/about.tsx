import { View, Text, ScrollView } from "react-native";
import { colors, spacing, borderRadius, fontSize } from "@/src/constants/theme";
import { NastaliqText } from "@/src/components/NastaliqText";
import { LangSwitcher } from "@/src/components/LangSwitcher";
import { kalams } from "@/src/data";
import { useT } from "@/src/hooks/useT";
import { useLang } from "@/src/contexts/LangContext";

export default function AboutScreen() {
  const _ = useT();
  const { lang } = useLang();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.cream }}
      contentContainerStyle={{ paddingBottom: spacing["5xl"] }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing["5xl"],
          paddingBottom: spacing["3xl"],
        }}
      >
        <Text style={{ fontSize: fontSize["2xl"], fontWeight: "700", color: colors.white }}>
          {_("about")}
        </Text>
      </View>

      {/* Language Switcher */}
      <View style={{ marginHorizontal: spacing.xl, marginTop: -spacing.xl, alignItems: "center" }}>
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.gray200,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: fontSize.sm, fontWeight: "600", color: colors.gray500, marginBottom: spacing.sm }}>
            {_("language")}
          </Text>
          <LangSwitcher />
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          backgroundColor: colors.white,
          marginHorizontal: spacing.xl,
          marginTop: spacing.lg,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.gray200,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: fontSize["3xl"], fontWeight: "800", color: colors.primary }}>
          {kalams.length}
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.gray500, marginTop: spacing.xs }}>
          {_("kalams")}
        </Text>
      </View>

      {/* Bio */}
      <View
        style={{
          marginHorizontal: spacing.xl,
          marginTop: spacing["2xl"],
          backgroundColor: colors.white,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.gray200,
        }}
      >
        <NastaliqText
          isRtl
          style={{ fontSize: 24, color: colors.primary, textAlign: "center", lineHeight: 38 }}
        >
          اعلیٰ حضرت امام احمد رضا خان
        </NastaliqText>
        <Text style={{ fontSize: fontSize.sm, color: colors.gray500, textAlign: "center", marginTop: spacing.xs }}>
          Imam Ahmed Raza Khan Barelvi (1856–1921)
        </Text>

        <View
          style={{
            width: 60,
            height: 3,
            backgroundColor: colors.gold,
            alignSelf: "center",
            marginVertical: spacing.lg,
            borderRadius: 2,
          }}
        />

        <Text style={{ fontSize: fontSize.base, color: colors.gray700, lineHeight: 24 }}>
          {lang === "ur"
            ? "امام احمد رضا خان، جنہیں اعلیٰ حضرت کے نام سے جانا جاتا ہے، ایک عظیم اسلامی عالم، فقیہ، ماہر الہیات اور شاعر تھے۔ وہ بریلی، ہندوستان سے تعلق رکھتے تھے اور بریلوی تحریک کے بانی ہیں۔ انہوں نے مختلف اسلامی علوم پر 1000 سے زائد کتابیں تصنیف کیں۔"
            : lang === "hi"
              ? "इमाम अहमद रज़ा ख़ान, जिन्हें आला हज़रत के नाम से जाना जाता है, एक महान इस्लामी विद्वान, न्यायशास्त्री, धर्मशास्त्री और कवि थे। वे बरेली, भारत से थे और बरेलवी आंदोलन के संस्थापक हैं। उन्होंने विभिन्न इस्लामी विषयों पर 1000 से अधिक पुस्तकें लिखीं।"
              : lang === "ro"
                ? "Imam Ahmed Raza Khan, jinhe A'la Hazrat ke naam se jaana jaata hai, ek azeem Islami aalim, faqeeh, maahir-e-ilaahiyaat aur shayar thay. Woh Bareilly, Hindustan se ta'alluq rakhte thay aur Barelvi tehreek ke bani hain. Unhone mukhtalif Islami uloom par 1000 se zyada kitaabein tasneef karein."
                : "Imam Ahmed Raza Khan, known as A'la Hazrat, was a renowned Islamic scholar, jurist, theologian, and poet from Bareilly, India. He is the founder of the Barelvi movement and authored over 1,000 books on various Islamic sciences."}
        </Text>

        <View style={{ height: spacing.md }} />

        <Text style={{ fontSize: fontSize.base, color: colors.gray700, lineHeight: 24 }}>
          {lang === "ur"
            ? 'ان کا نعتیہ مجموعہ "حدائق بخشش" اردو نعت شاعری کے عظیم ترین مجموعات میں شمار کیا جاتا ہے۔ ان کے اشعار حضور نبی کریم ﷺ سے والہانہ محبت سے بھرپور ہیں۔'
            : lang === "hi"
              ? 'उनका नअती संग्रह "हदाइक़-ए-बख़्शिश" उर्दू नअत शायरी के महानतम संग्रहों में गिना जाता है। उनके शेरों में पैग़ंबर मुहम्मद ﷺ से गहरी मुहब्बत झलकती है।'
              : lang === "ro"
                ? 'Unka natiya majmua "Hadaiq-e-Bakhshish" Urdu naat shayari ke azeem tareen majmuat mein shumaar kiya jaata hai. Unke ashaar mein Paighambar Muhammad ﷺ se gehra ishq jhalakta hai.'
                : 'His poetic work "Hadaiq-e-Bakhshish" is considered one of the greatest collections of Urdu Naat poetry. His verses overflow with profound love for Prophet Muhammad ﷺ.'}
        </Text>
      </View>

      {/* App Info */}
      <View
        style={{
          marginHorizontal: spacing.xl,
          marginTop: spacing.lg,
          backgroundColor: colors.white,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.gray200,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: fontSize.base, fontWeight: "700", color: colors.black }}>
          {_("appName")}
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.gray500, marginTop: spacing.xs }}>
          {_("version")} 1.0.0
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.gray400, marginTop: spacing.md, textAlign: "center" }}>
          {_("appDescription")}
        </Text>
      </View>
    </ScrollView>
  );
}
