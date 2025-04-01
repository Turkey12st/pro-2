
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
    // استخراج اسم الملف من المسار
    const fileName = getFileNameFromPath(filePath);
    
    // استخراج bucket واسم الملف من عنوان URL
    const url = new URL(filePath);
    const pathParts = url.pathname.split('/');
    const bucketName = pathParts[1]; // افتراض أن المسار هو /storage/v1/[bucket_name]/...
    
    // إنشاء مسار الملف بدون الـ URL الكامل
    const storageFilePath = pathParts.slice(3).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([storageFilePath]);

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

/**
 * رفع مرفق للقيد المحاسبي
 * @param file الملف المراد رفعه
 * @param entryId معرف القيد المحاسبي
 * @returns وعد بعنوان URL للملف المرفوع
 */
export const uploadJournalEntryAttachment = async (
  file: File,
  entryId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `entry_${entryId}_${Date.now()}.${fileExt}`;
  return uploadFile(file, 'journal-entries', fileName);
};

/**
 * تحديث مرفقات القيد المحاسبي في قاعدة البيانات
 * @param entryId معرف القيد المحاسبي
 * @param attachmentUrl رابط المرفق
 */
export const updateJournalEntryAttachment = async (
  entryId: string,
  attachmentUrl: string
): Promise<void> => {
  try {
    // Check if the table has the column first by making a query
    const { data } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('id', entryId)
      .single();
    
    if (data) {
      // Column exists, update it
      const { error } = await supabase.rpc('update_journal_entry_attachment', {
        p_entry_id: entryId,
        p_attachment_url: attachmentUrl
      });

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error('خطأ في تحديث مرفق القيد المحاسبي:', error);
    throw error;
  }
};

/**
 * حذف مرفق القيد المحاسبي
 * @param entryId معرف القيد المحاسبي
 * @param attachmentUrl رابط المرفق (اختياري)
 */
export const deleteJournalEntryAttachment = async (
  entryId: string,
  attachmentUrl?: string
): Promise<void> => {
  try {
    let fileUrl = attachmentUrl;
    // استعلام عن رابط المرفق إذا لم يتم توفيره
    if (!fileUrl) {
      // Call an RPC function that handles this logic securely
      const { data, error } = await supabase.rpc('get_journal_entry_attachment', {
        p_entry_id: entryId
      });

      if (error) {
        throw error;
      }

      fileUrl = data;
    }

    // حذف المرفق من التخزين إذا كان موجودًا
    if (fileUrl) {
      await deleteFile(fileUrl);
    }

    // Reset the attachment using RPC
    const { error } = await supabase.rpc('reset_journal_entry_attachment', {
      p_entry_id: entryId
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('خطأ في حذف مرفق القيد المحاسبي:', error);
    throw error;
  }
};

/**
 * التحقق من صحة الملف قبل الرفع
 * @param file الملف المراد التحقق منه
 * @param maxSizeInMB الحجم الأقصى بالميجابايت
 * @param allowedTypes أنواع الملفات المسموح بها (مثال: ['pdf', 'jpg'])
 * @returns رسالة الخطأ أو null إذا كان الملف صالحًا
 */
export const validateFile = (
  file: File,
  maxSizeInMB: number = 5,
  allowedTypes?: string[]
): string | null => {
  // التحقق من حجم الملف
  if (file.size > maxSizeInMB * 1024 * 1024) {
    return `حجم الملف يجب أن يكون أقل من ${maxSizeInMB} ميجابايت`;
  }
  
  // التحقق من نوع الملف إذا تم تحديد أنواع مسموحة
  if (allowedTypes && allowedTypes.length > 0) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.includes(fileExt)) {
      return `نوع الملف غير مسموح به. الأنواع المسموحة: ${allowedTypes.join(', ')}`;
    }
  }
  
  return null;
};
