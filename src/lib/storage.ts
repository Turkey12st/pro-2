// نظام التخزين المحسن
const STORAGE_PREFIX = 'erp_';
const CACHE_VERSION = '1.0';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
  expiresAt?: number;
}

interface StorageOptions {
  ttl?: number; // وقت الانتهاء بالمللي ثانية
  compress?: boolean;
}

// التحقق من دعم localStorage
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// تخزين البيانات مع التشفير الاختياري
export function setItem<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): boolean {
  if (!isStorageAvailable()) {
    console.warn('localStorage غير متاح');
    return false;
  }
  
  try {
    const cacheItem: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      expiresAt: options.ttl ? Date.now() + options.ttl : undefined,
    };
    
    const serialized = JSON.stringify(cacheItem);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
    return true;
  } catch (error) {
    console.error('خطأ في تخزين البيانات:', error);
    
    // محاولة تنظيف التخزين إذا كان ممتلئاً
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      cleanupStorage();
      try {
        const cacheItem: CacheItem<T> = {
          data: value,
          timestamp: Date.now(),
          version: CACHE_VERSION,
        };
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(cacheItem));
        return true;
      } catch {
        return false;
      }
    }
    
    return false;
  }
}

// استرجاع البيانات
export function getItem<T>(key: string): T | null {
  if (!isStorageAvailable()) {
    return null;
  }
  
  try {
    const serialized = localStorage.getItem(STORAGE_PREFIX + key);
    
    if (!serialized) {
      return null;
    }
    
    const cacheItem: CacheItem<T> = JSON.parse(serialized);
    
    // التحقق من النسخة
    if (cacheItem.version !== CACHE_VERSION) {
      removeItem(key);
      return null;
    }
    
    // التحقق من الصلاحية
    if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
      removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('خطأ في استرجاع البيانات:', error);
    return null;
  }
}

// حذف عنصر
export function removeItem(key: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch {
    return false;
  }
}

// مسح جميع البيانات المخزنة بواسطة التطبيق
export function clearAll(): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

// تنظيف البيانات المنتهية الصلاحية
export function cleanupStorage(): number {
  if (!isStorageAvailable()) {
    return 0;
  }
  
  let removedCount = 0;
  const now = Date.now();
  
  try {
    const keysToCheck: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToCheck.push(key);
      }
    }
    
    for (const fullKey of keysToCheck) {
      try {
        const serialized = localStorage.getItem(fullKey);
        if (serialized) {
          const cacheItem = JSON.parse(serialized) as CacheItem<unknown>;
          
          // حذف البيانات المنتهية الصلاحية أو ذات النسخة القديمة
          if (
            (cacheItem.expiresAt && now > cacheItem.expiresAt) ||
            cacheItem.version !== CACHE_VERSION
          ) {
            localStorage.removeItem(fullKey);
            removedCount++;
          }
        }
      } catch {
        // حذف العناصر التالفة
        localStorage.removeItem(fullKey);
        removedCount++;
      }
    }
  } catch (error) {
    console.error('خطأ في تنظيف التخزين:', error);
  }
  
  return removedCount;
}

// الحصول على حجم التخزين المستخدم
export function getStorageSize(): { used: number; available: number; percentage: number } {
  if (!isStorageAvailable()) {
    return { used: 0, available: 0, percentage: 0 };
  }
  
  let used = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
  }
  
  // حجم localStorage عادة 5MB
  const available = 5 * 1024 * 1024;
  const percentage = (used / available) * 100;
  
  return { used, available, percentage };
}

// تخزين مع استرداد تلقائي من الكاش
export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: StorageOptions = { ttl: 5 * 60 * 1000 } // 5 دقائق افتراضياً
): Promise<T> {
  // محاولة الاسترداد من الكاش
  const cached = getItem<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // جلب البيانات الجديدة
  const data = await fetcher();
  
  // تخزين في الكاش
  setItem(key, data, options);
  
  return data;
}

// Session Storage للبيانات المؤقتة
export const sessionCache = {
  set<T>(key: string, value: T): boolean {
    try {
      sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  get<T>(key: string): T | null {
    try {
      const value = sessionStorage.getItem(STORAGE_PREFIX + key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  
  remove(key: string): boolean {
    try {
      sessionStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch {
      return false;
    }
  },
  
  clear(): boolean {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  },
};

// تشغيل التنظيف التلقائي عند تحميل الصفحة
if (typeof window !== 'undefined') {
  cleanupStorage();
}
