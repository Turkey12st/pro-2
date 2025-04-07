
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Plus, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  event_type: string;
  color: string;
  metadata?: any;
  source_type: string;
  source_id?: string;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [view, setView] = useState("month");
  const [eventTypes, setEventTypes] = useState<string[]>(["document", "salary", "zakat", "meeting"]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([...eventTypes]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Fetch all events from different sources
  const { data: documentEvents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["calendar_documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_documents")
        .select("id, title, expiry_date, type")
        .order("expiry_date", { ascending: true });
      
      if (error) throw error;
      
      // Transform documents data into events format
      return data?.map(doc => ({
        id: `doc-${doc.id}`,
        title: `تجديد: ${doc.title}`,
        start_date: doc.expiry_date,
        all_day: true,
        event_type: "document",
        color: "#ef4444", // Red color for documents
        source_type: "document",
        source_id: doc.id
      })) || [];
    }
  });

  const { data: salaryEvents, isLoading: isLoadingSalaries } = useQuery({
    queryKey: ["calendar_salaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_records")
        .select("id, payment_date, total_salary")
        .order("payment_date", { ascending: true });
      
      if (error) throw error;
      
      // Transform salary data into events format
      return data?.map(salary => ({
        id: `salary-${salary.id}`,
        title: `دفع الرواتب: ${salary.total_salary.toLocaleString('en-US')} ريال`,
        start_date: salary.payment_date,
        all_day: true,
        event_type: "salary",
        color: "#3b82f6", // Blue color for salaries
        source_type: "salary",
        source_id: salary.id
      })) || [];
    }
  });

  // Combine all events when data is loaded
  useEffect(() => {
    const allEvents: Event[] = [
      ...(documentEvents || []),
      ...(salaryEvents || []),
    ];
    
    setEvents(allEvents);
  }, [documentEvents, salaryEvents]);

  // Filter events based on selected types
  useEffect(() => {
    if (!events.length) return;
    
    const filtered = events.filter(event => 
      selectedEventTypes.includes(event.event_type)
    );
    
    setFilteredEvents(filtered);
  }, [events, selectedEventTypes]);

  // Handle event type selection
  const handleEventTypeChange = (types: string[]) => {
    setSelectedEventTypes(types);
  };

  // Handle view event details
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    if (!date || !isValid(date) || !filteredEvents.length) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter(event => {
      const eventDate = event.start_date.split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Render date cell with events
  const renderDateCell = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    
    return (
      <div className="h-full">
        <div className="text-center p-1">
          {format(date, 'd')}
        </div>
        {dateEvents.length > 0 && (
          <div className="px-1 pb-1">
            {dateEvents.slice(0, 3).map((event, i) => (
              <div 
                key={event.id} 
                className="text-xs p-1 mb-1 rounded cursor-pointer truncate"
                style={{ backgroundColor: `${event.color}33`, color: event.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewEvent(event);
                }}
              >
                {event.title}
              </div>
            ))}
            {dateEvents.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                + {dateEvents.length - 3} المزيد
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Details for selected date
  const selectedDateEvents = date ? getEventsForDate(date) : [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">التقويم</h1>
            <p className="text-muted-foreground">عرض المواعيد والمستندات والمهام في تقويم موحد</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select 
              value={view} 
              onValueChange={setView}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="طريقة العرض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">شهري</SelectItem>
                <SelectItem value="week">أسبوعي</SelectItem>
                <SelectItem value="day">يومي</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <CalendarIcon className="ml-2 h-4 w-4" />
              اليوم
            </Button>
            
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة حدث
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-4">
                <CalendarComponent
                  mode="range"
                  selected={{ from: date, to: date }}
                  onSelect={(newDate) => {
                    if (newDate?.from) {
                      setDate(newDate.from);
                    }
                  }}
                  locale={ar}
                  className="border rounded-md p-4"
                  components={{
                    Day: ({ day, ...props }) => (
                      <button
                        {...props}
                        className={`h-16 w-full border border-border hover:bg-muted ${
                          day.getMonth() !== date?.getMonth() ? "text-muted-foreground" : ""
                        } ${
                          date && day.toDateString() === date.toDateString()
                            ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                            : ""
                        }`}
                      >
                        {renderDateCell(day)}
                      </button>
                    ),
                  }}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تصفية الأحداث</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eventTypes.map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`filter-${type}`}
                        checked={selectedEventTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEventTypes([...selectedEventTypes, type]);
                          } else {
                            setSelectedEventTypes(selectedEventTypes.filter(t => t !== type));
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`filter-${type}`} className="flex items-center">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: type === 'document' ? '#ef4444' :
                                            type === 'salary' ? '#3b82f6' :
                                            type === 'zakat' ? '#eab308' : '#10b981'
                          }}
                        ></span>
                        {type === 'document' ? 'المستندات والتراخيص' :
                         type === 'salary' ? 'الرواتب' :
                         type === 'zakat' ? 'الزكاة والضرائب' : 'الاجتماعات'}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="ml-2 h-4 w-4" />
                  {date ? format(date, 'EEEE, d MMMM yyyy', { locale: ar }) : 'الأحداث'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-2 rounded border cursor-pointer hover:bg-muted"
                        onClick={() => handleViewEvent(event)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: event.color }}
                          ></div>
                          <div className="font-medium truncate">{event.title}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.source_type === 'document' ? 'مستند' :
                           event.source_type === 'salary' ? 'رواتب' : event.source_type}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    لا توجد أحداث في هذا اليوم
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Event Details Modal */}
        <Dialog open={isEventModalOpen && !!selectedEvent} onOpenChange={setIsEventModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                {selectedEvent?.description || 'لا يوجد وصف'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <div className="font-medium">التاريخ</div>
                <div>
                  {selectedEvent?.start_date ? format(parseISO(selectedEvent.start_date), 'EEEE, d MMMM yyyy', { locale: ar }) : ''}
                </div>
              </div>
              
              <div>
                <div className="font-medium">النوع</div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedEvent?.color }}
                  ></span>
                  {selectedEvent?.event_type === 'document' ? 'مستند' :
                   selectedEvent?.event_type === 'salary' ? 'رواتب' :
                   selectedEvent?.event_type === 'zakat' ? 'زكاة وضرائب' : 'اجتماع'}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsEventModalOpen(false)}>
                إغلاق
              </Button>
              {selectedEvent?.source_type === 'document' && (
                <Button variant="outline" asChild>
                  <a href={`/documents?id=${selectedEvent.source_id}`}>
                    عرض المستند
                  </a>
                </Button>
              )}
              {selectedEvent?.source_type === 'salary' && (
                <Button variant="outline" asChild>
                  <a href={`/payroll?id=${selectedEvent.source_id}`}>
                    عرض تفاصيل الراتب
                  </a>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
