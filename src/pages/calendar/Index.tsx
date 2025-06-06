
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ar } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, Users, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const locales = {
  'ar': ar,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: 'طوال اليوم',
  previous: 'السابق',
  next: 'التالي',
  today: 'اليوم',
  month: 'شهر',
  week: 'أسبوع',
  day: 'يوم',
  agenda: 'جدول الأعمال',
  date: 'التاريخ',
  time: 'الوقت',
  event: 'حدث',
  noEventsInRange: 'لا توجد أحداث في هذا النطاق.',
  showMore: (total: number) => `+ ${total} المزيد`,
};

export default function CalendarPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'اجتماع فريق التطوير',
      start: new Date(2024, 2, 15, 10, 0),
      end: new Date(2024, 2, 15, 11, 0),
      type: 'meeting',
    },
    {
      id: 2,
      title: 'مراجعة المشروع',
      start: new Date(2024, 2, 20, 14, 0),
      end: new Date(2024, 2, 20, 15, 30),
      type: 'review',
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting',
    location: '',
    attendees: '',
  });

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const event = {
      id: events.length + 1,
      title: newEvent.title,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
      type: newEvent.type,
      description: newEvent.description,
      location: newEvent.location,
      attendees: newEvent.attendees,
    };

    setEvents([...events, event]);
    setNewEvent({
      title: '',
      description: '',
      start: '',
      end: '',
      type: 'meeting',
      location: '',
      attendees: '',
    });
    setIsOpen(false);

    toast({
      title: "تم بنجاح",
      description: "تم إضافة الحدث بنجاح",
    });
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    
    switch (event.type) {
      case 'meeting':
        backgroundColor = '#3174ad';
        break;
      case 'review':
        backgroundColor = '#f39c12';
        break;
      case 'deadline':
        backgroundColor = '#e74c3c';
        break;
      default:
        backgroundColor = '#3174ad';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">التقويم وإدارة المواعيد</h1>
          <p className="text-muted-foreground">تنظيم المواعيد والأحداث المهمة</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة حدث جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة حدث جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">عنوان الحدث</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="اكتب عنوان الحدث"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">نوع الحدث</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">اجتماع</SelectItem>
                    <SelectItem value="review">مراجعة</SelectItem>
                    <SelectItem value="deadline">موعد نهائي</SelectItem>
                    <SelectItem value="event">حدث</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start">تاريخ البداية</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end">تاريخ النهاية</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="وصف تفصيلي للحدث"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">المكان</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="مكان انعقاد الحدث"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="attendees">الحضور</Label>
                <Input
                  id="attendees"
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                  placeholder="أسماء الحضور (مفصولة بفواصل)"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddEvent} className="flex-1">
                إضافة الحدث
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="month"
              popup
              selectable
              onSelectSlot={(slotInfo) => {
                setNewEvent({
                  ...newEvent,
                  start: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm"),
                  end: format(slotInfo.end, "yyyy-MM-dd'T'HH:mm"),
                });
                setIsOpen(true);
              }}
              onSelectEvent={(event) => {
                toast({
                  title: event.title,
                  description: `${format(event.start, 'PPP p', { locale: ar })} - ${format(event.end, 'PPP p', { locale: ar })}`,
                });
              }}
              culture="ar"
              rtl={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
