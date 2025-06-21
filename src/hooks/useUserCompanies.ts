
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserCompanies() {
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      // Primeiro, remover todas as associações existentes do usuário
      await supabase
        .from('user_companies')
        .delete()
        .eq('user_id', userId);

      // Criar novas associações
      const associations = companyIds.map(companyId => ({
        user_id: userId,
        company_id: companyId,
        role: 'user',
        is_primary: companyId === primaryCompanyId
      }));

      const { data, error } = await supabase
        .from('user_companies')
        .insert(associations)
        .select();

      if (error) throw error;

      setUserCompanies(prev => [
        ...prev.filter(uc => uc.user_id !== userId),
        ...(data || [])
      ]);

      toast({
        title: "Sucesso",
        description: "Associações de empresas atualizadas com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Error creating user companies:', error);
      toast({
        title: "Erro",
        description: "Erro ao associar usuário às empresas",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getUserCompanies = (userId: string) => {
    return userCompanies.filter(uc => uc.user_id === userId);
  };

  useEffect(() => {
    fetchUserCompanies();
  }, []);

  return {
    userCompanies,
    loading,
    createUserCompanies,
    getUserCompanies,
    refetch: fetchUserCompanies
  };
}
