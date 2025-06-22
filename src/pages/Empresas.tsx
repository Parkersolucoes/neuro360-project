import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Settings } from "lucide-react";
import { useCompanies, Company } from "@/hooks/useCompanies";
import { useDemoSQLConnections } from "@/hooks/useDemoSQLConnections";
import { CompanyForm } from "@/components/empresas/CompanyForm";
import { CompanyTable } from "@/components/empresas/CompanyTable";
import { CompanyStats } from "@/components/empresas/CompanyStats";
import { CompanyConfigTabs } from "@/components/empresas/CompanyConfigTabs";

export default function Empresas() {
  const { companies, loading, createCompany, updateCompany, deleteCompany } = useCompanies();
  const { createDemoConnectionsForNewCompanies } = useDemoSQLConnections();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompanyForConfig, setSelectedCompanyForConfig] = useState<Company | null>(null);

  const saveCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await createCompany(companyData);
        // Após criar a empresa, tentar criar conexão de demonstração
        setTimeout(() => {
          createDemoConnectionsForNewCompanies();
        }, 1000);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const resetForm = () => {
    setEditingCompany(null);
    setIsDialogOpen(false);
  };

  const editCompany = (company: Company) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const openNewCompanyDialog = () => {
    setEditingCompany(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  if (selectedCompanyForConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCompanyForConfig(null)}
              className="mb-4"
            >
              ← Voltar para Empresas
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Settings className="w-8 h-8 text-blue-600" />
              <span>Configurações - {selectedCompanyForConfig.name}</span>
            </h1>
            <p className="text-gray-600 mt-2">Configure as integrações da empresa</p>
          </div>
        </div>

        <CompanyConfigTabs company={selectedCompanyForConfig} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-2">Gerencie as empresas do sistema</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={openNewCompanyDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <CompanyStats companies={companies} />

      <CompanyForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCompany={editingCompany}
        onSave={saveCompany}
        onCancel={resetForm}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span>Lista de Empresas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CompanyTable
            companies={companies}
            onEditCompany={editCompany}
            onDeleteCompany={deleteCompany}
            onConfigureCompany={setSelectedCompanyForConfig}
          />
        </CardContent>
      </Card>
    </div>
  );
}
