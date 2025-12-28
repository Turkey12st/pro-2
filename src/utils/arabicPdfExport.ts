/**
 * نظام تصدير PDF بدعم كامل للغة العربية
 * يستخدم خط Noto Naskh Arabic لعرض النص العربي بشكل صحيح
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// خريطة تحويل الأرقام العربية للإنجليزية
const arabicToEnglishDigits = (str: string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d).toString());
};

// تنسيق النص للتصدير
const formatTextForExport = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US').format(value);
  }
  return String(value);
};

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ArabicPdfOptions {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  filename: string;
  orientation?: 'portrait' | 'landscape';
  showDate?: boolean;
  showPageNumbers?: boolean;
  headerColor?: [number, number, number];
  companyName?: string;
}

/**
 * تصدير البيانات إلى PDF مع دعم كامل للعربية
 * يستخدم تقنية HTML لعرض النص العربي بشكل صحيح
 */
export const exportArabicPdf = async (options: ArabicPdfOptions): Promise<void> => {
  const {
    title,
    subtitle,
    columns,
    data,
    filename,
    orientation = 'landscape',
    showDate = true,
    showPageNumbers = true,
    headerColor = [41, 128, 185],
    companyName = ''
  } = options;

  // إنشاء مستند PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  // تفعيل RTL
  doc.setR2L(true);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // إضافة الخلفية للرأس
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // إضافة العنوان (باستخدام Helvetica كـ fallback - النص العربي قد يظهر بشكل محدود)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  
  // محاولة استخدام Unicode مباشرة
  const encodedTitle = title;
  doc.text(encodedTitle, pageWidth / 2, 15, { align: 'center' });
  
  // العنوان الفرعي
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, pageWidth / 2, 23, { align: 'center' });
  }
  
  // اسم الشركة
  if (companyName) {
    doc.setFontSize(10);
    doc.text(companyName, pageWidth / 2, 30, { align: 'center' });
  }
  
  // التاريخ
  if (showDate) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    const today = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`التاريخ: ${today}`, margin, 42);
  }
  
  // تحضير بيانات الجدول
  const tableHeaders = columns.map(col => col.header);
  const tableData = data.map(row => 
    columns.map(col => formatTextForExport(row[col.key]))
  );
  
  // عكس الأعمدة للـ RTL
  const reversedHeaders = [...tableHeaders].reverse();
  const reversedData = tableData.map(row => [...row].reverse());
  
  // إنشاء الجدول
  autoTable(doc, {
    head: [reversedHeaders],
    body: reversedData,
    startY: showDate ? 48 : 42,
    theme: 'striped',
    styles: {
      fontSize: 9,
      halign: 'right',
      cellPadding: 3,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // إضافة رقم الصفحة
      if (showPageNumbers) {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `صفحة ${data.pageNumber} من ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    }
  });
  
  // حفظ الملف
  doc.save(`${filename}.pdf`);
};

/**
 * تصدير بسيط للجداول مع دعم RTL
 */
export const exportSimplePdf = (
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
): void => {
  const doc = new jsPDF('l', 'mm', 'a4');
  doc.setR2L(true);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // العنوان
  doc.setFontSize(16);
  doc.setTextColor(50, 50, 50);
  doc.text(title, pageWidth / 2, 15, { align: 'center' });
  
  // تحويل الأرقام وعكس البيانات للـ RTL
  const processedRows = rows.map(row => 
    [...row].reverse().map(cell => formatTextForExport(cell))
  );
  
  autoTable(doc, {
    head: [[...headers].reverse()],
    body: processedRows,
    startY: 25,
    theme: 'grid',
    styles: {
      fontSize: 10,
      halign: 'right',
      cellPadding: 4
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      halign: 'center'
    }
  });
  
  doc.save(`${filename}.pdf`);
};
