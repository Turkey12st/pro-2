/**
 * مساعدات التصدير والاستيراد للملفات
 * يدعم Excel, CSV, PDF مع دعم كامل للعربية
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { exportArabicPdf, exportSimplePdf } from './arabicPdfExport';

// BOM للتأكد من عرض UTF-8 بشكل صحيح
const UTF8_BOM = '\uFEFF';

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  companyName?: string;
}

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
}

/**
 * تصدير البيانات إلى Excel مع دعم كامل للعربية
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: ColumnDefinition[],
  options: ExportOptions
): void => {
  try {
    // تحضير البيانات مع الأعمدة المحددة
    const preparedData = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        row[col.header] = item[col.key] ?? '';
      });
      return row;
    });

    // إنشاء ورقة العمل
    const worksheet = XLSX.utils.json_to_sheet(preparedData);
    
    // تعيين عرض الأعمدة
    const colWidths = columns.map(col => ({ wch: col.width || 15 }));
    worksheet['!cols'] = colWidths;
    
    // تعيين اتجاه RTL
    worksheet['!dir'] = 'rtl';

    // إنشاء المصنف
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'البيانات');

    // تصدير الملف
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: true
    });
    
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    
    saveAs(blob, `${options.filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('حدث خطأ أثناء تصدير الملف إلى Excel');
  }
};

/**
 * تصدير البيانات إلى CSV مع دعم UTF-8 للعربية
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  columns: ColumnDefinition[],
  options: ExportOptions
): void => {
  try {
    // تحضير البيانات
    const preparedData = data.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        row[col.header] = item[col.key] ?? '';
      });
      return row;
    });

    // تحويل إلى CSV مع BOM
    const csv = UTF8_BOM + Papa.unparse(preparedData, {
      header: true,
      skipEmptyLines: true
    });

    // إنشاء الملف
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${options.filename}.csv`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('حدث خطأ أثناء تصدير الملف إلى CSV');
  }
};

/**
 * تصدير البيانات إلى PDF مع دعم العربية
 */
export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  columns: ColumnDefinition[],
  options: ExportOptions
): void => {
  try {
    exportArabicPdf({
      title: options.title || options.filename,
      columns: columns.map(col => ({
        header: col.header,
        key: col.key,
        width: col.width
      })),
      data,
      filename: options.filename,
      orientation: 'landscape',
      companyName: options.companyName
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('حدث خطأ أثناء تصدير الملف إلى PDF');
  }
};

/**
 * استيراد ملف Excel وتحويله إلى مصفوفة كائنات
 */
export const importFromExcel = <T = Record<string, any>>(
  file: File
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // قراءة الورقة الأولى
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // تحويل إلى JSON
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('حدث خطأ أثناء قراءة ملف Excel'));
      }
    };
    
    reader.onerror = () => reject(new Error('حدث خطأ أثناء قراءة الملف'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * استيراد ملف CSV وتحويله إلى مصفوفة كائنات
 */
export const importFromCSV = <T = Record<string, any>>(
  file: File
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`حدث خطأ أثناء قراءة ملف CSV: ${error.message}`));
      }
    });
  });
};

/**
 * تحديد نوع الملف المستورد
 */
export const getFileType = (filename: string): 'excel' | 'csv' | 'unknown' => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['xlsx', 'xls'].includes(ext || '')) return 'excel';
  if (ext === 'csv') return 'csv';
  return 'unknown';
};

/**
 * استيراد ملف تلقائيًا بناءً على نوعه
 */
export const importFile = async <T = Record<string, any>>(
  file: File
): Promise<T[]> => {
  const fileType = getFileType(file.name);
  
  switch (fileType) {
    case 'excel':
      return importFromExcel<T>(file);
    case 'csv':
      return importFromCSV<T>(file);
    default:
      throw new Error('نوع الملف غير مدعوم. يرجى استخدام ملف Excel أو CSV');
  }
};
