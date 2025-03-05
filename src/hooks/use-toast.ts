
import {
  type ToastActionElement,
  type ToastProps
} from "@/components/ui/toast";

import {
  useToast as useToastHook,
  toast as toastFunction
} from "@/components/ui/use-toast";

export type { ToastActionElement, ToastProps };
export const useToast = useToastHook;
export const toast = toastFunction;
