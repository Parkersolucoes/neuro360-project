
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompanyFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  plan: "basic" | "pro" | "enterprise";
}

interface CompanyFormProps {
  formData: CompanyFormData;
  setFormData: (data: CompanyFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const plans = [
  { value: "basic", label: "Básico" },
  { value: "pro", label: "Profissional" },
  { value: "enterprise", label: "Empresarial" }
];

export function CompanyForm({ formData, setFormData, onSave, onCancel, isEditing }: CompanyFormProps) {
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
        <select
          id="plan"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.plan}
          onChange={(e) => setFormData({...formData, plan: e.target.value as "basic" | "pro" | "enterprise"})}
        >
          {plans.map((plan) => (
            <option key={plan.value} value={plan.value}>
              {plan.label}
            </option>
          ))}
        </select>
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
