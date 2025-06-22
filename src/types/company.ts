
export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive" | "suspended";
  plan_id?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface CompaniesContextType {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  setCurrentCompany: (company: Company | null) => void;
  createCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<Company>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}
