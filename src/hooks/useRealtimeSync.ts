import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type RealtimeTable = 'employees' | 'employee_salaries' | 'journal_entries' | 'payroll_cycles' | 'attendance_records' | 'data_sync_log';

interface RealtimeSyncOptions {
  tables: RealtimeTable[];
  onSync?: (table: string, event: string, payload: any) => void;
  showNotifications?: boolean;
}

const TABLE_LABELS: Record<RealtimeTable, string> = {
  employees: 'الموظفين',
  employee_salaries: 'الرواتب',
  journal_entries: 'القيود المحاسبية',
  payroll_cycles: 'دورات الرواتب',
  attendance_records: 'الحضور',
  data_sync_log: 'سجل المزامنة',
};

const TABLE_QUERY_KEYS: Record<RealtimeTable, string[]> = {
  employees: ['employees', 'integratedData', 'dashboardStats'],
  employee_salaries: ['employeeSalaries', 'payroll', 'integratedData', 'dashboardStats'],
  journal_entries: ['journalEntries', 'financials', 'integratedData'],
  payroll_cycles: ['payrollCycles', 'payroll'],
  attendance_records: ['attendance', 'integratedData'],
  data_sync_log: ['syncLog'],
};

/**
 * هوك للاشتراك في التحديثات الفورية من Supabase Realtime
 * يُحدّث React Query cache تلقائياً عند أي تغيير في الجداول المُراقبة
 */
export function useRealtimeSync(options: RealtimeSyncOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateQueries = useCallback(
    (table: RealtimeTable) => {
      const keys = TABLE_QUERY_KEYS[table] || [];
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    [queryClient]
  );

  useEffect(() => {
    const channel = supabase
      .channel('erp-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const table = payload.table as RealtimeTable;

        // فقط الجداول المُسجّلة
        if (!options.tables.includes(table)) return;

        // تحديث React Query cache
        invalidateQueries(table);

        // إرسال callback مخصص
        options.onSync?.(table, payload.eventType, payload);

        // إشعار المستخدم (اختياري)
        if (options.showNotifications && payload.eventType !== 'DELETE') {
          const label = TABLE_LABELS[table] || table;
          const action =
            payload.eventType === 'INSERT'
              ? 'إضافة'
              : payload.eventType === 'UPDATE'
              ? 'تحديث'
              : 'حذف';

          toast({
            title: `تحديث فوري - ${label}`,
            description: `تم ${action} بيانات في ${label}`,
            duration: 3000,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.tables, options.showNotifications, invalidateQueries, toast, options.onSync]);
}

/**
 * هوك مبسّط لمراقبة جدول واحد
 */
export function useRealtimeTable(table: RealtimeTable, onUpdate?: () => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          const keys = TABLE_QUERY_KEYS[table] || [];
          keys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: [key] });
          });
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryClient, onUpdate]);
}
