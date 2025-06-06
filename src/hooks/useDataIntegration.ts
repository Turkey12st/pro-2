
import { useState, useEffect } from 'react';
import { DataIntegrationService } from '@/services/dataIntegrationService';
import { useToast } from '@/hooks/use-toast';

export function useDataIntegration() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  const initializeDataIntegrity = async () => {
    try {
      setIsInitializing(true);
      
      // ضمان سلامة البيانات
      await DataIntegrationService.ensureDataIntegrity();
      
      // إنشاء بيانات عينة إذا لم تكن موجودة
      await DataIntegrationService.createSampleData();
      
      setHasInitialized(true);
      
      toast({
        title: 'تم تهيئة النظام بنجاح',
        description: 'تم ضمان ترابط البيانات عبر جميع أجزاء النظام'
      });
      
    } catch (error) {
      console.error('Error initializing data integrity:', error);
      toast({
        title: 'خطأ في تهيئة النظام',
        description: 'حدث خطأ أثناء ضمان ترابط البيانات',
        variant: 'destructive'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const refreshDataIntegrity = async () => {
    try {
      await DataIntegrationService.ensureDataIntegrity();
      toast({
        title: 'تم تحديث ترابط البيانات',
        description: 'تم التأكد من سلامة الروابط بين البيانات'
      });
    } catch (error) {
      console.error('Error refreshing data integrity:', error);
      toast({
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء تحديث ترابط البيانات',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    // تهيئة تلقائية عند تحميل التطبيق
    if (!hasInitialized) {
      initializeDataIntegrity();
    }
  }, []);

  return {
    isInitializing,
    hasInitialized,
    initializeDataIntegrity,
    refreshDataIntegrity
  };
}
