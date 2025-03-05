
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, User, Filter, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  details: string;
  type: "info" | "warning" | "error" | "success";
}

export function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");

  useEffect(() => {
    // In a real application, this would fetch from an API
    const mockLogs: LogEntry[] = [
      {
        id: "1",
        timestamp: new Date(2024, 5, 15, 10, 30),
        user: "أحمد محمد",
        action: "إنشاء",
        module: "العملاء",
        details: "تم إضافة عميل جديد: شركة التقنية المتطورة",
        type: "success"
      },
      {
        id: "2",
        timestamp: new Date(2024, 5, 15, 11, 45),
        user: "سارة عبدالله",
        action: "تعديل",
        module: "المالية",
        details: "تم تحديث معلومات الفاتورة رقم INV-2024-0103",
        type: "info"
      },
      {
        id: "3",
        timestamp: new Date(2024, 5, 14, 9, 15),
        user: "محمد علي",
        action: "حذف",
        module: "المشاريع",
        details: "تم حذف مشروع: تطوير نظام المحاسبة",
        type: "warning"
      },
      {
        id: "4",
        timestamp: new Date(2024, 5, 14, 14, 20),
        user: "نورة سعد",
        action: "تسجيل الدخول",
        module: "النظام",
        details: "تم تسجيل الدخول من جهاز جديد",
        type: "info"
      },
      {
        id: "5",
        timestamp: new Date(2024, 5, 13, 16, 30),
        user: "فهد عبدالرحمن",
        action: "إنشاء",
        module: "الموظفين",
        details: "تم إضافة موظف جديد: عبدالله محمد",
        type: "success"
      },
      {
        id: "6",
        timestamp: new Date(2024, 5, 13, 11, 10),
        user: "النظام",
        action: "خطأ",
        module: "قاعدة البيانات",
        details: "فشل في الاتصال بقاعدة البيانات - محاولة إعادة الاتصال",
        type: "error"
      },
      {
        id: "7",
        timestamp: new Date(2024, 5, 12, 9, 45),
        user: "عبدالله محمد",
        action: "تحديث",
        module: "الإعدادات",
        details: "تم تغيير إعدادات الإشعارات للنظام",
        type: "info"
      }
    ];
    
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, currentFilter, logs]);

  const filterLogs = () => {
    let filtered = [...logs];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by type
    if (currentFilter !== "all") {
      filtered = filtered.filter(log => log.type === currentFilter);
    }
    
    setFilteredLogs(filtered);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case "info": return <Info className="h-5 w-5 text-blue-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getLogTypeLabel = (type: string) => {
    switch(type) {
      case "info": return "معلومات";
      case "warning": return "تحذير";
      case "error": return "خطأ";
      case "success": return "نجاح";
      default: return "";
    }
  };

  const getBadgeVariant = (type: string) => {
    switch(type) {
      case "info": return "default";
      case "warning": return "warning";
      case "error": return "destructive";
      case "success": return "success";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في السجل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={currentFilter} onValueChange={setCurrentFilter} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="info">معلومات</TabsTrigger>
          <TabsTrigger value="success">نجاح</TabsTrigger>
          <TabsTrigger value="warning">تحذير</TabsTrigger>
          <TabsTrigger value="error">أخطاء</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <LogList logs={filteredLogs} formatDate={formatDate} getLogIcon={getLogIcon} getLogTypeLabel={getLogTypeLabel} getBadgeVariant={getBadgeVariant} />
        </TabsContent>
        
        <TabsContent value="info" className="mt-0">
          <LogList logs={filteredLogs} formatDate={formatDate} getLogIcon={getLogIcon} getLogTypeLabel={getLogTypeLabel} getBadgeVariant={getBadgeVariant} />
        </TabsContent>
        
        <TabsContent value="success" className="mt-0">
          <LogList logs={filteredLogs} formatDate={formatDate} getLogIcon={getLogIcon} getLogTypeLabel={getLogTypeLabel} getBadgeVariant={getBadgeVariant} />
        </TabsContent>
        
        <TabsContent value="warning" className="mt-0">
          <LogList logs={filteredLogs} formatDate={formatDate} getLogIcon={getLogIcon} getLogTypeLabel={getLogTypeLabel} getBadgeVariant={getBadgeVariant} />
        </TabsContent>
        
        <TabsContent value="error" className="mt-0">
          <LogList logs={filteredLogs} formatDate={formatDate} getLogIcon={getLogIcon} getLogTypeLabel={getLogTypeLabel} getBadgeVariant={getBadgeVariant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface LogListProps {
  logs: LogEntry[];
  formatDate: (date: Date) => string;
  getLogIcon: (type: string) => JSX.Element;
  getLogTypeLabel: (type: string) => string;
  getBadgeVariant: (type: string) => string;
}

function LogList({ logs, formatDate, getLogIcon, getLogTypeLabel, getBadgeVariant }: LogListProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Info className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد سجلات تطابق البحث</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map(log => (
        <Card key={log.id} className="overflow-hidden">
          <div className={`h-1 ${
            log.type === 'info' ? 'bg-blue-500' : 
            log.type === 'warning' ? 'bg-amber-500' : 
            log.type === 'error' ? 'bg-red-500' : 
            'bg-green-500'
          }`}></div>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getLogIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <p className="font-medium">{log.details}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">{log.user}</span> • {log.action} • {log.module}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Badge variant={getBadgeVariant(log.type) as any}>
                      {getLogTypeLabel(log.type)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
