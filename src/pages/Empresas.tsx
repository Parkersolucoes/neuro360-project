
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompanyStats } from "@/components/empresas/CompanyStats";
import { CompanyForm } from "@/components/empresas/CompanyForm";
import { CompanyTable } from "@/components/empresas/CompanyTable";
import { useCompanies } from "@/hooks/useCompanies";
import { usePlans } from "@/hooks/usePlans";

export interface CompanyFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  plan_id: string;
}

export default function Empresas() {
  const { toast } = useToast();
  const { userCompanies, createCompany, updateCompany, deleteCompany, loading } = useCompanies();
  const { plans } = usePlans();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    plan_id: ""
  });

  const companies = userCompanies.map(uc => uc.companies).filter(Boolean);

  const saveCompany = async () => {
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, formData);
        toast({
          title: "Empresa atualizada",
          description: "As informações da empresa foram atualizadas com sucesso!",
        });
      } else {
        await createCompany({ 
          ...formData, 
          status: "active" as const
        });
        toast({
          title: "Empresa criada",
          description: "A nova empresa foi criada com sucesso!",
        });
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const editCompany = (company: any) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone || "",
      address: company.address || "",
      plan_id: company.plan_id || ""
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Tem certeza que deseja remover esta empresa?')) {
      await deleteCompany(companyId);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      document: "", 
      email: "", 
      phone: "", 
      address: "", 
      plan_id: "" 
    });
    setEditingCompany(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando empresas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-2">Gerencie as empresas clientes do sistema</p>
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
              onSave={saveCompany}
              onCancel={resetForm}
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
            onEdit={editCompany}
            onDelete={handleDeleteCompany}
          />
        </CardContent>
      </Card>
    </div>
  );
}
