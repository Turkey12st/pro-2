
import React from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CapitalSummary } from "@/components/dashboard/capital/CapitalSummary";
import { CapitalDetails } from "@/components/dashboard/capital/CapitalDetails";
import { CapitalIncreaseDialog } from "@/components/dashboard/capital/CapitalIncreaseDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CapitalHistory } from "@/components/dashboard/capital/CapitalHistory";
import { CapitalSummaryLoader } from "@/components/dashboard/capital/CapitalSummaryLoader";
import { Landmark, History, TrendingUp } from "lucide-react";

export default function CapitalPage() {
  const { data: capitalData, isLoading } = useQuery({
    queryKey: ["capital_management"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_management")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: capitalHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["capital_history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capital_history")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">إدارة رأس المال</h1>
            <p className="text-muted-foreground">متابعة وإدارة رأس المال وحركاته</p>
          </div>
        </div>

        {isLoading ? (
          <CapitalSummaryLoader />
        ) : capitalData ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  تفاصيل رأس المال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CapitalDetails data={capitalData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  تحديث رأس المال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CapitalIncreaseDialog capitalData={capitalData} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="bg-muted/50 p-6 rounded-lg text-center space-y-2">
            <p className="text-lg font-medium">لم يتم تعريف بيانات رأس المال بعد</p>
            <p className="text-muted-foreground">قم بإضافة بيانات رأس المال الأساسية للبدء</p>
          </div>
        )}
        
        <Tabs defaultValue="history" className="mt-8">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              سجل حركات رأس المال
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل حركات رأس المال</CardTitle>
              </CardHeader>
              <CardContent>
                <CapitalHistory history={capitalHistory || []} isLoading={isHistoryLoading} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
