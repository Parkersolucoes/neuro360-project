
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Template } from "@/hooks/useTemplates";

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: Template | null;
  newTemplate: any;
  setNewTemplate: (template: any) => void;
  selectedPlans: string[];
  setSelectedPlans: (plans: string[]) => void;
  plans: any[];
  onSave: () => void;
  templateTypes: { value: string; label: string }[];
}

export function TemplateDialog({
  isOpen,
  onClose,
  editingTemplate,
  newTemplate,
  setNewTemplate,
  selectedPlans,
  setSelectedPlans,
  plans,
  onSave,
  templateTypes
}: TemplateDialogProps) {
  const handlePlanSelection = (planId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlans([...selectedPlans, planId]);
    } else {
      setSelectedPlans(selectedPlans.filter(id => id !== planId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-indigo-50 -mx-6 -mt-6 px-6 py-4 border-b">
          <DialogTitle className="text-indigo-800 text-xl font-semibold">
            {editingTemplate ? "Editar Template" : "Novo Template"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Nome do Template *</Label>
              <Input
                id="name"
                placeholder="Nome do template"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição do template"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700 font-medium">Tipo</Label>
              <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}>
                <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {templateTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-gray-700 font-medium">Conteúdo *</Label>
              <Textarea
                id="content"
                placeholder="Digite o conteúdo do template..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                className="min-h-32 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg">
              <Switch
                id="is_active"
                checked={newTemplate.is_active}
                onCheckedChange={(checked) => setNewTemplate({...newTemplate, is_active: checked})}
              />
              <Label htmlFor="is_active" className="text-indigo-700 font-medium">Template Ativo</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-3 block text-gray-700">Planos Associados</Label>
              <p className="text-sm text-gray-600 mb-4">Selecione os planos que terão acesso a este template:</p>
              <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                    <Checkbox
                      id={`plan-${plan.id}`}
                      checked={selectedPlans.includes(plan.id)}
                      onCheckedChange={(checked) => handlePlanSelection(plan.id, checked as boolean)}
                    />
                    <Label htmlFor={`plan-${plan.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{plan.name}</span>
                        <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-800">
                          R$ {plan.price.toFixed(2)}
                        </Badge>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6">
          <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancelar
          </Button>
          <Button 
            onClick={onSave} 
            disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            {editingTemplate ? "Atualizar" : "Criar"} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
