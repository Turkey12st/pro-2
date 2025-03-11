
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Partner {
  id: string;
  name: string;
  partner_type: string;
  ownership_percentage: number;
  share_value: number;
}

export interface CapitalData {
  total_capital: number;
  individual_capital: number;
  corporate_capital: number;
  partner_count: number;
  partners: Partner[];
}

export interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
}

export function useCapitalData() {
  const [capitalData, setCapitalData] = useState<CapitalData>({
    total_capital: 0,
    individual_capital: 0,
    corporate_capital: 0,
    partner_count: 0,
    partners: []
  });

  const { data: partners, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_partners")
        .select("*");
      
      if (error) throw error;
      return data as any[];
    }
  });

  useEffect(() => {
    if (partners) {
      // Transform partners data to ensure it has all required fields
      const transformedPartners: Partner[] = partners.map(p => ({
        id: p.id || p.created_at, // Use created_at as fallback ID
        name: p.name,
        partner_type: p.partner_type || 'individual',
        ownership_percentage: p.ownership_percentage || 0,
        share_value: p.share_value || 0
      }));

      // Calculate data
      const total = transformedPartners.reduce((sum, partner) => sum + partner.share_value, 0);
      const individual = transformedPartners
        .filter(p => p.partner_type === 'individual')
        .reduce((sum, partner) => sum + partner.share_value, 0);
      const corporate = transformedPartners
        .filter(p => p.partner_type === 'company')
        .reduce((sum, partner) => sum + partner.share_value, 0);
      
      setCapitalData({
        total_capital: total,
        individual_capital: individual,
        corporate_capital: corporate,
        partner_count: transformedPartners.length,
        partners: transformedPartners
      });
    }
  }, [partners]);

  // Transform data for chart
  const chartData: ChartDataItem[] = capitalData.partners.map(partner => ({
    name: partner.name,
    value: partner.share_value,
    percentage: partner.ownership_percentage
  }));

  return {
    capitalData,
    chartData,
    isLoading
  };
}
