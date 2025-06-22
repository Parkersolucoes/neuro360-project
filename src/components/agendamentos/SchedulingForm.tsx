
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, Calendar, Clock } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

interface SchedulingFormProps {
  scheduling?: any;
  onSubmit: (schedulingData: any) => void;
  onCancel: () => void;
}

export function SchedulingForm({ scheduling, onSubmit, onCancel }: SchedulingFormProps) {
  const { currentCompany } = useCompanies();
  
  const [formData, setFormData] = useState({
    name: "",
    recipients: [],
    message_content: "",
    scheduled_for: "",
    status: "pending"
  });

  const [recipientInput, setRecipientInput] = useState("");

  useEffect(() => {
    if (scheduling) {
      setFormData({
        name: scheduling.name || "",
        recipients: scheduling.recipients || [],
        message_content: scheduling.message_content || "",
        scheduled_for: scheduling.scheduled_for ? new Date(scheduling.scheduled_for).toISOString().slice(0, 16) : "",
        status: scheduling.status || "pending"
      });
    }
  }, [scheduling]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      company_id: currentCompany?.id,
      scheduled_for: new Date(formData.scheduled_for).toISOString()
    });
  };

  const addRecipient = () => {
    if (recipientInput.trim()) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, { phone: recipientInput.trim() }]
      });
      setRecipientInput("");
    }
  };

  const removeRecipient = (index: number) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>{scheduling ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Agendamento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Campanha de Marketing"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scheduled_for">Data e Hora do Envio *</Label>
            <Input
              id="scheduled_for"
              type="datetime-local"
              value={formData.scheduled_for}
              onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Destinatários</Label>
            <div className="flex space-x-2">
              <Input
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder="Número do WhatsApp (ex: 5511999999999)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
              />
              <Button type="button" onClick={addRecipient} variant="outline">
                Adicionar
              </Button>
            </div>
            {formData.recipients.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.recipients.map((recipient: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{recipient.phone}</span>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeRecipient(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message_content">Mensagem *</Label>
            <Textarea
              id="message_content"
              value={formData.message_content}
              onChange={(e) => setFormData({...formData, message_content: e.target.value})}
              placeholder="Digite a mensagem que será enviada..."
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {scheduling ? 'Atualizar' : 'Agendar'} Envio
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
