
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/useTemplates";
import { usePlans } from "@/hooks/usePlans";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplateEmptyState } from "@/components/templates/TemplateEmptyState";

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
            <TemplateDialog
              isOpen={isDialogOpen}
              onClose={handleDialogClose}
              editingTemplate={editingTemplate}
              newTemplate={newTemplate}
              setNewTemplate={setNewTemplate}
              selectedPlans={selectedPlans}
              setSelectedPlans={setSelectedPlans}
              plans={plans}
              onSave={saveTemplate}
              templateTypes={templateTypes}
            />
          </Dialog>
        </div>
      </div>

      {templates.length === 0 && !loading && (
        <TemplateEmptyState onCreateTemplate={() => setIsDialogOpen(true)} />
      )}

      {templates.length > 0 && (
        <TemplateList
          templates={templates}
          onEditTemplate={editTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          getTypeLabel={getTypeLabel}
          getAssociatedPlans={getAssociatedPlans}
        />
      )}
    </div>
  );
}
