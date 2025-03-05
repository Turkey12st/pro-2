
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash, Bell, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  repeat: "never" | "daily" | "weekly" | "monthly";
};

export function TaskScheduler() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "تجديد رخصة البلدية",
      description: "يجب تجديد رخصة البلدية قبل انتهائها",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      priority: "high",
      status: "pending",
      repeat: "yearly"
    } as Task,
    {
      id: "2",
      title: "تسليم ملفات الزكاة",
      description: "تسليم ملفات الزكاة للهيئة العامة للزكاة والدخل",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: "medium",
      status: "pending",
      repeat: "yearly"
    } as Task
  ]);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: new Date(),
    priority: "medium",
    repeat: "never",
    status: "pending"
  });

  const handleAddTask = () => {
    if (!newTask.title) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال عنوان المهمة"
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title || "",
      description: newTask.description || "",
      dueDate: newTask.dueDate || new Date(),
      priority: newTask.priority as "high" | "medium" | "low" || "medium",
      repeat: newTask.repeat as "never" | "daily" | "weekly" | "monthly" || "never",
      status: "pending"
    };

    setTasks([...tasks, task]);
    
    // إعادة تعيين النموذج
    setNewTask({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium",
      repeat: "never",
      status: "pending"
    });

    toast({
      title: "تمت الإضافة بنجاح",
      description: "تمت إضافة المهمة الجديدة بنجاح"
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف المهمة بنجاح"
    });
  };

  const handleCompleteTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: 'completed' } : task
    ));
    toast({
      title: "تم الإكمال",
      description: "تم تحديث حالة المهمة بنجاح"
    });
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTaskPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالي";
      case "medium":
        return "متوسط";
      case "low":
        return "منخفض";
      default:
        return "";
    }
  };

  const getTaskRepeatLabel = (repeat: string) => {
    switch (repeat) {
      case "never":
        return "مرة واحدة";
      case "daily":
        return "يومي";
      case "weekly":
        return "أسبوعي";
      case "monthly":
        return "شهري";
      case "yearly":
        return "سنوي";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">إضافة مهمة جديدة</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المهمة</Label>
              <Input
                id="title"
                value={newTask.title || ""}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="أدخل عنوان المهمة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف المهمة</Label>
              <Textarea
                id="description"
                value={newTask.description || ""}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="أدخل وصف المهمة"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ المستهدف</Label>
                <DatePicker
                  selected={newTask.dueDate}
                  onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                  placeholder="اختر التاريخ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as "high" | "medium" | "low" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat">التكرار</Label>
              <Select
                value={newTask.repeat}
                onValueChange={(value) => setNewTask({ ...newTask, repeat: value as "never" | "daily" | "weekly" | "monthly" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نمط التكرار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">مرة واحدة</SelectItem>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddTask} className="w-full">
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة المهمة
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">المهام المجدولة</h3>
          {tasks.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              <Bell className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium">لا توجد مهام</h3>
              <p className="text-muted-foreground">لم يتم إضافة أي مهام مجدولة بعد.</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المهمة</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>التكرار</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} className={task.status === "completed" ? "opacity-60 bg-muted/10" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className={task.status === "completed" ? "line-through" : ""}>
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTaskPriorityColor(task.priority)}>
                          {getTaskPriorityLabel(task.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {format(task.dueDate, "yyyy-MM-dd")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getTaskRepeatLabel(task.repeat)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {task.status !== "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleCompleteTask(task.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
