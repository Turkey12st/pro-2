
import { supabase } from "@/integrations/supabase/client";

export interface GovernmentSystem {
  system: 'mol' | 'moci' | 'gosi' | 'qiwa' | 'zakat';
  action: 'sync' | 'validate' | 'submit';
  data?: any;
}

export class GovernmentIntegrationService {
  static async integrateWithSystem({ system, action, data }: GovernmentSystem) {
    try {
      const { data: result, error } = await supabase.functions.invoke('saudi-gov-integration', {
        body: { system, action, data }
      });

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      console.error(`Error integrating with ${system}:`, error);
      throw error;
    }
  }

  // وزارة العمل - Ministry of Labor
  static async syncWithMOL(employeeData: any[]) {
    return this.integrateWithSystem({
      system: 'mol',
      action: 'sync',
      data: { employees: employeeData }
    });
  }

  static async validateMOLCompliance(employeeData: any[]) {
    return this.integrateWithSystem({
      system: 'mol',
      action: 'validate',
      data: { employees: employeeData }
    });
  }

  // وزارة التجارة - Ministry of Commerce
  static async validateCommercialRegistration() {
    return this.integrateWithSystem({
      system: 'moci',
      action: 'validate'
    });
  }

  static async syncWithMOCI(companyData: any) {
    return this.integrateWithSystem({
      system: 'moci',
      action: 'sync',
      data: companyData
    });
  }

  // التأمينات الاجتماعية - GOSI
  static async submitGOSIContributions(contributionData: any) {
    return this.integrateWithSystem({
      system: 'gosi',
      action: 'submit',
      data: contributionData
    });
  }

  static async syncGOSISubscriptions(employeeData: any[]) {
    return this.integrateWithSystem({
      system: 'gosi',
      action: 'sync',
      data: { employees: employeeData }
    });
  }

  // منصة قوى - Qiwa Platform
  static async syncWithQiwa(visaData: any[]) {
    return this.integrateWithSystem({
      system: 'qiwa',
      action: 'sync',
      data: { visas: visaData }
    });
  }

  static async validateQiwaCompliance(visaData: any[]) {
    return this.integrateWithSystem({
      system: 'qiwa',
      action: 'validate',
      data: { visas: visaData }
    });
  }

  // الزكاة والضريبة - Zakat and Tax Authority
  static async submitZakatDeclaration(zakatData: any) {
    return this.integrateWithSystem({
      system: 'zakat',
      action: 'submit',
      data: zakatData
    });
  }

  static async validateZakatCalculations(zakatData: any) {
    return this.integrateWithSystem({
      system: 'zakat',
      action: 'validate',
      data: zakatData
    });
  }
}
