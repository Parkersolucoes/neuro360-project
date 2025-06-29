
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Company } from "@/hooks/useCompanies";
import { usePlans } from "@/hooks/usePlans";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface CompanyFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCompany: Company | null;
  onSave: (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export function CompanyForm({ isOpen, onOpenChange, editingCompany, onSave, onCancel }: CompanyFormProps) {
  const { plans, loading: plansLoading } = usePlans();
  const { isAdmin, isMasterUser, userLogin } = useAdminAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    plan_id: "",
    qr_code: "",
    status: "active" as "active" | "inactive" | "suspended"
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        name: editingCompany.name || "",
        document: editingCompany.document || "",
        email: editingCompany.email || "",
        phone: editingCompany.phone || "",
        address: editingCompany.address || "",
        plan_id: editingCompany.plan_id || "",
        qr_code: editingCompany.qr_code || "",
        status: editingCompany.status || "active"
      });
    } else {
      setFormData({
        name: "",
        document: "",
        email: "",
        phone: "",
        address: "",
        plan_id: "",
        qr_code: "",
        status: "active"
      });
    }
  }, [editingCompany, isOpen]);

  const handleSave = async () => {
    if (isSaving) return;

    // Verificar se o usuário tem permissão para criar/editar empresas
    if (!isAdmin && !isMasterUser) {
      toast({
        title: "Erro de Permissão",
        description: "Apenas usuários master podem criar ou editar empresas",
        variant: "destructive"
      });
      return;
    }

    console.log('CompanyForm: User permissions check:', {
      isAdmin,
      isMasterUser,
      userLogin: {
        is_admin: userLogin?.is_admin,
        is_master: userLogin?.is_master
      }
    });

    try {
      setIsSaving(true);
      console.log('CompanyForm: Submitting form data:', formData);
      
      await onSave(formData);
      onCancel();
    } catch (error) {
      console.error('CompanyForm: Error saving company:', error);
      
      // Mostrar toast de erro mais específico
      if (error instanceof Error) {
        toast({
          title: "Erro ao salvar empresa",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Verificar se o usuário tem permissão para usar este formulário
  if (!isAdmin && !isMasterUser) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso Negado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600">Apenas usuários master podem criar ou editar empresas.</p>
            <Button onClick={onCancel} className="mt-4">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingCompany ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Razão Social</Label>
              <Input
                id="name"
                placeholder="Nome da empresa"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">CNPJ</Label>
              <Input
                id="document"
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 3333-4444"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              placeholder="Endereço completo da empresa"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={isSaving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan">Plano</Label>
            <Select 
              value={formData.plan_id} 
              onValueChange={(value) => setFormData({...formData, plan_id: value})}
              disabled={plansLoading || isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder={plansLoading ? "Carregando planos..." : "Selecione um plano"} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{plan.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatCurrency(plan.price)} - {plan.max_sql_queries} consultas - {plan.max_sql_connections} conexões
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr_code">QR Code</Label>
            <Input
              id="qr_code"
              placeholder="Código QR da empresa"
              value={formData.qr_code}
              onChange={(e) => setFormData({...formData, qr_code: e.target.value})}
              disabled={isSaving}
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name || !formData.document || !formData.email || isSaving}
            >
              {isSaving 
                ? "Salvando..." 
                : (editingCompany ? "Atualizar" : "Criar") + " Empresa"
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
