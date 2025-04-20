
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export interface BusinessGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: "sales" | "profit" | "expansion" | "other";
}

interface GoalsManagementProps {
  goals: BusinessGoal[];
  onAddGoal: (goal: Omit<BusinessGoal, "id">) => void;
  onUpdateGoal: (id: string, currentAmount: number) => void;
}

export function GoalsManagement({ goals, onAddGoal, onUpdateGoal }: GoalsManagementProps) {
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

    onAddGoal(newGoal);
    
    // Reset form
    setNewGoal({
      title: "",
      description: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
      category: "sales"
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
    <div className="space-y-4">
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
                        onUpdateGoal(goal.id, value);
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
    </div>
  );
}
