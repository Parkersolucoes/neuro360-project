
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SystemInfoFormProps {
  systemName: string;
  systemDescription: string;
  onSystemNameChange: (value: string) => void;
  onSystemDescriptionChange: (value: string) => void;
}

export function SystemInfoForm({
  systemName,
  systemDescription,
  onSystemNameChange,
  onSystemDescriptionChange
}: SystemInfoFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="system_name">Nome do Sistema</Label>
        <Input
          id="system_name"
          value={systemName}
          onChange={(e) => onSystemNameChange(e.target.value)}
          placeholder="Visão 360 - Soluções empresariais"
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
    </div>
  );
}
