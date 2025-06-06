
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, DollarSign, Plus, History } from "lucide-react";

export default function CapitalPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [capitalForm, setCapitalForm] = useState({
    amount: '',
    type: 'increase',
    notes: '',
    effective_date: ''
  });

  const [capitalHistory] = useState([
    {
      id: 1,
      date: '2024-01-01',
      type: 'initial',
      amount: 1000000,
      previous_capital: 0,
      new_capital: 1000000,
      notes: 'رأس المال المبدئي'
    },
    {
      id: 2,
      date: '2024-06-01',
      type: 'increase',
      amount: 500000,
      previous_capital: 1000000,
      new_capital: 1500000,
      notes: 'زيادة رأس المال للتوسع'
    }
  ]);

  const currentCapital = capitalHistory.reduce((total, entry) => {
    return entry.type === 'increase' ? total + entry.amount : total - entry.amount;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "تم بنجاح",
      description: `تم ${capitalForm.type === 'increase' ? 'زيادة' : 'تقليل'} رأس المال بمبلغ ${capitalForm.amount} ريال`,
    });
    
    setIsDialogOpen(false);
    setCapitalForm({
      amount: '',
      type: 'increase',
      notes: '',
      effective_date: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">إدارة رأس المال</h1>
          <p className="text-muted-foreground">متابعة وإدارة رأس مال الشركة</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              تعديل رأس المال
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل رأس المال</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">المبلغ</Label>
                <Input
                  id="amount"
                  type="number"
                  value={capitalForm.amount}
                  onChange={(e) => setCapitalForm({...capitalForm, amount: e.target.value})}
                  placeholder="ادخل المبلغ"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">نوع العملية</Label>
                <select
                  id="type"
                  value={capitalForm.type}
                  onChange={(e) => setCapitalForm({...capitalForm, type: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="increase">زيادة رأس المال</option>
                  <option value="decrease">تقليل رأس المال</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="effective_date">تاريخ السريان</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={capitalForm.effective_date}
                  onChange={(e) => setCapitalForm({...capitalForm, effective_date: e.target.value})}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={capitalForm.notes}
                  onChange={(e) => setCapitalForm({...capitalForm, notes: e.target.value})}
                  placeholder="أضف أي ملاحظات أو تفاصيل إضافية"
                />
              </div>

              <Button type="submit" className="w-full">
                تأكيد التعديل
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رأس المال الحالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentCapital.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              آخر تحديث: {capitalHistory[capitalHistory.length - 1]?.date}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد التعديلات</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capitalHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              منذ تأسيس الشركة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النمو</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+50%</div>
            <p className="text-xs text-muted-foreground">
              منذ التأسيس
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">تاريخ التعديلات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>سجل تعديلات رأس المال</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capitalHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{entry.notes}</h3>
                      <p className="text-sm text-muted-foreground">
                        {entry.date} - {entry.type === 'increase' ? 'زيادة' : 'تقليل'} بمبلغ {entry.amount.toLocaleString()} ريال
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{entry.new_capital.toLocaleString()} ريال</div>
                      <div className="text-sm text-muted-foreground">رأس المال الجديد</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>تحليل رأس المال</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                تحليل مفصل لتطور رأس المال وتأثيره على الأداء المالي للشركة سيكون متاحاً قريباً.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
