
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompanyFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  plan_id: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  max_sql_connections: number;
  max_sql_queries: number;
}

interface CompanyFormProps {
  formData: CompanyFormData;
  setFormData: (data: CompanyFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  plans: Plan[];
}

export function CompanyForm({ formData, setFormData, onSave, onCancel, isEditing, plans }: CompanyFormProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Razão Social</Label>
          <Input
            id="name"
            placeholder="Nome da empresa"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">CNPJ</Label>
          <Input
            id="document"
            placeholder="XX.XXX.XXX/XXXX-XX"
            value={formData.document}
            onChange={(e) => setFormData({...formData, document: e.target.value})}
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="(11) 3333-4444"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="plan">Plano</Label>
        <Select 
          value={formData.plan_id} 
          onValueChange={(value) => setFormData({...formData, plan_id: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um plano" />
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
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={!formData.name || !formData.document || !formData.email}>
          {isEditing ? "Atualizar" : "Criar"} Empresa
        </Button>
      </div>
    </div>
  );
}
