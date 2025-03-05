
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CalendarClock, CheckCircle2, Clock, Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type TaskPriority = "high" | "medium" | "low";
type TaskStatus = "pending" | "completed" | "overdue";
type TaskRepeat = "never" | "daily" | "weekly" | "monthly" | "yearly";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  repeat: TaskRepeat;
}

export function TaskScheduler() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "تجديد السجل التجاري",
      description: "تجديد السجل التجاري للشركة قبل انتهاء المدة الحالية",
      dueDate: new Date(2024, 7, 15),
      priority: "high",
      status: "pending",
      repeat: "yearly"
    } as Task,
    {
      id: "2",
      title: "دفع التأمينات",
      description: "إكمال إجراءات دفع التأمينات الاجتماعية للموظفين",
      dueDate: new Date(2024, 6, 5),
      priority: "medium",
      status: "pending",
      repeat: "monthly"
    },
    {
      id: "3",
      title: "إعداد تقرير الزكاة",
      description: "إعداد وتجهيز جميع المستندات اللازمة لتقرير الزكاة السنوي",
      dueDate: new Date(2024, 11, 20),
      priority: "medium",
      status: "pending",
      repeat: "yearly"
    } as Task
  ]);

  const [newTask, setNewTask] = useState<Omit<Task, "id" | "status">>({
    title: "",
    description: "",
    dueDate: new Date(),
    priority: "medium",
    repeat: "never"
  });

  const addTask = () => {
    if (!newTask.title) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان المهمة",
        variant: "destructive"
      });
      return;
    }

    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      status: "pending"
    };

    setTasks([...tasks, task]);
    
    // Reset form
    setNewTask({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium",
      repeat: "never"
    });

    toast({
      title: "تمت الإضافة",
      description: "تم إضافة المهمة بنجاح"
    });
  };

  const completeTask = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, status: "completed" as TaskStatus } : task
    );
    
    setTasks(updatedTasks);
    
    toast({
      title: "تمت المهمة",
      description: "تم تحديث حالة المهمة إلى مكتملة"
    });
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف المهمة بنجاح"
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">عالية</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 hover:bg-amber-600">متوسطة</Badge>;
      case "low":
        return <Badge className="bg-green-500 hover:bg-green-600">منخفضة</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getRepeatLabel = (repeat: TaskRepeat) => {
    switch (repeat) {
      case "never": return "لا تكرار";
      case "daily": return "يومي";
      case "weekly": return "أسبوعي";
      case "monthly": return "شهري";
      case "yearly": return "سنوي";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              إضافة مهمة جديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المهمة</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="أدخل عنوان المهمة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف المهمة</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="أدخل وصف المهمة"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        setNewTask({ ...newTask, dueDate: date });
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repeat">التكرار</Label>
                <select
                  id="repeat"
                  value={newTask.repeat}
                  onChange={(e) => setNewTask({ ...newTask, repeat: e.target.value as TaskRepeat })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="never">لا تكرار</option>
                  <option value="daily">يومي</option>
                  <option value="weekly">أسبوعي</option>
                  <option value="monthly">شهري</option>
                  <option value="yearly">سنوي</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={addTask} className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              إضافة المهمة
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">المهام القادمة</h3>
            <Badge variant="outline" className="flex items-center">
              <CalendarClock className="h-3 w-3 mr-1" />
              {tasks.filter(task => task.status === "pending").length} مهام معلقة
            </Badge>
          </div>
          
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CalendarClock className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد مهام مجدولة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <Card key={task.id} className={`${task.status === "completed" ? "opacity-70" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-medium mb-1 ${task.status === "completed" ? "line-through" : ""}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="outline" className="flex items-center">
                                <CalendarClock className="h-3 w-3 mr-1" />
                                {formatDate(task.dueDate)}
                              </Badge>
                              {task.repeat !== "never" && (
                                <Badge variant="outline" className="flex items-center">
                                  {getRepeatLabel(task.repeat)}
                                </Badge>
                              )}
                              {getPriorityBadge(task.priority)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {task.status !== "completed" && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => completeTask(task.id)}
                                className="h-7 w-7"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteTask(task.id)}
                              className="h-7 w-7 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
