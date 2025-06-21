
import { useState, useEffect } from 'react';
import { CompaniesContext } from '@/contexts/CompaniesContext';
import { Company } from '@/types/company';
import { CompanyService } from '@/services/companyService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function CompaniesProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userLogin } = useAuth();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('Fetching companies...');
      
      // Se for usuário master, buscar todas as empresas
      if (userLogin?.is_master) {
        const data = await CompanyService.fetchAllCompanies();
        console.log('All companies fetched for master user:', data);
        setCompanies(data);
        
        // Se ainda não há empresa selecionada, selecionar a primeira ou a empresa padrão
        if (!currentCompany && data && data.length > 0) {
          const defaultCompany = data.find(c => c.id === '0a988013-fa43-4d9d-9bfa-22c245c0c1ea') || data[0];
          setCurrentCompany(defaultCompany);
        }
        return;
      }

      // Para usuários normais, buscar apenas empresas associadas
      if (!userLogin) {
        setCompanies([]);
        return;
      }

      const userCompanies = await CompanyService.fetchUserCompanies(userLogin.id);
      console.log('User companies fetched:', userCompanies);
      setCompanies(userCompanies);

      // Se ainda não há empresa selecionada, selecionar a primeira
      if (!currentCompany && userCompanies.length > 0) {
        setCurrentCompany(userCompanies[0]);
      }

    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating company with data:', companyData);
      const data = await CompanyService.createCompany(companyData);
      console.log('Company created successfully:', data);

      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
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
      console.log('Updating company:', id, 'with data:', updates);
      const data = await CompanyService.updateCompany(id, updates);

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!"
      });

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
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
      console.log('Deleting company:', id);
      await CompanyService.deleteCompany(id);

      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso!"
      });

      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover empresa";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userLogin]);

  return (
    <CompaniesContext.Provider value={{
      companies,
      currentCompany,
      loading,
      setCurrentCompany,
      createCompany,
      updateCompany,
      deleteCompany,
      refetch: fetchCompanies
    }}>
      {children}
    </CompaniesContext.Provider>
  );
}
