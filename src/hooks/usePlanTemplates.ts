
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PlanTemplate {
  id: string;
  plan_id: string;
  template_id: string;
  created_at: string;
  updated_at: string;
}

export function usePlanTemplates() {
  const [planTemplates, setPlanTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPlanTemplates = async () => {
    try {
      setLoading(true);
      console.log('PlanTemplates: Table plan_templates does not exist in current database schema');
      
      // Como a tabela plan_templates não existe no banco, retornar array vazio
      setPlanTemplates([]);
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
      console.log('PlanTemplates: Cannot link template to plan - table plan_templates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de associação de templates está temporariamente indisponível",
        variant: "destructive"
      });

      throw new Error('Table plan_templates does not exist');
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
      console.log('PlanTemplates: Cannot unlink template from plan - table plan_templates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de desassociação de templates está temporariamente indisponível",
        variant: "destructive"
      });

      throw new Error('Table plan_templates does not exist');
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
