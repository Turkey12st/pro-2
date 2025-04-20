
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BarChart, CalendarRange } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SwotAnalysis } from "./business-planner/SwotAnalysis";
import { PestelAnalysis } from "./business-planner/PestelAnalysis";
import { CompetitiveAnalysis } from "./business-planner/CompetitiveAnalysis";
import { StrategicPlan } from "./business-planner/StrategicPlan";
import { GoalsManagement, type BusinessGoal } from "./business-planner/GoalsManagement";

export function BusinessPlanner() {
  const [activeTab, setActiveTab] = useState("goals");
  const [goals, setGoals] = useState<BusinessGoal[]>([
    {
      id: "1",
      title: "زيادة المبيعات",
      description: "زيادة إجمالي المبيعات بنسبة 20% مقارنة بالعام الماضي",
      targetAmount: 1000000,
      currentAmount: 650000,
      deadline: "2024-12-31",
      category: "sales"
    },
    {
      id: "2",
      title: "تحسين هامش الربح",
      description: "زيادة هامش الربح الإجمالي إلى 40%",
      targetAmount: 400000,
      currentAmount: 280000,
      deadline: "2024-12-31",
      category: "profit"
    },
    {
      id: "3",
      title: "افتتاح فرع جديد",
      description: "توسيع النشاط التجاري من خلال افتتاح فرع جديد",
      targetAmount: 500000,
      currentAmount: 150000,
      deadline: "2025-06-30",
      category: "expansion"
    }
  ]);

  const handleAddGoal = (newGoal: Omit<BusinessGoal, "id">) => {
    const goal: BusinessGoal = {
      ...newGoal,
      id: Date.now().toString()
    };

    setGoals([...goals, goal]);
    
    toast({
      title: "تم إضافة الهدف",
      description: "تم إضافة الهدف بنجاح إلى خطة العمل"
    });
  };

  const handleUpdateGoal = (id: string, currentAmount: number) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, currentAmount } : goal
    );
    
    setGoals(updatedGoals);
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث التقدم في الهدف بنجاح"
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 h-auto">
          <TabsTrigger value="goals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <Target className="h-4 w-4 ml-2" />
            الأهداف
          </TabsTrigger>
          <TabsTrigger value="add-goal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <BarChart className="h-4 w-4 ml-2" />
            إضافة هدف
          </TabsTrigger>
          <TabsTrigger value="planning" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
            <CalendarRange className="h-4 w-4 ml-2" />
            التخطيط
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-0">
          <GoalsManagement 
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
          />
        </TabsContent>

        <TabsContent value="add-goal" className="mt-0">
          <GoalsManagement 
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
          />
        </TabsContent>

        <TabsContent value="planning" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SwotAnalysis />
            <PestelAnalysis />
            <CompetitiveAnalysis />
            <StrategicPlan />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
