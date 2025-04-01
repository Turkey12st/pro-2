
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzkixldwdnvsgxazguaw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6a2l4bGR3ZG52c2d4YXpndWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MjI2MDksImV4cCI6MjAyNjE5ODYwOX0.F4qkDjvx_6RjYZ3yMgMGdmVW4gRG9Qp2Zv2qcnWHg4g';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'my-app-name',
    },
  },
});

// إضافة وظائف مساعدة للتعامل مع قاعدة البيانات
export const handleDatabaseError = (error: any) => {
  console.error('Database Error:', error);
  let errorMessage = 'حدث خطأ في قاعدة البيانات';
  
  if (error.message) {
    errorMessage = error.message;
  } else if (error.details) {
    errorMessage = error.details;
  }
  
  return errorMessage;
};

// التحقق من صحة البيانات قبل الإرسال
export const validateData = (data: any, requiredFields: string[]) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`الحقل ${field} مطلوب`);
    }
  }
  
  return errors;
};

// إنشاء دالة لإضافة خصائص للملف المرفق
export const addAttachmentMetadata = (journalEntry: any, attachmentUrl?: string) => {
  if (attachmentUrl) {
    // استخدام spread operator للحفاظ على البيانات الموجودة وإضافة خاصية جديدة
    return {
      ...journalEntry,
      attachment_url: attachmentUrl
    };
  }
  return journalEntry;
};
