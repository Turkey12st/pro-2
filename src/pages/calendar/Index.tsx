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
import { Plus, Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'deadline' | 'event' | 'reminder';
}

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    type: 'meeting' as Event['type']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newEvent: Event = {
        id: editingEvent?.id || Math.random().toString(36).substr(2, 9),
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        type: eventForm.type
      };

      if (editingEvent) {
        setEvents(events.map(evt => evt.id === editingEvent.id ? newEvent : evt));
        toast({
          title: "تم تحديث الحدث",
          description: "تم تحديث الحدث بنجاح"
        });
      } else {
        setEvents([...events, newEvent]);
        toast({
          title: "تم إضافة الحدث",
          description: "تم إضافة الحدث بنجاح"
        });
      }

      resetForm();
      setShowDialog(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ الحدث",
        description: "حدث خطأ أثناء حفظ الحدث"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    setEvents(events.filter(evt => evt.id !== eventId));
    toast({
      title: "تم حذف الحدث",
      description: "تم حذف الحدث بنجاح"
    });
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: new Date(),
      startTime: '',
      endTime: '',
      type: 'meeting'
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type
    });
    setShowDialog(true);
  };

  const getEventTypeColor = (type: Event['type']) => {
    const colors = {
      meeting: 'bg-blue-500',
      deadline: 'bg-red-500',
      event: 'bg-green-500',
      reminder: 'bg-yellow-500'
    };
    return colors[type];
  };

  const getEventTypeLabel = (type: Event['type']) => {
    const labels = {
      meeting: 'اجتماع',
      deadline: 'موعد نهائي',
      event: 'حدث',
      reminder: 'تذكير'
    };
    return labels[type];
  };

  const selectedDateEvents = events.filter(event => 
    date && event.date.toDateString() === date.toDateString()
  );

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">التقويم</h1>
          <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
            <Plus size={16} />
            إضافة حدث جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon size={20} />
                التقويم الشهري
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ar}
                className="rounded-md border"
                modifiers={{
                  hasEvent: events.map(event => event.date)
                }}
                modifiersStyles={{
                  hasEvent: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                }}
              />
            </CardContent>
          </Card>

          {/* Events for selected date */}
          <Card>
            <CardHeader>
              <CardTitle>
                أحداث اليوم
                {date && (
                  <span className="text-sm font-normal text-muted-foreground block">
                    {date.toLocaleDateString('ar-SA')}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  لا توجد أحداث في هذا اليوم
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                            <h4 className="font-medium">{event.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <span>{getEventTypeLabel(event.type)}</span>
                            {event.startTime && event.endTime && (
                              <span> • {event.startTime} - {event.endTime}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(event)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Event Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'تعديل الحدث' : 'إضافة حدث جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الحدث لإضافته إلى التقويم
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الحدث</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>

              <div>
                <Label>التاريخ</Label>
                <DatePicker
                  date={eventForm.date}
                  setDate={(newDate) => setEventForm({ ...eventForm, date: newDate || new Date() })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">وقت البداية</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">وقت النهاية</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">نوع الحدث</Label>
                <select
                  id="type"
                  className="w-full p-2 border rounded-md"
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as Event['type'] })}
                >
                  <option value="meeting">اجتماع</option>
                  <option value="deadline">موعد نهائي</option>
                  <option value="event">حدث</option>
                  <option value="reminder">تذكير</option>
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'جاري الحفظ...' : (editingEvent ? 'تحديث' : 'إضافة')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;