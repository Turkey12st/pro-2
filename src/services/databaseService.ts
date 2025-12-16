// خدمة قاعدة البيانات المحسنة مع معالجة الأخطاء
import { supabase } from '@/integrations/supabase/client';
import { retryWithBackoff, parseError, logError, safeAsync } from '@/lib/errorHandler';
import { getItem, setItem } from '@/lib/storage';

type TableName = 
  | 'employees'
  | 'journal_entries'
  | 'accounting_transactions'
  | 'company_documents'
  | 'notifications'
  | 'capital_management'
  | 'company_partners'
  | 'projects'
  | 'clients'
  | 'chart_of_accounts';

interface QueryOptions {
  useCache?: boolean;
  cacheTTL?: number;
  retry?: boolean;
  maxRetries?: number;
}

const DEFAULT_OPTIONS: QueryOptions = {
  useCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 دقائق
  retry: true,
  maxRetries: 3,
};

// جلب البيانات مع التخزين المؤقت
export async function fetchWithCache<T>(
  table: TableName,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  cacheKey?: string,
  options: QueryOptions = {}
): Promise<{ data: T | null; error: any }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const key = cacheKey || `db_${table}`;
  
  // محاولة جلب من الكاش
  if (opts.useCache) {
    const cached = getItem<T>(key);
    if (cached !== null) {
      console.log(`[Cache Hit] ${key}`);
      return { data: cached, error: null };
    }
  }
  
  // جلب من قاعدة البيانات
  const fetchFn = async () => {
    const result = await queryFn();
    if (result.error) throw result.error;
    return result.data;
  };
  
  try {
    const data = opts.retry
      ? await retryWithBackoff(fetchFn, opts.maxRetries)
      : await fetchFn();
    
    // تخزين في الكاش
    if (opts.useCache && data !== null) {
      setItem(key, data, { ttl: opts.cacheTTL });
    }
    
    return { data, error: null };
  } catch (error) {
    const appError = parseError(error);
    logError(appError, `fetchWithCache: ${table}`);
    return { data: null, error: appError };
  }
}

// خدمات جلب البيانات الشائعة
export const DatabaseService = {
  // الموظفين
  async getEmployees(options?: QueryOptions) {
    return fetchWithCache(
      'employees',
      async () => {
        const result = await supabase.from('employees').select('*').order('created_at', { ascending: false });
        return result;
      },
      'employees_list',
      options
    );
  },
  
  async getEmployeeById(id: string) {
    const { data, error } = await safeAsync(async () => {
      const result = await supabase.from('employees').select('*').eq('id', id).single();
      if (result.error) throw result.error;
      return result.data;
    });
    return { data, error };
  },
  
  // القيود اليومية
  async getJournalEntries(options?: QueryOptions) {
    return fetchWithCache(
      'journal_entries',
      async () => {
        const result = await supabase.from('journal_entries').select('*').order('entry_date', { ascending: false });
        return result;
      },
      'journal_entries_list',
      options
    );
  },
  
  // المستندات
  async getCompanyDocuments(options?: QueryOptions) {
    return fetchWithCache(
      'company_documents',
      async () => {
        const result = await supabase.from('company_documents').select('*').order('expiry_date', { ascending: true });
        return result;
      },
      'company_documents_list',
      options
    );
  },
  
  // المستندات المنتهية
  async getExpiringDocuments(daysAhead: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return fetchWithCache(
      'company_documents',
      async () => {
        const result = await supabase
          .from('company_documents')
          .select('id, title, expiry_date, type, status')
          .lte('expiry_date', futureDate.toISOString().split('T')[0])
          .gte('expiry_date', today.toISOString().split('T')[0])
          .order('expiry_date', { ascending: true });
        return result;
      },
      `expiring_documents_${daysAhead}`,
      { cacheTTL: 10 * 60 * 1000 }
    );
  },
  
  // الإشعارات
  async getNotifications(limit: number = 10, options?: QueryOptions) {
    return fetchWithCache(
      'notifications',
      async () => {
        const result = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        return result;
      },
      `notifications_${limit}`,
      options
    );
  },
  
  // إدارة رأس المال
  async getCapitalManagement(options?: QueryOptions) {
    return fetchWithCache(
      'capital_management',
      async () => {
        const result = await supabase
          .from('capital_management')
          .select('*')
          .order('fiscal_year', { ascending: false })
          .limit(1);
        return result;
      },
      'capital_management_current',
      options
    );
  },
  
  // الشركاء
  async getPartners(options?: QueryOptions) {
    return fetchWithCache(
      'company_partners',
      async () => {
        const result = await supabase.from('company_partners').select('*').order('name');
        return result;
      },
      'partners_list',
      options
    );
  },
  
  // المشاريع
  async getProjects(options?: QueryOptions) {
    return fetchWithCache(
      'projects',
      async () => {
        const result = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        return result;
      },
      'projects_list',
      options
    );
  },
  
  // العملاء
  async getClients(options?: QueryOptions) {
    return fetchWithCache(
      'clients',
      async () => {
        const result = await supabase.from('clients').select('*').order('name');
        return result;
      },
      'clients_list',
      options
    );
  },
  
  // دليل الحسابات
  async getChartOfAccounts(options?: QueryOptions) {
    return fetchWithCache(
      'chart_of_accounts',
      async () => {
        const result = await supabase.from('chart_of_accounts').select('*').order('account_number');
        return result;
      },
      'chart_of_accounts_list',
      options
    );
  },
  
  // مسح الكاش
  clearCache(table?: TableName) {
    if (table) {
      const keys = [
        `${table}_list`,
        `db_${table}`,
      ];
      keys.forEach(key => {
        localStorage.removeItem(`erp_${key}`);
      });
    } else {
      // مسح جميع الكاش
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('erp_db_') || key?.startsWith('erp_') && key.includes('_list')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  },
};

export default DatabaseService;
