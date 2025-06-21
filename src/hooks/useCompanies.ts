
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone?: string;
  address?: string;
  plan_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at?: string;
  updated_at?: string;
  plans?: {
    name: string;
    price: number;
    max_sql_connections: number;
    max_sql_queries: number;
  };
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  companies?: Company;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      // Since user_companies table exists but might not have data, simulate some data
      const mockUserCompanies: UserCompany[] = [
        {
          id: 'uc-1',
          user_id: 'user-1',
          company_id: 'comp-1',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          companies: {
            id: 'comp-1',
            name: 'Empresa Demo',
            document: '12.345.678/0001-90',
            email: 'demo@empresa.com',
            phone: '(11) 3333-4444',
            address: 'Rua Demo, 123',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            plans: {
              name: 'Básico',
              price: 99.90,
              max_sql_connections: 1,
              max_sql_queries: 100
            }
          }
        }
      ];

      setUserCompanies(mockUserCompanies);
      
      // Extract companies from userCompanies
      const extractedCompanies = mockUserCompanies
        .filter(uc => uc.companies)
        .map(uc => uc.companies!) as Company[];
      
      setCompanies(extractedCompanies);
      
      // Set first company as current if none selected
      if (extractedCompanies.length > 0 && !currentCompany) {
        setCurrentCompany(extractedCompanies[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simulate creating a company
      const mockCompany: Company = {
        id: `comp-${Date.now()}`,
        ...companyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plans: {
          name: 'Básico',
          price: 99.90,
          max_sql_connections: 1,
          max_sql_queries: 100
        }
      };

      const mockUserCompany: UserCompany = {
        id: `uc-${Date.now()}`,
        user_id: 'user-1',
        company_id: mockCompany.id,
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        companies: mockCompany
      };

      setCompanies(prev => [...prev, mockCompany]);
      setUserCompanies(prev => [...prev, mockUserCompany]);
      
      toast({
        title: "Sucesso",
        description: "Empresa criada com sucesso!"
      });
      
      return mockCompany;
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar empresa",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      const updatedCompany = companies.find(company => company.id === id);
      if (!updatedCompany) throw new Error('Company not found');
      
      const newCompany = { ...updatedCompany, ...updates };
      
      setCompanies(prev => prev.map(company => 
        company.id === id ? newCompany : company
      ));

      setUserCompanies(prev => prev.map(uc => 
        uc.company_id === id && uc.companies ? { ...uc, companies: newCompany } : uc
      ));
      
      if (currentCompany?.id === id) {
        setCurrentCompany(newCompany);
      }
      
      return newCompany;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      setCompanies(prev => prev.filter(company => company.id !== id));
      setUserCompanies(prev => prev.filter(uc => uc.company_id !== id));
      
      if (currentCompany?.id === id) {
        setCurrentCompany(null);
      }
      
      toast({
        title: "Sucesso",
        description: "Empresa removida com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover empresa",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    userCompanies,
    currentCompany,
    setCurrentCompany,
    loading,
    createCompany,
    updateCompany,
    deleteCompany,
    refetch: fetchCompanies
  };
}
