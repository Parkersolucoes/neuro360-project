
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface MessageTemplate {
  id: string;
  company_id: string;
  user_id: string;
  name: string;
  content: string;
  variables: string[];
  category: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { userLogin } = useAuth();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany) {
        setTemplates([]);
        return;
      }

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching message templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates de mensagem",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at' | 'company_id' | 'user_id'>) => {
    try {
      if (!currentCompany || !userLogin) throw new Error('Dados necessários não encontrados');

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          ...templateData,
          company_id: currentCompany.id,
          user_id: userLogin.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template de mensagem criado com sucesso"
      });

      await fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error creating message template:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar template de mensagem",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template de mensagem atualizado com sucesso"
      });

      await fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error updating message template:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar template de mensagem",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template de mensagem removido com sucesso"
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting message template:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover template de mensagem",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [currentCompany]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates
  };
}
