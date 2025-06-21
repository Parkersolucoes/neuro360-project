
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  companies?: {
    id: string;
    name: string;
  };
}

export function useUserCompanies() {
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();

  const fetchUserCompanies = async () => {
    try {
      console.log('Fetching user companies...');
      
      let query = supabase
        .from('user_companies')
        .select(`
          *,
          companies (
            id,
            name
          )
        `);

      // Se não for admin, filtrar apenas associações das empresas do usuário
      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userCompaniesData } = await supabase
            .from('user_companies')
            .select('company_id')
            .eq('user_id', user.id);
          
          if (userCompaniesData && userCompaniesData.length > 0) {
            const companyIds = userCompaniesData.map(uc => uc.company_id);
            query = query.in('company_id', companyIds);
          }
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('User companies fetched:', data);
      setUserCompanies(data || []);
    } catch (error) {
      console.error('Error fetching user companies:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar associações usuário-empresa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUserCompanies = async (userId: string, companyIds: string[], primaryCompanyId?: string) => {
    try {
      console.log('Creating user companies:', { userId, companyIds, primaryCompanyId });
      
      // Primeiro, remover todas as associações existentes do usuário
      const { error: deleteError } = await supabase
        .from('user_companies')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing associations:', deleteError);
        throw deleteError;
      }

      // Se não há empresas selecionadas, apenas remove as existentes
      if (companyIds.length === 0) {
        await fetchUserCompanies(); // Recarrega a lista
        toast({
          title: "Sucesso",
          description: "Associações de empresas removidas com sucesso!"
        });
        return [];
      }

      // Criar novas associações
      const associations = companyIds.map(companyId => ({
        user_id: userId,
        company_id: companyId,
        role: 'user',
        is_primary: companyId === primaryCompanyId || (companyIds.length === 1 && !primaryCompanyId)
      }));

      console.log('Inserting associations:', associations);

      const { data, error } = await supabase
        .from('user_companies')
        .insert(associations)
        .select(`
          *,
          companies (
            id,
            name
          )
        `);

      if (error) {
        console.error('Error inserting associations:', error);
        throw error;
      }

      console.log('Associations created:', data);

      // Recarregar todas as associações para manter consistência
      await fetchUserCompanies();

      toast({
        title: "Sucesso",
        description: "Associações de empresas atualizadas com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error creating user companies:', error);
      toast({
        title: "Erro",
        description: "Erro ao associar usuário às empresas. Verifique suas permissões.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getUserCompanies = (userId: string) => {
    return userCompanies.filter(uc => uc.user_id === userId);
  };

  const getUserCompanyNames = (userId: string) => {
    const userComps = getUserCompanies(userId);
    if (userComps.length === 0) return 'Nenhuma empresa';
    
    return userComps.map(uc => {
      if (uc.companies) {
        return uc.is_primary ? `${uc.companies.name} (Principal)` : uc.companies.name;
      }
      return 'Empresa não encontrada';
    }).join(', ');
  };

  useEffect(() => {
    fetchUserCompanies();
  }, [isAdmin]);

  return {
    userCompanies,
    loading,
    createUserCompanies,
    getUserCompanies,
    getUserCompanyNames,
    refetch: fetchUserCompanies
  };
}
