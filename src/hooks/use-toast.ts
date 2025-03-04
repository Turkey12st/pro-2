
// استيراد الأساسيات من مكتبة toast الأصلية
import {
  useToast as useToastOriginal,
  toast as toastOriginal
} from "@/components/ui/toast";

// إعادة تصدير الدوال لاستخدامها في التطبيق
export const useToast = useToastOriginal;
export const toast = toastOriginal;
