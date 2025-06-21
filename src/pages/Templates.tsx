
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
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";

export default function Templates() {
  const { toast } = useToast();
  const { templates, planTemplates, loading, createTemplate, updateTemplate, deleteTemplate, linkTemplateToPlan, unlinkTemplateFromPlan } = useTemplates();
  const { plans } = usePlans();
  const { userLogin } = useAuth();
  const { currentCompany } = useCompanies();

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
      // Validações básicas
      if (!newTemplate.name.trim()) {
        toast({
          title: "Erro",
          description: "Nome do template é obrigatório",
          variant: "destructive"
        });
        return;
      }

      if (!newTemplate.content.trim()) {
        toast({
          title: "Erro",
          description: "Conteúdo do template é obrigatório",
          variant: "destructive"
        });
        return;
      }

      // Preparar dados do template
      const templateData = {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim() || undefined,
        content: newTemplate.content.trim(),
        type: newTemplate.type,
        category: newTemplate.category,
        is_active: newTemplate.is_active,
        status: newTemplate.status,
        variables: newTemplate.variables || [],
        company_id: currentCompany?.id || null,
        user_id: userLogin?.id || null
      };

      let template;
      
      if (editingTemplate) {
        template = await updateTemplate(editingTemplate.id, templateData);
      } else {
        template = await createTemplate(templateData);
      }

      // Gerenciar associações com planos apenas se o template foi criado/atualizado com sucesso
      if (template && selectedPlans.length > 0) {
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
      
      // Resetar formulário
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
      toast({
        title: "Erro",
        description: "Erro ao salvar template. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const editTemplate = (template: any) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name || "",
      description: template.description || "",
      content: template.content || "",
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
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
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

  const handleDialogClose = () => {
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-2">Gerencie os templates de mensagens para WhatsApp</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
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
                <Button variant="outline" onClick={handleDialogClose} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </Button>
                <Button 
                  onClick={saveTemplate} 
                  disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                >
                  {editingTemplate ? "Atualizar" : "Criar"} Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {templates.length === 0 && !loading && (
        <Card className="border-dashed border-2 border-gray-300 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
            <p className="text-gray-500 text-center mb-6">
              Comece criando um novo template personalizado
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Criar Template
            </Button>
          </CardContent>
        </Card>
      )}

      {templates.length > 0 && (
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-indigo-50 border-b">
            <CardTitle className="flex items-center space-x-2 text-indigo-800">
              <MessageSquare className="w-5 h-5" />
              <span>Lista de Templates ({templates.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700">Nome</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                  <TableHead className="font-semibold text-gray-700">Categoria</TableHead>
                  <TableHead className="font-semibold text-gray-700">Planos Associados</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Criado em</TableHead>
                  <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-500">{template.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-indigo-100 text-indigo-800">
                        {getTypeLabel(template.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-gray-300 text-gray-700">
                        {template.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getAssociatedPlans(template.id).map((plan) => (
                          <Badge key={plan.id} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
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
                    <TableCell className="text-gray-600">
                      {new Date(template.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editTemplate(template)}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
      )}
    </div>
  );
}
