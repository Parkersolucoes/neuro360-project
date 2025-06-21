
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MessageSquare, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/useTemplates";
import { usePlans } from "@/hooks/usePlans";

export default function Templates() {
  const { toast } = useToast();
  const { templates, planTemplates, loading, createTemplate, updateTemplate, deleteTemplate, linkTemplateToPlan, unlinkTemplateFromPlan } = useTemplates();
  const { plans } = usePlans();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    content: "",
    type: "message",
    category: "general",
    is_active: true,
    status: "active",
    variables: [],
    company_id: null,
    user_id: null
  });

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  const templateTypes = [
    { value: "message", label: "Mensagem" },
    { value: "welcome", label: "Boas-vindas" },
    { value: "followup", label: "Follow-up" },
    { value: "notification", label: "Notificação" }
  ];

  const saveTemplate = async () => {
    try {
      let template;
      
      if (editingTemplate) {
        template = await updateTemplate(editingTemplate.id, newTemplate);
      } else {
        template = await createTemplate(newTemplate);
      }

      // Gerenciar associações com planos
      if (template) {
        const currentAssociations = planTemplates.filter(pt => pt.template_id === template.id);
        const currentPlanIds = currentAssociations.map(ca => ca.plan_id);

        // Remover associações que não estão mais selecionadas
        for (const planId of currentPlanIds) {
          if (!selectedPlans.includes(planId)) {
            await unlinkTemplateFromPlan(template.id, planId);
          }
        }

        // Adicionar novas associações
        for (const planId of selectedPlans) {
          if (!currentPlanIds.includes(planId)) {
            await linkTemplateToPlan(template.id, planId);
          }
        }
      }
      
      setNewTemplate({ 
        name: "", 
        description: "", 
        content: "", 
        type: "message",
        category: "general", 
        is_active: true,
        status: "active",
        variables: [],
        company_id: null,
        user_id: null
      });
      setSelectedPlans([]);
      setEditingTemplate(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const editTemplate = (template: any) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description || "",
      content: template.content,
      type: template.type || "message",
      category: template.category || "general",
      is_active: template.is_active !== false,
      status: template.status || "active",
      variables: template.variables || [],
      company_id: template.company_id,
      user_id: template.user_id
    });
    
    // Carregar planos associados
    const associatedPlans = planTemplates
      .filter(pt => pt.template_id === template.id)
      .map(pt => pt.plan_id);
    setSelectedPlans(associatedPlans);
    
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Tem certeza que deseja remover este template?")) {
      await deleteTemplate(templateId);
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = templateTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getAssociatedPlans = (templateId: string) => {
    const associatedPlanIds = planTemplates
      .filter(pt => pt.template_id === templateId)
      .map(pt => pt.plan_id);
    
    return plans.filter(plan => associatedPlanIds.includes(plan.id));
  };

  const handlePlanSelection = (planId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlans(prev => [...prev, planId]);
    } else {
      setSelectedPlans(prev => prev.filter(id => id !== planId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-2">Gerencie os templates de mensagens</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Template" : "Novo Template"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    placeholder="Nome do template"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Descrição do template"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    placeholder="Digite o conteúdo do template..."
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    className="min-h-32 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={newTemplate.is_active}
                    onCheckedChange={(checked) => setNewTemplate({...newTemplate, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Template Ativo</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">Planos Associados</Label>
                  <p className="text-sm text-gray-600 mb-4">Selecione os planos que terão acesso a este template:</p>
                  <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {plans.map((plan) => (
                      <div key={plan.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`plan-${plan.id}`}
                          checked={selectedPlans.includes(plan.id)}
                          onCheckedChange={(checked) => handlePlanSelection(plan.id, checked as boolean)}
                        />
                        <Label htmlFor={`plan-${plan.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{plan.name}</span>
                            <Badge variant="outline" className="text-xs">
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
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingTemplate(null);
                setSelectedPlans([]);
                setNewTemplate({ 
                  name: "", 
                  description: "", 
                  content: "", 
                  type: "message",
                  category: "general", 
                  is_active: true,
                  status: "active",
                  variables: [],
                  company_id: null,
                  user_id: null
                });
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={saveTemplate} 
                disabled={!newTemplate.name || !newTemplate.content}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingTemplate ? "Atualizar" : "Criar"} Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span>Lista de Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Planos Associados</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      {template.description && (
                        <div className="text-sm text-gray-500">{template.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(template.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getAssociatedPlans(template.id).map((plan) => (
                        <Badge key={plan.id} variant="outline" className="text-xs">
                          {plan.name}
                        </Badge>
                      ))}
                      {getAssociatedPlans(template.id).length === 0 && (
                        <span className="text-sm text-gray-500">Nenhum plano</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      template.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }>
                      {template.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editTemplate(template)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
