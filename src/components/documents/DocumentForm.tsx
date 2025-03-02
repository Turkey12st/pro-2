import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Document } from "@/types/database";
import { useState } from "react";
import { FileUploader } from "@/components/ui/file-uploader";
import { MultiSelect } from "@/components/ui/multi-select";

const documentSchema = z.object({
  title: z.string().min(2, {
    message: "عنوان المستند يجب أن يحتوي على حرفين على الأقل",
  }),
  type: z.string({
    required_error: "يرجى اختيار نوع المستند",
  }),
  number: z.string().optional(),
  issue_date: z.date({
    required_error: "يرجى اختيار تاريخ الإصدار",
  }),
  expiry_date: z.date({
    required_error: "يرجى اختيار تاريخ الانتهاء",
  }),
  reminder_days: z.array(z.number()).optional(),
  notes: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

const documentTypes = [
  { label: "سجل تجاري", value: "commercial_register" },
  { label: "رخصة بلدية", value: "municipality_license" },
  { label: "شهادة الزكاة", value: "zakat_certificate" },
  { label: "شهادة الغرفة التجارية", value: "chamber_certificate" },
  { label: "شهادة السعودة", value: "saudization_certificate" },
  { label: "شهادة التأمينات", value: "insurance_certificate" },
  { label: "شهادة القيمة المضافة", value: "vat_certificate" },
  { label: "عقد تأسيس", value: "establishment_contract" },
  { label: "أخرى", value: "other" },
];

const reminderOptions = [
  { label: "قبل يوم واحد", value: 1 },
  { label: "قبل 3 أيام", value: 3 },
  { label: "قبل أسبوع", value: 7 },
  { label: "قبل أسبوعين", value: 14 },
  { label: "قبل شهر", value: 30 },
  { label: "قبل شهرين", value: 60 },
  { label: "قبل 3 أشهر", value: 90 },
];

interface DocumentFormProps {
  initialData?: Document;
  onSuccess?: () => void;
}

export function DocumentForm({ initialData, onSuccess }: DocumentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          issue_date: new Date(initialData.issue_date),
          expiry_date: new Date(initialData.expiry_date),
          reminder_days: initialData.reminder_days || [],
          notes: initialData.metadata?.notes || "",
        }
      : {
          title: "",
          type: "",
          number: "",
          reminder_days: [30],
          notes: "",
        },
  });

  const onSubmit = async (data: DocumentFormValues) => {
    setIsSubmitting(true);
    try {
      let documentUrl = initialData?.document_url || null;

      // Upload document if provided
      if (documentFile) {
        const fileName = `documents/${Date.now()}_${documentFile.name}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("company-documents")
          .upload(fileName, documentFile);

        if (uploadError) throw uploadError;
        
        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("company-documents")
            .getPublicUrl(fileName);
          
          documentUrl = urlData.publicUrl;
        }
      }

      // Calculate document status
      const today = new Date();
      const expiryDate = data.expiry_date;
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let status: "active" | "expired" | "soon-expire" = "active";
      if (daysUntilExpiry < 0) {
        status = "expired";
      } else if (daysUntilExpiry <= 30) {
        status = "soon-expire";
      }

      const documentData = {
        title: data.title,
        type: data.type,
        number: data.number || null,
        issue_date: data.issue_date.toISOString().split("T")[0],
        expiry_date: data.expiry_date.toISOString().split("T")[0],
        status,
        reminder_days: data.reminder_days || [30],
        document_url: documentUrl,
        metadata: {
          notes: data.notes,
          ...(initialData?.metadata ? (initialData.metadata as Record<string, unknown> || {}) : {}),
        },
      };

      if (initialData?.id) {
        // Update existing document
        const { error } = await supabase
          .from("company_documents")
          .update(documentData)
          .eq("id", initialData.id);

        if (error) throw error;

        toast({
          title: "تم تحديث المستند بنجاح",
          description: "تم تحديث بيانات المستند في النظام",
        });
      } else {
        // Create new document
        const { error } = await supabase
          .from("company_documents")
          .insert(documentData);

        if (error) throw error;

        toast({
          title: "تم إضافة المستند بنجاح",
          description: "تمت إضافة المستند الجديد إلى النظام",
        });
      }

      // Refresh documents data
      queryClient.invalidateQueries({ queryKey: ["company_documents"] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
      
      // Reset form if creating new document
      if (!initialData) {
        form.reset({
          title: "",
          type: "",
          number: "",
          reminder_days: [30],
          notes: "",
        });
        setDocumentFile(null);
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ المستند",
        description: "حدث خطأ أثناء محاولة حفظ المستند. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان المستند *</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل عنوان المستند" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع المستند *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المستند" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم المستند</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم المستند (اختياري)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issue_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ الإصدار *</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  locale="ar"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ الانتهاء *</FormLabel>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  locale="ar"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminder_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تذكير قبل الانتهاء</FormLabel>
                <MultiSelect
                  options={reminderOptions}
                  selected={field.value?.map(v => v.toString()) || []}
                  onChange={(values) => field.onChange(values.map(v => parseInt(v)))}
                  placeholder="اختر أوقات التذكير"
                />
                <FormDescription>
                  اختر متى تريد أن يتم تذكيرك قبل انتهاء المستند
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل أي ملاحظات إضافية حول المستند"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>ملف المستند</FormLabel>
          <FileUploader
            value={documentFile}
            onChange={setDocumentFile}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            maxSize={5}
          />
          {initialData?.document_url && !documentFile && (
            <div className="text-sm text-muted-foreground">
              <a
                href={initialData.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                عرض الملف الحالي
              </a>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? "جاري الحفظ..."
            : initialData
            ? "تحديث المستند"
            : "إضافة المستند"}
        </Button>
      </form>
    </Form>
  );
}
