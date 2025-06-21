
import { useState, useEffect } from 'react';
import { CompaniesContext } from '@/contexts/CompaniesContext';
import { Company } from '@/types/company';
import { CompanyService } from '@/services/companyService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userLogin } = useAuth();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('CompaniesProvider: Fetching companies...');
      console.log('CompaniesProvider: User login:', userLogin);
      
      // Se for usuário master, buscar todas as empresas
      if (userLogin?.is_master) {
        console.log('CompaniesProvider: Fetching all companies for master user...');
        const data = await CompanyService.fetchAllCompanies();
        console.log('CompaniesProvider: All companies fetched for master user:', data);
        
        if (data && Array.isArray(data)) {
          const typedCompanies = data.map(company => ({
            ...company,
            status: company.status as "active" | "inactive" | "suspended"
          })) as Company[];
          
          setCompanies(typedCompanies);
          
          // Se ainda não há empresa selecionada, selecionar a empresa Visão 360 ou a primeira
          if (!currentCompany && typedCompanies.length > 0) {
            const defaultCompany = typedCompanies.find(c => c.id === '0a988013-fa43-4d9d-9bfa-22c245c0c1ea') || typedCompanies[0];
            console.log('CompaniesProvider: Setting default company for master:', defaultCompany);
            setCurrentCompanyInternal(defaultCompany);
          }
        } else {
          console.log('CompaniesProvider: No companies found or invalid data format');
          setCompanies([]);
        }
        return;
      }

      // Para usuários normais, buscar apenas empresas associadas
      if (!userLogin) {
        console.log('CompaniesProvider: No user login found, clearing companies');
        setCompanies([]);
        setCurrentCompanyInternal(null);
        return;
      }

      console.log('CompaniesProvider: Fetching companies for regular user:', userLogin.id);
      const userCompanies = await CompanyService.fetchUserCompanies(userLogin.id);
      console.log('CompaniesProvider: User companies fetched:', userCompanies);
      
      if (userCompanies && Array.isArray(userCompanies)) {
        const typedCompanies = userCompanies.map(company => ({
          ...company,
          status: company.status as "active" | "inactive" | "suspended"
        })) as Company[];
        
        setCompanies(typedCompanies);

        // Para usuários normais, se há apenas uma empresa, selecioná-la automaticamente
        // Se há múltiplas empresas, não selecionar automaticamente - deixar o usuário escolher
        if (!currentCompany && typedCompanies.length === 1) {
          console.log('CompaniesProvider: Setting single company for user:', typedCompanies[0]);
          setCurrentCompanyInternal(typedCompanies[0]);
        } else if (typedCompanies.length > 1) {
          console.log('CompaniesProvider: Multiple companies found for user - waiting for manual selection');
        }
      } else {
        console.log('CompaniesProvider: No user companies found or invalid data format');
        setCompanies([]);
      }

    } catch (error) {
      console.error('CompaniesProvider: Error fetching companies:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas",
        variant: "destructive"
      });
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Função interna para definir a empresa atual
  const setCurrentCompanyInternal = (company: Company | null) => {
    console.log('CompaniesProvider: Setting current company internally:', company);
    setCurrentCompany(company);
  };

  // Função pública para definir empresa atual e notificar outros componentes
  const setCurrentCompanyAndNotify = (company: Company | null) => {
    console.log('CompaniesProvider: Setting current company and notifying:', company);
    setCurrentCompanyInternal(company);
    
    // Disparar evento customizado para notificar outros componentes
    if (company) {
      const event = new CustomEvent('companyChanged', { 
        detail: { company } 
      });
      window.dispatchEvent(event);
      
      // Log adicional para debug
      console.log('CompaniesProvider: Company change event dispatched for:', company.name);
    }
  };

  // Função para buscar usuário master
  const getMasterUser = async (): Promise<{ id: string } | null> => {
    try {
      const { data: masterUser, error } = await supabase
        .from('users')
        .select('id')
        .eq('is_admin', '0')
        .single();

      if (error) {
        console.error('Error fetching master user:', error);
        return null;
      }

      return masterUser;
    } catch (error) {
      console.error('Error in getMasterUser:', error);
      return null;
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('CompaniesProvider: Creating company with data:', companyData);
      const data = await CompanyService.createCompany(companyData);
      console.log('CompaniesProvider: Company created successfully:', data);

      // Vincular automaticamente ao usuário master
      const masterUser = await getMasterUser();
      if (masterUser && data?.id) {
        console.log('CompaniesProvider: Linking company to master user:', masterUser.id);
        
        const { error: linkError } = await supabase
          .from('user_companies')
          .insert({
            user_id: masterUser.id,
            company_id: data.id,
            role: 'admin',
            is_primary: false
          });

        if (linkError) {
          console.error('Error linking company to master user:', linkError);
          toast({
            title: "Aviso",
            description: "Empresa criada, mas houve erro ao vincular ao usuário master",
            variant: "destructive"
          });
        } else {
          console.log('CompaniesProvider: Company successfully linked to master user');
        }
      }

      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });

      await fetchCompanies();
      return data as Company;
    } catch (error) {
      console.error('CompaniesProvider: Error creating company:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar empresa";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      console.log('CompaniesProvider: Updating company:', id, 'with data:', updates);
      const data = await CompanyService.updateCompany(id, updates);

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!"
      });

      await fetchCompanies();
      return data as Company;
    } catch (error) {
      console.error('CompaniesProvider: Error updating company:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar empresa";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      console.log('CompaniesProvider: Deleting company:', id);
      await CompanyService.deleteCompany(id);

      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso!"
      });

      await fetchCompanies();
    } catch (error) {
      console.error('CompaniesProvider: Error deleting company:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover empresa";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Effect para buscar empresas quando o usuário muda
  useEffect(() => {
    if (userLogin) {
      console.log('CompaniesProvider: User login changed, fetching companies...');
      fetchCompanies();
    }
  }, [userLogin?.id, userLogin?.is_master]);

  // Effect adicional para debug
  useEffect(() => {
    console.log('CompaniesProvider: Companies state updated:', companies);
    console.log('CompaniesProvider: Current company:', currentCompany);
  }, [companies, currentCompany]);

  return (
    <CompaniesContext.Provider value={{
      companies,
      currentCompany,
      loading,
      setCurrentCompany: setCurrentCompanyAndNotify,
      createCompany,
      updateCompany,
      deleteCompany,
      refetch: fetchCompanies
    }}>
      {children}
    </CompaniesContext.Provider>
  );
}
