
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePlanTemplates } from '@/hooks/usePlanTemplates';
import { useCompanies } from '@/hooks/useCompanies';
import { Json } from '@/integrations/supabase/types';

export interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
  type: string;
  category: string;
  variables: Json;
  status: string;
  is_active: boolean;
  company_id: string | null;
  user_id: string | null;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { 
    planTemplates, 
    linkTemplateToPlan: linkTemplate, 
    unlinkTemplateFromPlan: unlinkTemplate 
  } = usePlanTemplates();

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates for company:', currentCompany);
      setLoading(true);
      
      let query = supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      // Se há empresa selecionada, filtrar por ela
      if (currentCompany) {
        query = query.eq('company_id', currentCompany.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      console.log('Templates fetched successfully:', data);
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive"
      });
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating template with data:', templateData);
      
      // Validações básicas
      if (!templateData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!templateData.content?.trim()) {
        throw new Error('Conteúdo é obrigatório');
      }

      // Preparar dados para inserção
      const templateToInsert = {
        name: templateData.name.trim(),
        description: templateData.description?.trim() || null,
        content: templateData.content.trim(),
        type: templateData.type || 'message',
        category: templateData.category || 'general',
        variables: templateData.variables || [],
        status: templateData.status || 'active',
        is_active: templateData.is_active !== false,
        company_id: currentCompany?.id || null,
        user_id: templateData.user_id || null
      };

      console.log('Inserting template data:', templateToInsert);

      const { data, error } = await supabase
        .from('templates')
        .insert([templateToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating template:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      console.log('Template created successfully:', data);
      
      setTemplates(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Template criado com sucesso!"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar template";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      console.log('Updating template:', id, 'with data:', updates);

      // Preparar dados para atualização
      const updateData: any = { ...updates };
      
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }
      
      if (updateData.description) {
        updateData.description = updateData.description.trim();
      }
      
      if (updateData.content) {
        updateData.content = updateData.content.trim();
      }

      const { data, error } = await supabase
        .from('templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      console.log('Template updated successfully:', data);
      
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
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar template";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      console.log('Deleting template:', id);

      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }
      
      console.log('Template deleted successfully:', id);
      
      setTemplates(prev => prev.filter(template => template.id !== id));
      toast({
        title: "Sucesso",
        description: "Template removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao remover template";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const linkTemplateToPlan = async (templateId: string, planId: string) => {
    return await linkTemplate(templateId, planId);
  };

  const unlinkTemplateFromPlan = async (templateId: string, planId: string) => {
    return await unlinkTemplate(templateId, planId);
  };

  // Effect que carrega templates quando a empresa atual muda
  useEffect(() => {
    console.log('useTemplates effect triggered - currentCompany changed:', currentCompany);
    fetchTemplates();
  }, [currentCompany?.id]);

  return {
    templates,
    planTemplates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    linkTemplateToPlan,
    unlinkTemplateFromPlan,
    refetch: fetchTemplates
  };
}
