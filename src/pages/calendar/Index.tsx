
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker-fixed";
import { ar } from "date-fns/locale";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: "meeting" | "task" | "reminder";
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: new Date(),
    category: "meeting"
  });
  const { toast } = useToast();

  // تحويل التاريخ إلى مفتاح لتجميع الأحداث حسب اليوم
  const getDayKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // تجميع الأحداث حسب التاريخ
  const eventsByDay = events.reduce((acc: Record<string, Event[]>, event) => {
    const dayKey = getDayKey(event.date);
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(event);
    return acc;
  }, {});

  // الأحداث في اليوم المحدد
  const selectedDayEvents = eventsByDay[getDayKey(date)] || [];

  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان الحدث",
        variant: "destructive",
      });
      return;
    }

    const event: Event = {
      id: crypto.randomUUID(),
      title: newEvent.title || "",
      description: newEvent.description || "",
      date: newEvent.date || new Date(),
      category: newEvent.category as "meeting" | "task" | "reminder"
    };

    setEvents([...events, event]);
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة الحدث بنجاح",
    });

    // إعادة ضبط نموذج الإدخال
    setNewEvent({
      title: "",
      description: "",
      date: new Date(),
      category: "meeting"
    });
    setIsDialogOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "task":
        return "bg-green-100 text-green-800";
      case "reminder":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "meeting":
        return "اجتماع";
      case "task":
        return "مهمة";
      case "reminder":
        return "تذكير";
      default:
        return category;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">التقويم</h1>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>إضافة حدث</span>
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">التقويم</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                locale={ar}
                className="rounded-md border shadow"
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>أحداث اليوم: {date.toLocaleDateString("ar-SA")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-lg">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(event.category)}`}>
                          {getCategoryName(event.category)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>لا توجد أحداث لهذا اليوم</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-2"
                  >
                    إضافة حدث جديد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة حدث جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الحدث الذي تريد إضافته إلى التقويم.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={newEvent.title || ""}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="أدخل عنوان الحدث"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">النوع</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
              >
                <option value="meeting">اجتماع</option>
                <option value="task">مهمة</option>
                <option value="reminder">تذكير</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>التاريخ</Label>
              <DatePicker
                date={newEvent.date}
                setDate={(date) => setNewEvent({ ...newEvent, date })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={newEvent.description || ""}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="أدخل وصف الحدث"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddEvent} type="submit">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
