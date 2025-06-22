
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Template } from "@/hooks/useTemplates";

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: Template | null;
  newTemplate: any;
  setNewTemplate: (template: any) => void;
  onSave: () => void;
  templateTypes: { value: string; label: string }[];
}

export function TemplateDialog({
  isOpen,
  onClose,
  editingTemplate,
  newTemplate,
  setNewTemplate,
  onSave,
  templateTypes
}: TemplateDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-blue-50 -mx-6 -mt-6 px-6 py-4 border-b border-blue-200">
          <DialogTitle className="text-blue-800 text-xl font-semibold">
            {editingTemplate ? "Editar Template" : "Novo Template"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium text-sm">Nome do Template *</Label>
              <Input
                id="name"
                placeholder="Nome do template"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700 font-medium text-sm">Tipo</Label>
              <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium text-sm">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição do template"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-700 font-medium text-sm">Categoria</Label>
            <Input
              id="category"
              placeholder="Ex: cobranca, promocao, atendimento"
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-700 font-medium text-sm">Conteúdo *</Label>
            <Textarea
              id="content"
              placeholder="Digite o conteúdo do template... Use {variavel} para campos dinâmicos"
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
              className="min-h-40 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white resize-none"
              rows={10}
            />
            <p className="text-xs text-gray-600">
              Use variáveis como {"{nome_cliente}"}, {"{valor}"}, {"{data_vencimento}"} para personalizar as mensagens.
            </p>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Switch
              id="is_active"
              checked={newTemplate.is_active}
              onCheckedChange={(checked) => setNewTemplate({...newTemplate, is_active: checked})}
            />
            <Label htmlFor="is_active" className="text-blue-700 font-medium text-sm">Template Ativo</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 pb-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSave} 
            disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 font-medium"
          >
            {editingTemplate ? "Atualizar" : "Criar"} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
