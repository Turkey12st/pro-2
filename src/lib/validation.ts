import { z } from 'zod';

// Employee validation schema
export const employeeSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين').max(100, 'الاسم طويل جداً'),
  identity_number: z.string().min(10, 'رقم الهوية يجب أن يكون 10 أرقام').max(10, 'رقم الهوية يجب أن يكون 10 أرقام'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  salary: z.number().min(0, 'الراتب لا يمكن أن يكون سالباً').max(999999, 'الراتب كبير جداً'),
  birth_date: z.string().min(1, 'تاريخ الميلاد مطلوب'),
  joining_date: z.string().min(1, 'تاريخ الالتحاق مطلوب'),
  position: z.string().min(2, 'المنصب مطلوب'),
  department: z.string().min(2, 'القسم مطلوب'),
  nationality: z.string().min(2, 'الجنسية مطلوبة'),
  contract_type: z.enum(['full-time', 'part-time', 'contract', 'intern'], {
    errorMap: () => ({ message: 'نوع العقد غير صحيح' })
  })
});

// Financial validation schema
export const financialSchema = z.object({
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر').max(9999999999, 'المبلغ كبير جداً'),
  description: z.string().min(3, 'الوصف يجب أن يكون أكثر من 3 أحرف').max(500, 'الوصف طويل جداً'),
  date: z.string().min(1, 'التاريخ مطلوب')
});

// Company partner validation schema
export const partnerSchema = z.object({
  name: z.string().min(2, 'اسم الشريك مطلوب').max(100, 'الاسم طويل جداً'),
  ownership_percentage: z.number()
    .min(0.01, 'نسبة الملكية يجب أن تكون أكبر من صفر')
    .max(100, 'نسبة الملكية لا يمكن أن تتجاوز 100%'),
  share_value: z.number().min(0, 'قيمة الحصة لا يمكن أن تكون سالبة'),
  partner_type: z.enum(['individual', 'company'], {
    errorMap: () => ({ message: 'نوع الشريك غير صحيح' })
  })
});

// Journal entry validation schema
export const journalEntrySchema = z.object({
  description: z.string().min(3, 'الوصف مطلوب').max(500, 'الوصف طويل جداً'),
  entry_date: z.string().min(1, 'تاريخ القيد مطلوب'),
  total_debit: z.number().min(0, 'إجمالي المدين لا يمكن أن يكون سالباً'),
  total_credit: z.number().min(0, 'إجمالي الدائن لا يمكن أن يكون سالباً'),
  reference_number: z.string().optional()
});

// File upload validation
export const validateFileUpload = (file: File) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (file.size > maxSize) {
    throw new Error('حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('نوع الملف غير مدعوم');
  }

  return true;
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// Validate and sanitize form data
export const validateAndSanitizeFormData = <T>(
  data: Record<string, any>, 
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    // Sanitize string fields
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? sanitizeInput(value) : value;
      return acc;
    }, {} as Record<string, any>);

    const result = schema.parse(sanitizedData);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['خطأ في التحقق من البيانات'] };
  }
};

export { z };