
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Building2 } from "lucide-react";
import { User } from "@/hooks/useUsers";
import { Company } from "@/hooks/useCompanies";

interface UserFormProps {
  editingUser: User | null;
  companies: Company[];
  selectedCompanies: string[];
  primaryCompany: string;
  onSelectedCompaniesChange: (companies: string[]) => void;
  onPrimaryCompanyChange: (company: string) => void;
  onSave: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ 
  editingUser, 
  companies, 
  selectedCompanies, 
  primaryCompany,
  onSelectedCompaniesChange,
  onPrimaryCompanyChange,
  onSave, 
  onCancel 
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    role: "user",
    department: "",
    is_admin: false,
    status: "active" as 'active' | 'inactive'
  });

  const roles = [
    { value: "admin", label: "Administrador" },
    { value: "manager", label: "Gerente" },
    { value: "user", label: "Usuário" }
  ];

  const departments = [
    { value: "vendas", label: "Vendas" },
    { value: "marketing", label: "Marketing" },
    { value: "financeiro", label: "Financeiro" },
    { value: "ti", label: "TI" },
    { value: "rh", label: "Recursos Humanos" }
  ];

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        whatsapp: editingUser.whatsapp,
        role: editingUser.role,
        department: editingUser.department,
        is_admin: editingUser.is_admin,
        status: editingUser.status
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        role: "user",
        department: "",
        is_admin: false,
        status: "active"
      });
    }
  }, [editingUser]);

  const handleCompanyToggle = (companyId: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedCompanies, companyId];
      // Se é a primeira empresa selecionada, torna ela principal
      if (selectedCompanies.length === 0) {
        onPrimaryCompanyChange(companyId);
      }
    } else {
      newSelected = selectedCompanies.filter(id => id !== companyId);
      // Se removeu a empresa principal, define a primeira restante como principal
      if (primaryCompany === companyId) {
        onPrimaryCompanyChange(newSelected.length > 0 ? newSelected[0] : '');
      }
    }
    onSelectedCompaniesChange(newSelected);
  };

  const handlePrimaryCompanyChange = (companyId: string, checked: boolean) => {
    if (checked && selectedCompanies.includes(companyId)) {
      onPrimaryCompanyChange(companyId);
    }
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.whatsapp && formData.department;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            placeholder="Nome do usuário"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@empresa.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            placeholder="(11) 99999-9999"
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Função</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Departamento</Label>
          <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Selecione o departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: 'active' | 'inactive') => setFormData({...formData, status: value})}
          >
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_admin"
            checked={formData.is_admin}
            onCheckedChange={(checked) => setFormData({...formData, is_admin: checked as boolean})}
          />
          <Label htmlFor="is_admin" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Usuário Administrador (recebe alertas de erro)</span>
          </Label>
        </div>
        
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Empresas</span>
          </Label>
          <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`company-${company.id}`}
                    checked={selectedCompanies.includes(company.id)}
                    onCheckedChange={(checked) => handleCompanyToggle(company.id, checked as boolean)}
                  />
                  <Label htmlFor={`company-${company.id}`} className="flex-1">
                    {company.name}
                  </Label>
                </div>
                {selectedCompanies.includes(company.id) && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`primary-${company.id}`}
                      checked={primaryCompany === company.id}
                      onCheckedChange={(checked) => handlePrimaryCompanyChange(company.id, checked as boolean)}
                    />
                    <Label htmlFor={`primary-${company.id}`} className="text-sm text-gray-600">
                      Principal
                    </Label>
                  </div>
                )}
              </div>
            ))}
            {companies.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma empresa cadastrada
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!isFormValid}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {editingUser ? "Atualizar" : "Criar"} Usuário
        </Button>
      </div>
    </div>
  );
}
