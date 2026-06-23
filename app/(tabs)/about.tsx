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
          About
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
            Language
          </Text>
          <LangSwitcher />
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: spacing.xl,
          marginTop: spacing.lg,
          gap: spacing.md,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.gray200,
          }}
        >
          <Text style={{ fontSize: fontSize["3xl"], fontWeight: "800", color: colors.primary }}>
            {kalams.length}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.gray500, marginTop: spacing.xs }}>
            {_("kalams")}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.gray200,
          }}
        >
          <Text style={{ fontSize: fontSize["3xl"], fontWeight: "800", color: colors.primary }}>
            1856–1921
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.gray500, marginTop: spacing.xs }}>
            Life
          </Text>
        </View>
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
          Imam Ahmed Raza Khan (1856–1921)
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
          {lang === "hi"
            ? "इमाम अहमद रज़ा ख़ान रहमतुल्लाह तआला अलैह, जिन्हें दुनिया भर में आला हज़रत के नाम से याद किया जाता है, 10 शव्वाल 1272 हिजरी बमुताबिक़ 14 जून 1856 को बरेली शरीफ़ में पैदा हुए। आप ने चार साल की उम्र में क़ुरआन-ए-करीम नाज़िरा मुकम्मल किया, छह साल की उम्र में पहला बयान फ़रमाया, और आठ साल की उम्र में इल्म-ए-फ़राइज़ (वरासत) के एक मसले का ऐसा मुदल्लल जवाब तहरीर फ़रमाया जिस ने अहल-ए-इल्म को हैरान कर दिया। आप ने सिर्फ़ 13 साल और 4 मह की उम्र में अपनी रस्मी तालीम मुकम्मल कर ली और उसी दिन फ़तावा लिखना शुरू फ़रमा दिया। आप की अज़ीम फ़िक़्ही ख़िदमत फ़तावा रज़विय्या की सूरत में मौजूद है, जो 30 जिल्दों पर मुश्तमिल एक बे-मिसाल इल्मी ख़ज़ाना है। इस में तक़रीबन 22,000 सफ़्हात, 6,847 सवालात के जवाबात और 206 रसाइल शामिल हैं। उम्मत के जलील-उल-क़द्र उलमा ने मुत्तफ़िक़ा तौर पर आप को चौदहवीं सदी हिजरी का मुजद्दिद क़रार दिया। अरब और अजम के उलमा ने आप को मुजद्दिद 1400 और अमीर-उल-मोमिनीन फ़िल-हदीस जैसे अज़ीम अल्क़ाब से नवाज़ा। इश्क़-ए-रसूल ﷺ आप की ज़िंदगी का नुमायाँ पहलू था। आप का मशहूर नअतिया मज्मुआ हदाइक़-ए-बख़्शिश 2,781 अशआर पर मुश्तमिल है, जो आज भी आशिक़ान-ए-रसूल ﷺ के दिलों को रोशन करता है। आप ने अक़ाइद, इल्म-उल-कलाम, तफ़सीर, हदीस, फ़िक़्ह और दीगर इस्लामी उलूम पर तक़रीबन 1,000 कुतुब और रसाइल तसनीफ़ फ़रमाए। इस के इलावा आप ने अरबी ज़बान में भी कसरत से शायरी फ़रमाई। आप का विसाल 25 सफ़र-उल-मुज़फ़्फ़र 1340 हिजरी बमुताबिक़ 1921 में बरेली शरीफ़ में हुआ। आप की नमाज़-ए-जनाज़ा आप के साहिबज़ादे हुज्जत-उल-इस्लाम मौलाना हामिद रज़ा ख़ान रहमतुल्लाह तआला अलैह ने पढ़ाई। आज भी बरेली शरीफ़ में वाक़िआ आप का मज़ार-ए-अनवर दुनिया भर से आने वाले लाखों अक़ीदत मंदों की हाज़िरी और रूहानी फ़ैज़-ओ-बरकात का मरकज़ है।"
            : lang === "ur"
            ? "امام احمد رضا خان رحمۃ اللہ تعالیٰ علیہ، جنہیں دنیا بھر میں اعلیٰ حضرت کے نام سے یاد کیا جاتا ہے، 10 شوال 1272 ہجری بمطابق 14 جون 1856ء کو بریلی شریف میں پیدا ہوئے۔ آپ نے چار سال کی عمر میں قرآنِ کریم ناظرہ مکمل کیا، چھ سال کی عمر میں پہلا خطاب فرمایا، اور آٹھ سال کی عمر میں علمِ فرائض (وراثت) کے ایک مسئلے کا ایسا مدلل جواب تحریر فرمایا جس نے اہلِ علم کو حیران کر دیا۔ آپ نے صرف 13 سال اور 4 ماہ کی عمر میں اپنی رسمی تعلیم مکمل کر لی اور اسی دن فتویٰ نویسی کا آغاز فرمایا۔ آپ کی عظیم فقہی خدمت فتاویٰ رضویہ کی صورت میں موجود ہے، جو 30 جلدوں پر مشتمل ایک بے مثال علمی خزانہ ہے۔ اس میں تقریباً 22,000 صفحات، 6,847 سوالات کے جوابات اور 206 رسائل شامل ہیں۔ امتِ مسلمہ کے جلیل القدر علماء نے متفقہ طور پر آپ کو چودھویں صدی ہجری کا مجدد قرار دیا۔ عرب و عجم کے علماء نے آپ کو مجدد 1400 اور امیر المؤمنین فی الحدیث جیسے عظیم القاب سے نوازا۔ عشقِ رسول ﷺ آپ کی زندگی کا نمایاں وصف تھا۔ آپ کا مشہور نعتیہ مجموعہ حدائقِ بخشش 2,781 اشعار پر مشتمل ہے، جو آج بھی عاشقانِ رسول ﷺ کے دلوں کو گرما دیتا ہے۔ آپ نے عقائد، علمِ کلام، تفسیر، حدیث، فقہ اور دیگر اسلامی علوم پر تقریباً ایک ہزار کتابیں اور رسائل تصنیف فرمائے۔ اس کے علاوہ آپ نے عربی زبان میں بھی سینکڑوں اشعار تحریر فرمائے۔ آپ کا وصال 25 صفر المظفر 1340 ہجری بمطابق 1921ء میں بریلی شریف میں ہوا۔ آپ کی نمازِ جنازہ آپ کے صاحبزادے حجۃ الاسلام مولانا حامد رضا خان رحمۃ اللہ تعالیٰ علیہ نے پڑھائی۔ آج بھی بریلی شریف میں واقع آپ کا مزارِ پُرانوار دنیا بھر سے آنے والے لاکھوں عقیدت مندوں کی حاضری اور روحانی فیوض و برکات کا مرکز ہے۔"
            : lang === "ro"
            ? "Imam Ahmed Raza Khan \u0631\u062D\u0645\u06C1 \u0627\u0644\u0644\u06C1 \u062A\u0639\u0627\u0644\u06CC\u0670 \u0639\u0644\u06CC\u06C1, jinhein dunya bhar mein A'la Hazrat ke naam se yaad kiya jata hai, 10 Shawwal 1272 Hijri ba-mutabiq 14 June 1856 ko Bareilly Shareef mein paida hue. Aap ne chaar saal ki umr mein Qur'an-e-Kareem nazirah mukammal kiya, chhe saal ki umr mein pehla bayan farmaya, aur aath saal ki umr mein ilm-e-faraiz (warasat) ke ek maslay ka aisa mudallal jawab tehreer farmaya jis ne ahl-e-ilm ko hairan kar diya. Aap ne sirf 13 saal aur 4 mah ki umr mein apni rasmi taleem mukammal kar li aur usi din fatawa likhna shuru farma diya. Aap ki azeem fiqhi khidmat Fatawa Razawiyyah ki surat mein maujood hai, jo 30 jildon par mushtamil ek be-misal ilmi khazana hai. Is mein taqriban 22,000 safhat, 6,847 sawalat ke jawabat aur 206 rasail shamil hain. Ummat ke jaleel-ul-qadr ulama ne muttifaqa taur par Aap ko chaudhween sadi Hijri ka Mujaddid qarar diya. Arab aur Ajam ke ulama ne Aap ko Mujaddid 1400 aur Ameer-ul-Momineen fil-Hadees jaise azeem alqab se nawaza. Ishq-e-Rasool \u0635\u0644\u06CC \u0627\u0644\u0644\u06C1 \u0639\u0644\u06CC\u06C1 \u0648\u0633\u0644\u0645 Aap ki zindagi ka numayan pehlu tha. Aap ka mashhoor naatiya majmua Hadaiq-e-Bakhshish 2,781 ashaar par mushtamil hai, jo aaj bhi aashiqan-e-Rasool \u0635\u0644\u06CC \u0627\u0644\u0644\u06C1 \u0639\u0644\u06CC\u06C1 \u0648\u0633\u0644\u0645 ke dilon ko roshan karta hai. Aap ne aqaid, ilm-ul-kalam, tafseer, hadees, fiqh aur deegar Islami uloom par taqriban 1,000 kutub aur rasail tasneef farmaye. Is ke ilawa Aap ne Arabi zaban mein bhi kasrat se shayari farmayi. Aap ka wisal 25 Safar-ul-Muzaffar 1340 Hijri ba-mutabiq 1921 mein Bareilly Shareef mein hua. Aap ki namaz-e-janazah Aap ke sahibzaday Hujjat-ul-Islam Maulana Hamid Raza Khan \u0631\u062D\u0645\u06C1 \u0627\u0644\u0644\u06C1 \u062A\u0639\u0627\u0644\u06CC\u0670 \u0639\u0644\u06CC\u06C1 ne padhayi. Aaj bhi Bareilly Shareef mein waqia Aap ka mazar-e-anwar dunya bhar se aane wale laakhon aqeedat mandon ki hazri aur roohani faiz-o-barakat ka markaz hai."
            : "Imam Ahmed Raza Khan (A'la Hazrat) was born on 10 Shawwal 1272 AH / 14 June 1856 in Bareilly Shareef. He completed the recitation of the Holy Quran at age four, delivered his first lecture at six, and wrote a remarkable answer on inheritance rulings at age eight. He completed his formal education at just 13 years and 4 months and began issuing legal verdicts the same day. His collection of fatwas Fatawa Razawiyyah spans 30 volumes containing approximately 22,000 pages, answers to 6,847 questions, and 206 booklets. He is unanimously recognized as the Mujaddid (Revivalist) of the 14th century. Scholars across the Arab and non-Arab world honoured him with the titles Mujaddid 1400 and Ameer-ul-Momineen fil-Hadees (Leader of the Believers in Hadees). His famous collection of Naat poetry Hadaiq-e-Bakhshish contains 2,781 couplets. He authored approximately 1,000 books on various Islamic sciences including theology, scholasticism, exegesis, Hadees, jurisprudence, and polemics. Additionally, he composed 751 or 1,145 Arabic couplets. He passed away on 25 Safar 1340 AH / 1921 in Bareilly Shareef. His funeral prayer was led by his son, Hujjat-ul-Islam Maulana Hamid Raza Khan. His shrine in Bareilly Shareef remains a site of pilgrimage for countless devotees."}
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
