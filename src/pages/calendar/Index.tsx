import { useState, useEffect } from "react";
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
import { Plus, Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import { initializeApp } from "firebase/app";
import {
  getFirestore
} from "firebase/firestore";

// =================================================================
// إعدادات وبيانات Firebase / Supabase
// =================================================================
// ملاحظة: هذه المتغيرات يتم توفيرها تلقائيًا من البيئة
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string;

const supabaseUrl = "https://your-supabase-url.supabase.co"; // Replace with your Supabase URL
const supabaseAnonKey = "your-supabase-anon-key"; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== 'undefined' ? __firebase_config : '{}'
);
let firebaseApp;
let auth;
let db;

if (Object.keys(firebaseConfig).length > 0) {
  firebaseApp = initializeApp(firebaseConfig, "main-app");
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
}

// =================================================================
// تعريف نوع البيانات
// =================================================================
interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string; // تم تغيير النوع إلى string لتسهيل التعامل مع Supabase
  category: "meeting" | "task" | "reminder";
}

// =================================================================
// المكون الرئيسي
// =================================================================
/**
 * مكون صفحة التقويم الرئيسية.
 * يربط بين التقويم، الأحداث، وقاعدة البيانات لتخزين وإدارة الأحداث.
 */
export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    category: "meeting"
  });
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // جلب الأحداث من قاعدة البيانات
  const fetchEvents = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "فشل في جلب الأحداث",
          description: "حدث خطأ أثناء تحميل بيانات التقويم.",
          variant: "destructive",
        });
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // إعداد المصادقة وجلب البيانات عند التحميل
  useEffect(() => {
    const setupAuthAndFetch = async () => {
      try {
        if (auth && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (auth) {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase auth error:", error);
      }
    };
    setupAuthAndFetch();

    // مراقبة حالة المصادقة
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          setUser(authUser.uid);
          fetchEvents(authUser.uid);
        } else {
          setUser(null);
          setEvents([]);
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // دالة مساعدة لتحويل التاريخ إلى مفتاح فريد
  const getDayKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // تجميع الأحداث حسب اليوم
  const eventsByDay = events.reduce((acc: Record<string, Event[]>, event) => {
    const dayKey = event.date;
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(event);
    return acc;
  }, {});

  // الأحداث في اليوم المحدد
  const selectedDayEvents = eventsByDay[getDayKey(date)] || [];

  // دالة لحفظ أو تعديل الحدث
  const handleSaveEvent = async () => {
    if (!newEvent.title || !user) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان الحدث وتسجيل الدخول",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && editingEventId) {
        // تعديل الحدث
        const { error } = await supabase
          .from('events')
          .update({
            title: newEvent.title,
            description: newEvent.description,
            date: newEvent.date,
            category: newEvent.category
          })
          .eq('id', editingEventId)
          .eq('user_id', user);

        if (error) throw error;
        toast({ title: "تم التعديل", description: "تم تعديل الحدث بنجاح." });
      } else {
        // إضافة حدث جديد
        const eventToInsert = {
          ...newEvent,
          user_id: user,
          date: newEvent.date,
          id: crypto.randomUUID() // Supabase generates UUIDs, but we'll use a client-side one for optimistic UI
        };

        const { error } = await supabase
          .from('events')
          .insert(eventToInsert);

        if (error) throw error;
        toast({ title: "تمت الإضافة", description: "تم إضافة الحدث بنجاح." });
      }

      setIsDialogOpen(false);
      fetchEvents(user);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "فشل الحفظ",
        description: "حدث خطأ أثناء حفظ الحدث.",
        variant: "destructive",
      });
    }
  };

  // دالة لحذف حدث
  const handleDeleteEvent = async (id: string) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "لا يمكن حذف الحدث بدون تسجيل الدخول.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', user);

      if (error) throw error;
      toast({ title: "تم الحذف", description: "تم حذف الحدث بنجاح." });
      fetchEvents(user);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "فشل الحذف",
        description: "حدث خطأ أثناء حذف الحدث.",
        variant: "destructive",
      });
    }
  };

  // فتح نافذة التعديل
  const openEditDialog = (event: Event) => {
    setIsEditing(true);
    setEditingEventId(event.id);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      category: event.category
    });
    setIsDialogOpen(true);
  };

  // فتح نافذة الإضافة
  const openAddDialog = () => {
    setIsEditing(false);
    setEditingEventId(null);
    setNewEvent({
      title: "",
      description: "",
      date: getDayKey(new Date()),
      category: "meeting"
    });
    setIsDialogOpen(true);
  };

  // دالة مساعدة لتحديد لون الخلفية بناءً على نوع الحدث
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

  // دالة مساعدة لتحويل اسم الفئة من الإنجليزية إلى العربية
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
          {/* زر إضافة حدث جديد */}
          <Button onClick={openAddDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>إضافة حدث</span>
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* جزء التقويم */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">التقويم</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                locale={ar}
                className="rounded-md border shadow"
              />
            </CardContent>
          </Card>
          
          {/* جزء عرض أحداث اليوم المختار */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>أحداث اليوم: {date.toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">جاري تحميل الأحداث...</div>
              ) : selectedDayEvents.length > 0 ? (
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
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(event)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" /> تعديل
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> حذف
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>لا توجد أحداث لهذا اليوم</p>
                  <Button 
                    variant="link" 
                    onClick={openAddDialog}
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
            <DialogTitle>{isEditing ? "تعديل الحدث" : "إضافة حدث جديد"}</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الحدث الذي تريد {isEditing ? "تعديله" : "إضافته"} إلى التقويم.
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
                date={newEvent.date ? new Date(newEvent.date) : new Date()}
                setDate={(d) => setNewEvent({ ...newEvent, date: d?.toISOString().split('T')[0] })}
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
            <Button onClick={handleSaveEvent} type="submit">
              {isEditing ? "تعديل" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
