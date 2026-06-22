import { useLang } from "@/src/contexts/LangContext";
import { t } from "@/src/constants/translations";

export function useT() {
  const { lang } = useLang();

  return (key: keyof typeof t) => t[key]?.[lang] ?? t[key]?.en ?? key;
}
