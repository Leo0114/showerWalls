import es from "@/constants/es.json";
import en from "@/constants/en.json";

const LANG = {
  SPANISH: "es",
  ENGLISH: "en",
};

export const getI18N = ({
  currentLocale = "es",
}: {
  currentLocale: string | undefined;
}) => {
  if (currentLocale === LANG.ENGLISH) return en;
  return es;
};