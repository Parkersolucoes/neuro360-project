
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, Settings } from "lucide-react";
import { CompanyForm } from "@/components/empresas/CompanyForm";
import { CompanyTable } from "@/components/empresas/CompanyTable";
import { CompanyStats } from "@/components/empresas/CompanyStats";
import { CompanyConfigurations } from "@/components/empresas/CompanyConfigurations";
import { useCompanies } from "@/hooks/useCompanies";
import { usePlans } from "@/hooks/usePlans";
import type { Company as ComponentCompany } from "@/components/empresas/types";

export default function Empresas() {
  const { companies, createCompany, updateCompany, deleteCompany, loading, setCurrentCompany } = useCompanies();
  const { plans, loading: plansLoading } = usePlans();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ComponentCompany | null>(null);
  const [selectedCompanyForConfig, setSelectedCompanyForConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("empresas");

  // Convert hook companies to component companies
  const componentCompanies: ComponentCompany[] = companies.map(company => {
    const plan = plans.find(p => p.id === company.plan_id);
    return {
      id: company.id,
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      plan: plan?.name.toLowerCase().includes('básico') ? 'basic' as const :
            plan?.name.toLowerCase().includes('pro') ? 'pro' as const : 'enterprise' as const,
      status: company.status === 'active' ? 'active' as const : 
              company.status === 'suspended' ? 'suspended' as const : 'inactive' as const,
      createdAt: company.created_at,
      usersCount: 1,
      lastActivity: 'Online'
    };
  });

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    plan_id: ''
  });

  const handleSaveCompany = async () => {
    try {
      const formattedData = {
        name: formData.name,
        document: formData.document,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        plan_id: formData.plan_id || null,
        status: 'active' as const
      };

      if (editingCompany) {
        await updateCompany(editingCompany.id, formattedData);
      } else {
        await createCompany(formattedData);
      }
      
      setIsDialogOpen(false);
      setEditingCompany(null);
      setFormData({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        plan_id: ''
      });
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEditCompany = (company: ComponentCompany) => {
    const fullCompany = companies.find(c => c.id === company.id);
    setEditingCompany(company);
    setFormData({
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone,
      address: company.address,
      plan_id: fullCompany?.plan_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await deleteCompany(id);
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleConfigureCompany = (company: ComponentCompany) => {
    const fullCompany = companies.find(c => c.id === company.id);
    setSelectedCompanyForConfig(fullCompany);
    setCurrentCompany(fullCompany);
    setActiveTab("configuracoes");
  };

  if (loading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-2">Gerencie as empresas e suas configurações</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Editar Empresa" : "Nova Empresa"}
              </DialogTitle>
            </DialogHeader>
            <CompanyForm
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveCompany}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingCompany(null);
                setFormData({
                  name: '',
                  document: '',
                  email: '',
                  phone: '',
                  address: '',
                  plan_id: ''
                });
              }}
              isEditing={!!editingCompany}
              plans={plans}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CompanyStats companies={componentCompanies} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="empresas" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Lista de Empresas</span>
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <span>Lista de Empresas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyTable
                companies={componentCompanies}
                onEdit={handleEditCompany}
                onDelete={handleDeleteCompany}
                onConfigure={handleConfigureCompany}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-500" />
                <span>Configurações da Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCompanyForConfig ? (
                <CompanyConfigurations company={selectedCompanyForConfig} />
              ) : (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Selecione uma empresa na lista para configurar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
