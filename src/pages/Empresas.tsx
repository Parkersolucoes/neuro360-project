
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CompanyStats } from "@/components/empresas/CompanyStats";
import { CompanyForm } from "@/components/empresas/CompanyForm";
import { CompanyTable } from "@/components/empresas/CompanyTable";
import { Company, CompanyFormData } from "@/components/empresas/types";

export default function Empresas() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      name: "Tech Solutions Ltda",
      document: "12.345.678/0001-90",
      email: "contato@techsolutions.com",
      phone: "(11) 3333-4444",
      address: "Rua das Flores, 123 - São Paulo, SP",
      plan: "pro",
      status: "active",
      createdAt: "2024-01-15",
      usersCount: 5,
      lastActivity: "2024-01-20"
    },
    {
      id: "2",
      name: "Comércio Digital S.A.",
      document: "98.765.432/0001-10",
      email: "admin@comerciodigital.com",
      phone: "(11) 5555-6666",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      plan: "enterprise",
      status: "active",
      createdAt: "2024-01-10",
      usersCount: 12,
      lastActivity: "2024-01-21"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    plan: "basic"
  });

  const saveCompany = () => {
    if (editingCompany) {
      setCompanies(companies.map(company => 
        company.id === editingCompany.id 
          ? { ...editingCompany, ...formData }
          : company
      ));
      toast({
        title: "Empresa atualizada",
        description: "As informações da empresa foram atualizadas com sucesso!",
      });
    } else {
      const company: Company = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0],
        usersCount: 0,
        lastActivity: new Date().toISOString().split('T')[0]
      };
      setCompanies([...companies, company]);
      toast({
        title: "Empresa criada",
        description: "A nova empresa foi criada com sucesso!",
      });
    }
    
    resetForm();
  };

  const editCompany = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      document: company.document,
      email: company.email,
      phone: company.phone,
      address: company.address,
      plan: company.plan
    });
    setIsDialogOpen(true);
  };

  const deleteCompany = (companyId: string) => {
    setCompanies(companies.filter(company => company.id !== companyId));
    toast({
      title: "Empresa removida",
      description: "A empresa foi removida com sucesso!",
    });
  };

  const resetForm = () => {
    setFormData({ name: "", document: "", email: "", phone: "", address: "", plan: "basic" });
    setEditingCompany(null);
    setIsDialogOpen(false);
  };

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
            onDelete={deleteCompany}
          />
        </CardContent>
      </Card>
    </div>
  );
}
