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

  // Função para filtrar empresa Neuro360 para usuários não-master
  const filterCompaniesForUser = (companiesList: Company[]) => {
    if (!companiesList) return [];
    
    // Se não é usuário master, filtrar a empresa Neuro360
    if (!userLogin?.is_master) {
      return companiesList.filter(company => company.id !== '0a988013-fa43-4d9d-9bfa-22c245c0c1ea');
    }
    
    return companiesList;
  };

  // Carregar empresa selecionada do localStorage
  const loadSelectedCompanyFromStorage = (availableCompanies: Company[]) => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    if (savedCompanyId && availableCompanies.length > 0) {
      const savedCompany = availableCompanies.find(c => c.id === savedCompanyId);
      if (savedCompany) {
        console.log('CompaniesProvider: Loading company from localStorage:', savedCompany);
        setCurrentCompanyInternal(savedCompany);
        return true;
      }
    }
    return false;
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('CompaniesProvider: Fetching companies...');
      console.log('CompaniesProvider: User login:', userLogin);
      
      // SEMPRE buscar todas as empresas para usuários master
      if (userLogin?.is_master) {
        console.log('CompaniesProvider: Fetching all companies for master user...');
        const data = await CompanyService.fetchAllCompanies();
        console.log('CompaniesProvider: All companies fetched:', data);
        
        if (data && Array.isArray(data)) {
          const typedCompanies = data.map(company => ({
            ...company,
            status: company.status as "active" | "inactive" | "suspended"
          })) as Company[];
          
          // Para usuários master, mostrar todas as empresas (incluindo Neuro360)
          setCompanies(typedCompanies);
          
          // Tentar carregar empresa do localStorage primeiro
          if (!loadSelectedCompanyFromStorage(typedCompanies)) {
            // Se não há empresa salva, selecionar a empresa Neuro360 ou a primeira
            if (!currentCompany && typedCompanies.length > 0) {
              const defaultCompany = typedCompanies.find(c => c.id === '0a988013-fa43-4d9d-9bfa-22c245c0c1ea') || typedCompanies[0];
              console.log('CompaniesProvider: Setting default company for master:', defaultCompany);
              setCurrentCompanyInternal(defaultCompany);
              localStorage.setItem('selectedCompanyId', defaultCompany.id);
            }
          }
        }
      } else if (userLogin?.id) {
        // Para usuários normais, buscar apenas empresas associadas
        console.log('CompaniesProvider: Fetching user companies for normal user...');
        const userCompanies = await CompanyService.fetchUserCompanies(userLogin.id);
        
        if (userCompanies && Array.isArray(userCompanies)) {
          const typedUserCompanies = userCompanies.map(company => ({
            ...company,
            status: company.status as "active" | "inactive" | "suspended"
          })) as Company[];
          
          // Para usuários normais, filtrar empresa Neuro360 apenas se ela não estiver associada ao usuário
          const userCompanyIds = typedUserCompanies.map(c => c.id);
          const isNeuro360Associated = userCompanyIds.includes('0a988013-fa43-4d9d-9bfa-22c245c0c1ea');
          
          // Se Neuro360 não está associada ao usuário, filtrar ela
          const finalCompanies = isNeuro360Associated ? typedUserCompanies : filterCompaniesForUser(typedUserCompanies);
          
          console.log('CompaniesProvider: Final companies for user:', finalCompanies);
          setCompanies(finalCompanies);
          
          if (!loadSelectedCompanyFromStorage(finalCompanies)) {
            if (!currentCompany && finalCompanies.length === 1) {
              console.log('CompaniesProvider: Setting single company for user:', finalCompanies[0]);
              setCurrentCompanyInternal(finalCompanies[0]);
              localStorage.setItem('selectedCompanyId', finalCompanies[0].id);
            } else if (!currentCompany && finalCompanies.length > 1) {
              // Se há múltiplas empresas, verificar se há uma primária
              const primaryCompany = finalCompanies[0]; // A primeira será a padrão
              console.log('CompaniesProvider: Setting first company as default for user:', primaryCompany);
              setCurrentCompanyInternal(primaryCompany);
              localStorage.setItem('selectedCompanyId', primaryCompany.id);
            }
          }
        }
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
    
    // Salvar no localStorage para persistência
    if (company) {
      localStorage.setItem('selectedCompanyId', company.id);
    } else {
      localStorage.removeItem('selectedCompanyId');
    }
    
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

      // Recarregar empresas para garantir dados atualizados
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
