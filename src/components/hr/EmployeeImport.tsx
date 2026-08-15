
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const pick = (row: Record<string, any>, keys: string[]) => {
  for (const k of keys) {
    const found = Object.keys(row).find((c) => c.trim().toLowerCase() === k.trim().toLowerCase());
    if (found && row[found] !== undefined && row[found] !== "") return row[found];
  }
  return undefined;
};

const toDate = (v: any): string | undefined => {
  if (!v) return undefined;
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

const EmployeeImport: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImportedFile(file);
    }
    e.target.value = "";
  };

  const processImportedFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setIsImporting(true);
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        if (jsonData.length === 0) {
          throw new Error("الملف لا يحتوي على بيانات");
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("يجب تسجيل الدخول لاستيراد الموظفين");

        const rows = jsonData
          .map((row) => {
            const name = pick(row, ["الاسم", "اسم الموظف", "name", "employee_name"]);
            if (!name) return null;
            const baseSalary = Number(pick(row, ["الراتب الأساسي", "base_salary", "basic_salary"]) ?? 0) || 0;
            const salary = Number(pick(row, ["الراتب", "salary", "الراتب الإجمالي"]) ?? baseSalary) || 0;
            return {
              name: String(name),
              identity_number: String(pick(row, ["رقم الهوية", "الهوية", "identity_number", "national_id"]) ?? ""),
              nationality: String(pick(row, ["الجنسية", "nationality"]) ?? "سعودي"),
              position: String(pick(row, ["المسمى الوظيفي", "الوظيفة", "position", "job_title"]) ?? ""),
              department: String(pick(row, ["القسم", "الإدارة", "department"]) ?? ""),
              email: pick(row, ["البريد الإلكتروني", "email"]) ? String(pick(row, ["البريد الإلكتروني", "email"])) : null,
              phone: pick(row, ["الجوال", "الهاتف", "phone", "mobile"]) ? String(pick(row, ["الجوال", "الهاتف", "phone", "mobile"])) : null,
              birth_date: toDate(pick(row, ["تاريخ الميلاد", "birth_date"])) ?? null,
              joining_date: toDate(pick(row, ["تاريخ التعيين", "تاريخ الالتحاق", "joining_date", "hire_date"])) ?? new Date().toISOString().slice(0, 10),
              contract_type: String(pick(row, ["نوع العقد", "contract_type"]) ?? "دوام كامل"),
              salary,
              base_salary: baseSalary || salary,
              housing_allowance: Number(pick(row, ["بدل السكن", "housing_allowance"]) ?? 0) || 0,
              transportation_allowance: Number(pick(row, ["بدل النقل", "transportation_allowance"]) ?? 0) || 0,
              created_by: user.id,
            };
          })
          .filter(Boolean);

        if (rows.length === 0) {
          throw new Error("لم يتم العثور على صفوف صالحة (تأكد من وجود عمود «الاسم»)");
        }

        const { error } = await supabase.from("employees").insert(rows as any);
        if (error) throw error;

        toast({
          title: "تم استيراد البيانات",
          description: `تم حفظ ${rows.length} موظف في قاعدة البيانات.`,
        });
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      } catch (error) {
        console.error("Error processing imported file:", error);
        toast({
          title: "خطأ في معالجة الملف",
          description: error.message || "حدث خطأ أثناء معالجة الملف المستورد.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      toast({
        title: "خطأ في قراءة الملف",
        description: "حدث خطأ أثناء محاولة قراءة الملف.",
        variant: "destructive",
      });
    };
    
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleImportClick}
        disabled={isImporting}
      >
        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isImporting ? "جارٍ الاستيراد..." : "استيراد من Excel"}
      </Button>
    </>
  );
};

export default EmployeeImport;
