
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface PlanTemplate {
  id: string;
  plan_id: string;
  template_id: string;
  created_at: string;
  updated_at: string;
}

export function usePlanTemplates() {
  const [planTemplates, setPlanTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlanTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plan_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlanTemplates(data || []);
    } catch (error) {
      console.error('Error fetching plan templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar associações de templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const linkTemplateToPlan = async (templateId: string, planId: string) => {
    try {
      const { data, error } = await supabase
        .from('plan_templates')
        .insert({
          template_id: templateId,
          plan_id: planId
        })
        .select()
        .single();

      if (error) throw error;

      setPlanTemplates(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Template associado ao plano com sucesso"
      });

      return data;
    } catch (error) {
      console.error('Error linking template to plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao associar template ao plano",
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
        description: "Template desassociado do plano com sucesso"
      });
    } catch (error) {
      console.error('Error unlinking template from plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao desassociar template do plano",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPlanTemplates();
  }, []);

  return {
    planTemplates,
    loading,
    linkTemplateToPlan,
    unlinkTemplateFromPlan,
    refetch: fetchPlanTemplates
  };
}
