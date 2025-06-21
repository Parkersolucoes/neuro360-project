
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Template {
  id: string;
  name: string;
  content: string;
  type: string;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      console.log('Templates: Table templates does not exist in current database schema');
      
      // Como a tabela templates não existe, retornar array vazio
      setTemplates([]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Templates: Cannot create template - table templates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de templates está temporariamente indisponível",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar template",
        variant: "destructive"
      });
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      console.log('Templates: Cannot update template - table templates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de templates está temporariamente indisponível",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      console.log('Templates: Cannot delete template - table templates does not exist');
      
      toast({
        title: "Erro",
        description: "Funcionalidade de templates está temporariamente indisponível",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar template",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates
  };
}
