
import { supabase } from "@/integrations/supabase/client";

/**
 * رفع ملف إلى Supabase Storage
 * @param file الملف المراد رفعه
 * @param path المسار في التخزين (مثال: 'journal-entries')
 * @param fileName اسم الملف (اختياري)
 * @returns وعد بعنوان URL للملف المرفوع
 */
export const uploadFile = async (
  file: File,
  path: string,
  fileName?: string
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const generatedFileName = fileName || `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${generatedFileName}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    throw error;
  }
};

/**
 * حذف ملف من Supabase Storage
 * @param filePath مسار الملف المراد حذفه
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
    throw error;
  }
};

/**
 * استخراج اسم الملف من مسار كامل
 * @param fullPath المسار الكامل للملف
 * @returns اسم الملف
 */
export const getFileNameFromPath = (fullPath: string): string => {
  const parts = fullPath.split('/');
  return parts[parts.length - 1];
};

/**
 * الحصول على نوع الملف بناءً على الامتداد
 * @param fileName اسم الملف أو مساره
 * @returns نوع الملف (مثل 'pdf', 'image', 'document', 'unknown')
 */
export const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'unknown';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
    return 'image';
  } else if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension)) {
    return 'document';
  } else {
    return 'unknown';
  }
};
