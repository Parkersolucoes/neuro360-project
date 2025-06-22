
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTemplates } from "@/hooks/useTemplates";
import { useAuth } from "@/hooks/useAuth";
import { useCompanies } from "@/hooks/useCompanies";
import { TemplateDialog } from "@/components/templates/TemplateDialog";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplateDetails } from "@/components/templates/TemplateDetails";

export default function Templates() {
  const { toast } = useToast();
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, createDefaultTemplates } = useTemplates();
  const { userLogin } = useAuth();
  const { currentCompany } = useCompanies();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    content: "",
    type: "message",
    category: "general",
    variables: [],
    status: "active",
    is_active: true,
    company_id: "",
    user_id: ""
  });

  const templateTypes = [
    { value: "message", label: "Mensagem" },
    { value: "welcome", label: "Boas-vindas" },
    { value: "followup", label: "Follow-up" },
    { value: "notification", label: "Notificação" }
  ];

  // Criar templates padrão ao carregar a página se não houver nenhum
  useEffect(() => {
    if (!loading && templates.length === 0 && currentCompany) {
      createDefaultTemplates();
    }
  }, [loading, templates.length, currentCompany]);

  const saveTemplate = async () => {
    try {
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

      const templateData = {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim() || undefined,
        content: newTemplate.content.trim(),
        type: newTemplate.type,
        category: newTemplate.category,
        variables: newTemplate.variables || [],
        status: newTemplate.status,
        is_active: newTemplate.is_active,
        company_id: currentCompany?.id || "",
        user_id: userLogin?.id || ""
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      
      setNewTemplate({ 
        name: "", 
        description: "", 
        content: "", 
        type: "message",
        category: "general", 
        variables: [],
        status: "active",
        is_active: true,
        company_id: "",
        user_id: ""
      });
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
      variables: template.variables || [],
      status: template.status || "active",
      is_active: template.is_active !== false,
      company_id: template.company_id || "",
      user_id: template.user_id || ""
    });
    
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Tem certeza que deseja remover este template?")) {
      try {
        await deleteTemplate(templateId);
        if (selectedTemplateId === templateId) {
          setViewMode('list');
          setSelectedTemplateId(null);
        }
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = templateTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const handleViewTemplate = (template: any) => {
    setSelectedTemplateId(template.id);
    setViewMode('details');
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setNewTemplate({ 
      name: "", 
      description: "", 
      content: "", 
      type: "message",
      category: "general", 
      variables: [],
      status: "active",
      is_active: true,
      company_id: "",
      user_id: ""
    });
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-blue-600 rounded-t-lg px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Templates de Mensagens</h1>
            <p className="text-blue-100 mt-1">Gerencie os templates de mensagens para WhatsApp</p>
          </div>
          <div className="flex space-x-3">
            {viewMode === 'details' && (
              <Button 
                onClick={() => {
                  setViewMode('list');
                  setSelectedTemplateId(null);
                }}
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg font-medium"
              >
                Voltar à Lista
              </Button>
            )}
            <Button
              onClick={createDefaultTemplates}
              className="bg-green-600 text-white hover:bg-green-700 shadow-lg font-medium"
            >
              <Palette className="w-4 h-4 mr-2" />
              Templates Padrão
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg font-medium">
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
                onSave={saveTemplate}
                templateTypes={templateTypes}
              />
            </Dialog>
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {viewMode === 'list' ? (
            <TemplateList
              templates={templates}
              onEdit={editTemplate}
              onDelete={handleDeleteTemplate}
              onView={handleViewTemplate}
              getTypeLabel={getTypeLabel}
            />
          ) : (
            selectedTemplateId && (
              <TemplateDetails
                templateId={selectedTemplateId}
                templates={templates}
                onEdit={editTemplate}
                getTypeLabel={getTypeLabel}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
