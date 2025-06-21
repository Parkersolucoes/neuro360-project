
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";
import { CompanyForm } from "@/components/empresas/CompanyForm";
import { CompanyTable } from "@/components/empresas/CompanyTable";
import { CompanyStats } from "@/components/empresas/CompanyStats";
import { useCompanies } from "@/hooks/useCompanies";
import { usePlans } from "@/hooks/usePlans";
import type { Company as ComponentCompany } from "@/components/empresas/types";

export default function Empresas() {
  const { userCompanies, createCompany, updateCompany, deleteCompany, loading } = useCompanies();
  const { plans, loading: plansLoading } = usePlans();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ComponentCompany | null>(null);

  // Convert hook companies to component companies
  const companies: ComponentCompany[] = userCompanies.map(uc => {
    const planName = uc.companies?.plans?.name || 'basic';
    // Map plan names to the expected types
    const mappedPlan = planName === 'Básico' ? 'basic' : 
                      planName === 'Profissional' ? 'pro' : 
                      planName === 'Empresarial' ? 'enterprise' : 'basic';
    
    return {
      id: uc.companies?.id || '',
      name: uc.companies?.name || '',
      document: uc.companies?.document || '',
      email: uc.companies?.email || '',
      phone: uc.companies?.phone || '',
      address: uc.companies?.address || '',
      plan: mappedPlan as 'basic' | 'pro' | 'enterprise',
      status: uc.companies?.status === 'active' ? 'active' as const : 
              uc.companies?.status === 'suspended' ? 'suspended' as const : 'inactive' as const,
      createdAt: uc.companies?.created_at || '',
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
    setEditingCompany(company);
    setFormData({
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone,
      address: company.address,
      plan_id: ''
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
          <p className="text-gray-600 mt-2">Gerencie as empresas do sistema</p>
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

      <CompanyStats companies={companies} />

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
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
          />
        </CardContent>
      </Card>
    </div>
  );
}
