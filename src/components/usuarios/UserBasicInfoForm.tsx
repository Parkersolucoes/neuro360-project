
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserBasicInfoFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
  onChange: (field: string, value: string) => void;
}

export function UserBasicInfoForm({ formData, onChange }: UserBasicInfoFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          placeholder="Nome do usuário"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@empresa.com"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          placeholder="(11) 99999-9999"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          placeholder="(11) 99999-9999"
          value={formData.whatsapp}
          onChange={(e) => onChange('whatsapp', e.target.value)}
          className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
