import type { Lang } from "@/src/types";

type Translations = Record<string, Record<Lang, string>>;

export const t: Translations = {
  aboutBio: {
    ur: "اعلیٰ حضرت امام احمد رضا خان (1856–1921) بریلی شریف کے عظیم عالم، فقیہ اور عاشقِ رسول تھے۔ آپ نے فقہ، حدیث اور دیگر اسلامی علوم میں تقریباً ایک ہزار کتب و رسائل تصنیف فرمائے۔ آپ کا مشہور نعتیہ مجموعہ حدائقِ بخشش آج بھی دلوں کو روشن کرتا ہے۔",
    hi: "आला हज़रत इमाम अहमद रज़ा ख़ान (1856–1921) बरेली शरीफ़ के महान आलिम, फ़क़ीह और आशिक़-ए-रसूल थे। उन्होंने फ़िक़्ह, हदीस और अन्य इस्लामी विषयों पर लगभग एक हज़ार किताबें और रिसाले लिखे। उनका प्रसिद्ध नअती संग्रह हदाइक़-ए-बख़्शिश आज भी दिलों को रोशन करता है।",
    ro: "A'la Hazrat Imam Ahmed Raza Khan (1856–1921) Bareilly Shareef ke azeem aalim, faqeeh aur aashiq-e-Rasool thay. Aap ne fiqh, hadees aur deegar Islami uloom par taqriban ek hazaar kutub-o-rasail tasneef farmaye. Aap ka mashhoor naatiya majmua Hadaiq-e-Bakhshish aaj bhi dilon ko roshan karta hai.",
    en: "Imam Ahmed Raza Khan (1856–1921), known as A'la Hazrat, was a renowned scholar, jurist, and lover of the Prophet from Bareilly Shareef. He authored nearly 1,000 works on Islamic sciences. His famous collection of Naat poetry, Hadaiq-e-Bakhshish, continues to inspire hearts today.",
  },
  langName: {
    ur: "اردو",
    hi: "हिन्दी",
    ro: "Roman Urdu",
    en: "English",
  },
};