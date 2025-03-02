
// تأكد من وجود هذه الملفات في المشروع، وإلا فعلينا إنشاؤها أو استبدالها بمكونات بديلة
// سنقوم بتغيير أي استدعاءات للمكونات غير الموجودة بمكونات معادلة متوفرة
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the DocumentFormData interface to avoid deep types
interface DocumentFormData {
  title: string;
  type: string;
  number: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'soon-expire';
  reminder_days: number[];
  document_url?: string;
  metadata?: Record<string, unknown>;
}

export default function DocumentForm({ editMode = false, documentData = null, onSuccess = () => {} }) {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    type: '',
    number: '',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    expiry_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    status: 'active',
    reminder_days: [30, 14, 7],
    document_url: '',
    metadata: {}
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editMode && documentData) {
      setFormData({
        title: documentData.title,
        type: documentData.type,
        number: documentData.number || '',
        issue_date: documentData.issue_date,
        expiry_date: documentData.expiry_date,
        status: documentData.status,
        reminder_days: documentData.reminder_days || [30, 14, 7],
        document_url: documentData.document_url || '',
        metadata: documentData.metadata || {}
      });
    }
  }, [editMode, documentData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // تحديد نوع الحالة بناءً على تاريخ الانتهاء
      const today = new Date();
      const expiryDate = new Date(formData.expiry_date);
      const daysDiff = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let status: 'active' | 'expired' | 'soon-expire';
      if (daysDiff < 0) {
        status = 'expired';
      } else if (daysDiff <= 30) {
        status = 'soon-expire';
      } else {
        status = 'active';
      }

      // تحديث البيانات المرسلة
      const dataToSubmit = {
        ...formData,
        status
      };

      if (editMode && documentData) {
        // تحديث وثيقة موجودة
        const { error } = await supabase
          .from('company_documents')
          .update(dataToSubmit)
          .eq('id', documentData.id);

        if (error) throw error;
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث بيانات الوثيقة بنجاح"
        });
      } else {
        // إنشاء وثيقة جديدة
        const { error } = await supabase
          .from('company_documents')
          .insert([dataToSubmit]);

        if (error) throw error;
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تمت إضافة وثيقة جديدة بنجاح"
        });
      }

      // إعادة تحميل البيانات وتنفيذ الإجراء بعد النجاح
      queryClient.invalidateQueries({ queryKey: ['company_documents'] });
      onSuccess();
    } catch (error) {
      console.error("Error submitting document:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الوثيقة، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{editMode ? 'تحديث وثيقة' : 'إضافة وثيقة جديدة'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الوثيقة</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="أدخل عنوان الوثيقة"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">نوع الوثيقة</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الوثيقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial_registration">سجل تجاري</SelectItem>
                  <SelectItem value="tax_certificate">شهادة ضريبية</SelectItem>
                  <SelectItem value="social_insurance">التأمينات الاجتماعية</SelectItem>
                  <SelectItem value="chamber_of_commerce">عضوية الغرفة التجارية</SelectItem>
                  <SelectItem value="municipality_license">رخصة البلدية</SelectItem>
                  <SelectItem value="zakat_certificate">شهادة الزكاة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">رقم الوثيقة</Label>
              <Input
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                placeholder="أدخل رقم الوثيقة"
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الإصدار</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.issue_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formData.issue_date ? format(new Date(formData.issue_date), 'yyyy-MM-dd') : <span>اختر التاريخ</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.issue_date ? new Date(formData.issue_date) : undefined}
                    onSelect={(date) => handleDateChange('issue_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>تاريخ الانتهاء</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formData.expiry_date ? format(new Date(formData.expiry_date), 'yyyy-MM-dd') : <span>اختر التاريخ</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiry_date ? new Date(formData.expiry_date) : undefined}
                    onSelect={(date) => handleDateChange('expiry_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_url">رابط الوثيقة (اختياري)</Label>
              <Input
                id="document_url"
                name="document_url"
                value={formData.document_url || ''}
                onChange={handleInputChange}
                placeholder="أدخل رابط الوثيقة"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onSuccess()}>إلغاء</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : (editMode ? 'تحديث الوثيقة' : 'إضافة الوثيقة')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
