
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";

/**
 * تحويل ملف Excel إلى JSON
 * @param file ملف Excel المراد تحويله
 * @returns وعد يحتوي على البيانات المحولة
 */
export const excelToJson = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

/**
 * تحويل ملف CSV إلى JSON
 * @param file ملف CSV المراد تحويله
 * @returns وعد يحتوي على البيانات المحولة
 */
export const csvToJson = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * تحويل بيانات JSON إلى ملف Excel
 * @param data البيانات المراد تحويلها
 * @param filename اسم الملف
 * @param sheetName اسم ورقة العمل
 */
export const jsonToExcel = (data: any[], filename: string, sheetName: string = "Sheet1"): void => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error converting to Excel:", error);
    throw error;
  }
};

/**
 * تحويل بيانات JSON إلى ملف CSV
 * @param data البيانات المراد تحويلها
 * @param filename اسم الملف
 */
export const jsonToCsv = (data: any[], filename: string): void => {
  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  } catch (error) {
    console.error("Error converting to CSV:", error);
    throw error;
  }
};

/**
 * تحويل بيانات JSON إلى ملف PDF
 * @param data البيانات المراد تحويلها
 * @param filename اسم الملف
 * @param columns أعمدة الجدول
 * @param isRTL توجيه النص من اليمين إلى اليسار
 */
export const jsonToPdf = (
  data: any[], 
  filename: string, 
  columns: string[], 
  title: string = "",
  isRTL: boolean = true
): void => {
  try {
    const doc = new jsPDF(isRTL ? 'p' : 'p', 'mm', 'a4');
    
    if (isRTL) {
      doc.setR2L(true);
    }
    
    // إضافة العنوان
    if (title) {
      doc.setFontSize(16);
      doc.text(title, isRTL ? 200 : 14, 15, { align: isRTL ? 'right' : 'left' });
      doc.setFontSize(10);
    }
    
    // تحويل البيانات إلى صفوف
    const rows = data.map(item => columns.map(col => item[col]));
    
    // إنشاء الجدول
    (doc as any).autoTable({
      head: [columns],
      body: rows,
      theme: 'striped',
      styles: { 
        fontSize: 8, 
        halign: isRTL ? 'right' : 'left' 
      },
      headStyles: { 
        fillColor: [66, 66, 66] 
      },
      margin: { top: title ? 25 : 15 }
    });
    
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error converting to PDF:", error);
    throw error;
  }
};

/**
 * رفع ملف إلى Supabase Storage
 * @param file الملف المراد رفعه
 * @param bucket اسم السلة
 * @param path مسار الملف
 * @returns وعد يحتوي على رابط الملف
 */
export const uploadFileToStorage = async (
  file: File,
  bucket: string = 'documents',
  path: string = ''
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      throw error;
    }
    
    // الحصول على رابط عام للملف
    const { data: urlData } = await supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * حذف ملف من Supabase Storage
 * @param filePath مسار الملف
 * @param bucket اسم السلة
 * @returns وعد
 */
export const deleteFileFromStorage = async (filePath: string, bucket: string = 'documents'): Promise<void> => {
  try {
    // استخراج مسار الملف من الرابط العام
    const url = new URL(filePath);
    const path = url.pathname.split('/').slice(3).join('/');
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * تحويل رابط الصورة إلى Base64
 * @param url رابط الصورة
 * @returns وعد يحتوي على البيانات المحولة
 */
export const imageUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * رفع صورة شعار الشركة
 * @param file ملف الصورة
 * @returns وعد يحتوي على رابط الصورة
 */
export const uploadCompanyLogo = async (file: File): Promise<string> => {
  return uploadFileToStorage(file, 'logos', 'company');
};

/**
 * تحقق من نوع الملف
 * @param file الملف المراد التحقق منه
 * @param allowedTypes أنواع الملفات المسموح بها
 * @returns نتيجة التحقق
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(`.${fileExt}`);
};

/**
 * التحقق من حجم الملف
 * @param file الملف المراد التحقق منه
 * @param maxSizeInMB الحجم الأقصى بالميجابايت
 * @returns نتيجة التحقق
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const fileSizeInMB = file.size / (1024 * 1024);
  return fileSizeInMB <= maxSizeInMB;
};
