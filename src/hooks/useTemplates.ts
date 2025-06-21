
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanTemplate {
  id: string;
  plan_id: string;
  template_id: string;
  created_at: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [planTemplates, setPlanTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      // Since templates table doesn't exist, return empty array
      setTemplates([]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive"
      });
    }
  };

  const fetchPlanTemplates = async () => {
    try {
      // Since plan_templates table doesn't exist, return empty array
      setPlanTemplates([]);
    } catch (error) {
      console.error('Error fetching plan templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simulate creating a template since table doesn't exist
      const mockTemplate: Template = {
        id: `mock-template-${Date.now()}`,
        ...templateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTemplates(prev => [mockTemplate, ...prev]);
      toast({
        title: "Informação",
        description: "Funcionalidade Templates será implementada em uma próxima versão. Template simulado criado."
      });
      
      return mockTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      // Simulate updating template
      const updatedTemplate = templates.find(template => template.id === id);
      if (!updatedTemplate) throw new Error('Template not found');
      
      const newTemplate = { ...updatedTemplate, ...updates };
      setTemplates(prev => prev.map(template => 
        template.id === id ? newTemplate : template
      ));
      
      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso!"
      });
      
      return newTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setTemplates(prev => prev.filter(template => template.id !== id));
      toast({
        title: "Sucesso",
        description: "Template removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const linkTemplateToPlan = async (templateId: string, planId: string) => {
    try {
      // Simulate linking template to plan
      const mockPlanTemplate: PlanTemplate = {
        id: `mock-plan-template-${Date.now()}`,
        template_id: templateId,
        plan_id: planId,
        created_at: new Date().toISOString()
      };
      
      setPlanTemplates(prev => [...prev, mockPlanTemplate]);
      toast({
        title: "Sucesso",
        description: "Template vinculado ao plano com sucesso!"
      });
      
      return mockPlanTemplate;
    } catch (error) {
      console.error('Error linking template to plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao vincular template ao plano",
        variant: "destructive"
      });
      throw error;
    }
  };

  const unlinkTemplateFromPlan = async (templateId: string, planId: string) => {
    try {
      setPlanTemplates(prev => prev.filter(pt => 
        !(pt.template_id === templateId && pt.plan_id === planId)
      ));
      
      toast({
        title: "Sucesso",
        description: "Template desvinculado do plano com sucesso!"
      });
    } catch (error) {
      console.error('Error unlinking template from plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao desvincular template do plano",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchPlanTemplates();
  }, []);

  return {
    templates,
    planTemplates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    linkTemplateToPlan,
    unlinkTemplateFromPlan,
    refetch: () => {
      fetchTemplates();
      fetchPlanTemplates();
    }
  };
}
