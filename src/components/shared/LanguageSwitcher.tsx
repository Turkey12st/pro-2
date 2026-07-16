import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label={t("app.language")}
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem
          onClick={() => setLanguage("ar")}
          className="justify-between"
        >
          <span>{t("app.arabic")}</span>
          {language === "ar" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className="justify-between"
        >
          <span>{t("app.english")}</span>
          {language === "en" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;