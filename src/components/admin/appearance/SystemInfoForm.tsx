
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SystemInfoFormProps {
  systemName: string;
  systemDescription: string;
  primaryColor: string;
  onSystemNameChange: (value: string) => void;
  onSystemDescriptionChange: (value: string) => void;
  onPrimaryColorChange: (value: string) => void;
}

export function SystemInfoForm({
  systemName,
  systemDescription,
  primaryColor,
  onSystemNameChange,
  onSystemDescriptionChange,
  onPrimaryColorChange
}: SystemInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="system_name">Nome do Sistema</Label>
        <Input
          id="system_name"
          value={systemName}
          onChange={(e) => onSystemNameChange(e.target.value)}
          placeholder="Nome do sistema"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="system_description">Descrição</Label>
        <Textarea
          id="system_description"
          value={systemDescription}
          onChange={(e) => onSystemDescriptionChange(e.target.value)}
          placeholder="Soluções de Análise dados para seu negócio"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_color">Cor Primária</Label>
        <div className="flex space-x-2">
          <Input
            id="primary_color"
            type="color"
            value={primaryColor}
            onChange={(e) => onPrimaryColorChange(e.target.value)}
            className="w-20 h-10"
          />
          <Input
            value={primaryColor}
            onChange={(e) => onPrimaryColorChange(e.target.value)}
            placeholder="#1e293b"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
