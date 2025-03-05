
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  BarChart, 
  Target, 
  CalendarRange, 
  Save
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BusinessGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: "sales" | "profit" | "expansion" | "other";
}

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
  
  const [newGoal, setNewGoal] = useState<Omit<BusinessGoal, "id">>({
    title: "",
    description: "",
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date().toISOString().split('T')[0],
    category: "sales"
  });

  const handleAddGoal = () => {
    if (!newGoal.title) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان الهدف",
        variant: "destructive"
      });
      return;
    }

    const goal: BusinessGoal = {
      ...newGoal,
      id: Date.now().toString()
    };

    setGoals([...goals, goal]);
    
    // Reset the form
    setNewGoal({
      title: "",
      description: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
      category: "sales"
    });

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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case "sales": return "المبيعات";
      case "profit": return "الأرباح";
      case "expansion": return "التوسع";
      case "other": return "أخرى";
      default: return "";
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {getCategoryLabel(goal.category)}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>التقدم: {getProgressPercentage(goal.currentAmount, goal.targetAmount)}%</span>
                      <span>الموعد النهائي: {new Date(goal.deadline).toLocaleDateString('ar-SA')}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Label htmlFor={`update-${goal.id}`} className="whitespace-nowrap">تحديث التقدم:</Label>
                      <Input
                        id={`update-${goal.id}`}
                        type="number"
                        value={goal.currentAmount}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            handleUpdateGoal(goal.id, value);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add-goal" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">عنوان الهدف</Label>
                  <Input
                    id="goal-title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="مثال: زيادة المبيعات بنسبة 20%"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal-description">وصف الهدف</Label>
                  <Textarea
                    id="goal-description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="اشرح هدفك بالتفصيل"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">المبلغ المستهدف</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      value={newGoal.targetAmount || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal-current">المبلغ الحالي</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      value={newGoal.currentAmount || ""}
                      onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-category">الفئة</Label>
                    <select
                      id="goal-category"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="sales">المبيعات</option>
                      <option value="profit">الأرباح</option>
                      <option value="expansion">التوسع</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal-deadline">الموعد النهائي</Label>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddGoal} 
                  className="w-full"
                >
                  <Save className="ml-2 h-4 w-4" />
                  إضافة الهدف
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <LineChart className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-medium mt-4">التخطيط الاستراتيجي</h3>
                <p className="text-muted-foreground mt-2">
                  سيتم توفير أدوات التخطيط الاستراتيجي والتحليل في التحديثات القادمة
                </p>
                <Button variant="outline" className="mt-4">
                  الإشعار عند التوفر
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
