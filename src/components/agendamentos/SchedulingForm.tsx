
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, X, Plus, Trash2 } from "lucide-react";
import { Scheduling } from "@/hooks/useSchedulingsNew";

interface SchedulingFormProps {
  scheduling?: Scheduling | null;
  onSubmit: (schedulingData: any) => Promise<void>;
  onCancel: () => void;
}

export function SchedulingForm({ scheduling, onSubmit, onCancel }: SchedulingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    message_content: "",
    scheduled_for: "",
    status: "pending" as const,
    recipients: [""]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (scheduling) {
      setFormData({
        name: scheduling.name || "",
        message_content: scheduling.message_content || "",
        scheduled_for: scheduling.scheduled_for ? scheduling.scheduled_for.slice(0, 16) : "",
        status: scheduling.status || "pending",
        recipients: Array.isArray(scheduling.recipients) && scheduling.recipients.length > 0 
          ? scheduling.recipients.map(r => typeof r === 'string' ? r : r.phone || r.number || '')
          : [""]
      });
    } else {
      // Definir data padrão para 1 hora à frente
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1);
      const defaultDateString = defaultDate.toISOString().slice(0, 16);
      
      setFormData({
        name: "",
        message_content: "",
        scheduled_for: defaultDateString,
        status: "pending",
        recipients: [""]
      });
    }
    setErrors({});
  }, [scheduling]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome do agendamento é obrigatório";
    }

    if (!formData.message_content.trim()) {
      newErrors.message_content = "Conteúdo da mensagem é obrigatório";
    }

    if (!formData.scheduled_for) {
      newErrors.scheduled_for = "Data de agendamento é obrigatória";
    } else {
      const scheduledDate = new Date(formData.scheduled_for);
      if (scheduledDate <= new Date()) {
        newErrors.scheduled_for = "Data de agendamento deve ser no futuro";
      }
    }

    // Validar destinatários
    const validRecipients = formData.recipients.filter(r => r.trim());
    if (validRecipients.length === 0) {
      newErrors.recipients = "Pelo menos um destinatário é obrigatório";
    }

    // Validar formato dos números (simples)
    for (const recipient of validRecipients) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(recipient.trim())) {
        newErrors.recipients = "Formato inválido em um dos números de telefone";
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const validRecipients = formData.recipients
        .filter(r => r.trim())
        .map(r => ({ phone: r.trim() }));

      const submitData = {
        ...formData,
        recipients: validRecipients,
        template_id: null,
        user_id: null
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, ""]
    }));
  };

  const removeRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? value : r)
    }));
    // Limpar erro se existir
    if (errors.recipients) {
      setErrors(prev => ({ ...prev, recipients: "" }));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agendamento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="Ex: Campanha de Black Friday"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_for">Data e Hora do Envio *</Label>
            <Input
              id="scheduled_for"
              type="datetime-local"
              value={formData.scheduled_for}
              onChange={(e) => handleFieldChange("scheduled_for", e.target.value)}
              className={errors.scheduled_for ? "border-red-500" : ""}
            />
            {errors.scheduled_for && <p className="text-sm text-red-600">{errors.scheduled_for}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message_content">Conteúdo da Mensagem *</Label>
          <Textarea
            id="message_content"
            value={formData.message_content}
            onChange={(e) => handleFieldChange("message_content", e.target.value)}
            placeholder="Digite a mensagem que será enviada..."
            className={`min-h-32 ${errors.message_content ? "border-red-500" : ""}`}
          />
          {errors.message_content && <p className="text-sm text-red-600">{errors.message_content}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Destinatários *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRecipient}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
          
          <div className="space-y-2">
            {formData.recipients.map((recipient, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={recipient}
                  onChange={(e) => updateRecipient(index, e.target.value)}
                  placeholder="Ex: +5511999999999"
                  className={errors.recipients ? "border-red-500" : ""}
                />
                {formData.recipients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRecipient(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {errors.recipients && <p className="text-sm text-red-600">{errors.recipients}</p>}
          <p className="text-xs text-gray-500">
            Digite os números no formato internacional (+55 para Brasil)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "pending" | "sent" | "cancelled" | "failed") => handleFieldChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Salvando..." : scheduling ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
