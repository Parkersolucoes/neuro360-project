
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
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
      const { data, error } = await supabase
        .from('plan_templates')
        .select('*');

      if (error) throw error;
      setPlanTemplates(data || []);
    } catch (error) {
      console.error('Error fetching plan templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Template criado com sucesso!"
      });
      
      return data;
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
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => prev.map(template => 
        template.id === id ? data : template
      ));
      
      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso!"
      });
      
      return data;
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
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('plan_templates')
        .insert([{ template_id: templateId, plan_id: planId }])
        .select()
        .single();

      if (error) throw error;
      
      setPlanTemplates(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Template vinculado ao plano com sucesso!"
      });
      
      return data;
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
      const { error } = await supabase
        .from('plan_templates')
        .delete()
        .eq('template_id', templateId)
        .eq('plan_id', planId);

      if (error) throw error;
      
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
