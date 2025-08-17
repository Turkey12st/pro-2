import { useState, useEffect, useCallback } from "react";
import { CompanyFormData } from "@/types/company";
import { useToast } from "@/hooks/use-toast";
import { fetchCompanyInfo } from "@/services/companyService";

/**
 * Custom hook to manage and fetch company information.
 * It handles loading state, data, and errors, providing a reusable
 * and efficient way to interact with company data.
 */
export function useCompanyData() {
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyFormData>({
    id: "",
    name: "",
  });
  const { toast } = useToast();

  /**
   * Fetches company information from the backend.
   * This function is wrapped in `useCallback` to prevent unnecessary re-creations.
   * It also includes robust error handling and state management.
   */
  const loadCompanyInfo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCompanyInfo();
      
      if (data) {
        setCompanyInfo(data);
      }
      return data;
    } catch (error: any) {
      console.error("Error fetching company info:", error);
      
      // Ignore "no data" errors from the backend to avoid constant toasts
      if (error?.code !== 'PGRST116') {
        toast({
          title: "خطأ في جلب بيانات الشركة",
          description: "حدث خطأ أثناء محاولة جلب بيانات الشركة",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]); // `toast` is a dependency because it's used inside the function.

  /**
   * `useEffect` hook to call `loadCompanyInfo` when the component mounts.
   * It depends on `loadCompanyInfo` to ensure it's called whenever the function reference changes,
   * which is only when the `toast` dependency changes (as a result of `useCallback`).
   */
  useEffect(() => {
    loadCompanyInfo();
  }, [loadCompanyInfo]);

  // Return the state and functions that the consuming component needs.
  return {
    companyInfo,
    loading,
    refreshCompanyInfo: loadCompanyInfo,
    setCompanyInfo
  };
}
