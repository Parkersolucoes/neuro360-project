
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell } from "lucide-react";

interface UserRoleAndStatusFormProps {
  formData: {
    role: string;
    department: string;
    status: 'active' | 'inactive';
    is_admin: string; // '0' = master, '1' = usuário comum
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
  // is_admin = '0' significa recebe alertas, is_admin = '1' significa não recebe
  const receiveAlerts = formData.is_admin === '0';

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
            id="receive_alerts"
            checked={receiveAlerts}
            onCheckedChange={(checked) => onChange('is_admin', checked === true)}
            className="border-blue-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <Label htmlFor="receive_alerts" className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-500" />
            <span>Alertas (recebe notificações de erro do sistema)</span>
          </Label>
        </div>
      </div>
    </div>
  );
}
