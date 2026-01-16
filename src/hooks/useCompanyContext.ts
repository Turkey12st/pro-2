import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook to get the current user's company ID for data isolation
 */
export function useCompanyContext() {
  const { user } = useAuth();

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('users_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company context:', error);
        return null;
      }

      return data?.company_id || null;
    } catch (error) {
      console.error('Error in getCompanyId:', error);
      return null;
    }
  }, [user?.id]);

  const ensureCompanyExists = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Check if user already has a company
      const existingCompanyId = await getCompanyId();
      if (existingCompanyId) return existingCompanyId;

      // Create a new company for the user
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'شركتي الجديدة',
          is_active: true,
        })
        .select('id')
        .single();

      if (companyError || !newCompany) {
        console.error('Error creating company:', companyError);
        return null;
      }

      // Link the user to the company
      const { error: linkError } = await supabase
        .from('users_companies')
        .insert({
          user_id: user.id,
          company_id: newCompany.id,
          is_default: true,
        });

      if (linkError) {
        console.error('Error linking user to company:', linkError);
        return null;
      }

      // Assign admin role to the user for this company
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          company_id: newCompany.id,
          role: 'admin',
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
        // Continue anyway, role can be assigned later
      }

      return newCompany.id;
    } catch (error) {
      console.error('Error in ensureCompanyExists:', error);
      return null;
    }
  }, [user?.id, getCompanyId]);

  return {
    getCompanyId,
    ensureCompanyExists,
    userId: user?.id || null,
  };
}
