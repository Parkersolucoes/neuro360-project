
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, XCircle, Hash, Edit } from "lucide-react";
import { Template } from "@/hooks/useTemplates";

interface TemplateDetailsProps {
  templateId: string;
  templates: Template[];
  onEdit: (template: Template) => void;
  getTypeLabel: (type: string) => string;
}

export function TemplateDetails({ templateId, templates, onEdit, getTypeLabel }: TemplateDetailsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  }, [templateId, templates]);

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <XCircle className="w-4 h-4 text-gray-500" />;
    }
    
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {selectedTemplate ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <span>{selectedTemplate.name}</span>
              {getStatusIcon(selectedTemplate.status, selectedTemplate.is_active)}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(selectedTemplate)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>

          {selectedTemplate.description && (
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input 
                value={selectedTemplate.description} 
                readOnly 
                className="bg-gray-50" 
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input 
                value={getTypeLabel(selectedTemplate.type)} 
                readOnly 
                className="bg-gray-50" 
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input 
                value={selectedTemplate.category.replace('_', ' ')} 
                readOnly 
                className="bg-gray-50 capitalize" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo do Template</Label>
            <Textarea
              value={selectedTemplate.content}
              readOnly
              className="min-h-32 bg-gray-50"
              rows={8}
            />
          </div>

          {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-1">
                <Hash className="w-4 h-4" />
                <span>Variáveis Disponíveis</span>
              </Label>
              <div className="flex flex-wrap gap-2 p-3 bg-orange-50 rounded-md border border-orange-200">
                {selectedTemplate.variables.map((variable, index) => (
                  <Badge key={index} variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                    {`{${variable}}`}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Use essas variáveis no conteúdo do template para personalizar as mensagens automaticamente.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Input 
                value={selectedTemplate.is_active && selectedTemplate.status === "active" ? "Ativo" : "Inativo"}
                readOnly 
                className="bg-gray-50" 
              />
            </div>
            <div className="space-y-2">
              <Label>Criado em</Label>
              <Input 
                value={new Date(selectedTemplate.created_at).toLocaleDateString('pt-BR')}
                readOnly 
                className="bg-gray-50" 
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
          <p>Template não encontrado</p>
        </div>
      )}
    </div>
  );
}
