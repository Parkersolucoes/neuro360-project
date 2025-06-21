
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Crown } from "lucide-react";

interface UserRoleAndStatusFormProps {
  formData: {
    role: string;
    department: string;
    status: 'active' | 'inactive';
    is_admin: boolean;
    is_master: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
}

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

export function UserRoleAndStatusForm({ formData, onChange }: UserRoleAndStatusFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Função</Label>
          <Select value={formData.role} onValueChange={(value) => onChange('role', value)}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
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
          <Select value={formData.department} onValueChange={(value) => onChange('department', value)}>
            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
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
            onValueChange={(value: 'active' | 'inactive') => onChange('status', value)}
          >
            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_admin"
            checked={formData.is_admin}
            onCheckedChange={(checked) => onChange('is_admin', checked === true)}
            className="border-blue-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <Label htmlFor="is_admin" className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Usuário Administrador (recebe alertas de erro)</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_master"
            checked={formData.is_master}
            onCheckedChange={(checked) => onChange('is_master', checked === true)}
            className="border-amber-200 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
          />
          <Label htmlFor="is_master" className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Usuário Master (controle total do sistema)</span>
          </Label>
        </div>
      </div>
    </div>
  );
}
