
import { toast } from "@/components/ui/use-toast";
import type { ToastProps } from "@/components/ui/use-toast";

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      return toast(props);
    }
  };
}
