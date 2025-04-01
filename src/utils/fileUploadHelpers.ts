
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
