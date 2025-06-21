
import { createContext, useContext } from 'react';
import { CompaniesContextType } from '@/types/company';

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

export { CompaniesContext };

export function useCompaniesContext() {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error('useCompaniesContext must be used within a CompaniesProvider');
  }
  return context;
}
