
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

  const createDefaultTemplates = async () => {
    try {
      if (!currentCompany) {
        toast({
          title: "Erro",
          description: "Nenhuma empresa selecionada",
          variant: "destructive"
        });
        return;
      }

      const defaultTemplates = [
        {
          name: "Boas-vindas Novo Cliente",
          content: "🎉 *BEM-VINDO(A)!*\n\nOlá {nome_cliente},\n\nSeja muito bem-vindo(a) à {nome_empresa}!\n\nEstamos muito felizes em tê-lo(a) conosco. Nossa equipe está preparada para oferecer o melhor atendimento.\n\nEm breve entraremos em contato para apresentar nossos serviços.\n\nQualquer dúvida, estamos aqui para ajudar! 😊",
          description: "Template de boas-vindas para novos clientes",
          type: "welcome",
          category: "atendimento",
          variables: ["nome_cliente", "nome_empresa"],
          status: "active",
          is_active: true
        },
        {
          name: "Cobrança Fatura Vencida",
          content: "⚠️ *FATURA VENCIDA*\n\nOlá {nome_cliente},\n\nIdentificamos que sua fatura no valor de *R$ {valor}* com vencimento em *{data_vencimento}* está em aberto.\n\n📋 *Detalhes:*\n• Número: {numero_fatura}\n• Valor: R$ {valor}\n• Vencimento: {data_vencimento}\n• Dias em atraso: {dias_atraso}\n\nPara evitar juros e multas, realize o pagamento o quanto antes.\n\n💳 *Formas de pagamento:*\n• PIX: {chave_pix}\n• Boleto: {codigo_barras}\n\nPrecisa de ajuda? Entre em contato conosco!",
          description: "Template para cobrança de faturas vencidas",
          type: "notification",
          category: "cobranca",
          variables: ["nome_cliente", "valor", "data_vencimento", "numero_fatura", "dias_atraso", "chave_pix", "codigo_barras"],
          status: "active",
          is_active: true
        },
        {
          name: "Confirmação de Pagamento",
          content: "✅ *PAGAMENTO CONFIRMADO*\n\nOlá {nome_cliente},\n\nConfirmamos o recebimento do seu pagamento! 🎉\n\n📋 *Detalhes:*\n• Valor: R$ {valor}\n• Data: {data_pagamento}\n• Método: {metodo_pagamento}\n• Recibo: #{numero_recibo}\n\nSua situação está regularizada e seus serviços continuam ativos.\n\nObrigado pela preferência e pontualidade! 🙏",
          description: "Template para confirmação de pagamentos recebidos",
          type: "notification",
          category: "financeiro",
          variables: ["nome_cliente", "valor", "data_pagamento", "metodo_pagamento", "numero_recibo"],
          status: "active",
          is_active: true
        },
        {
          name: "Lembrete de Vencimento",
          content: "🔔 *LEMBRETE DE VENCIMENTO*\n\nOlá {nome_cliente},\n\nSua fatura vence em *{dias_restantes} dias*!\n\n📋 *Detalhes:*\n• Valor: R$ {valor}\n• Vencimento: {data_vencimento}\n• Número: {numero_fatura}\n\n💡 *Dica:* Programe o pagamento para evitar juros e multas.\n\n💳 *Pague rapidamente via:*\n• PIX: {chave_pix}\n• Link do boleto: {link_boleto}\n\nDúvidas? Estamos aqui para ajudar! 📞",
          description: "Template para lembrete de vencimento de faturas",
          type: "notification",
          category: "lembrete",
          variables: ["nome_cliente", "dias_restantes", "valor", "data_vencimento", "numero_fatura", "chave_pix", "link_boleto"],
          status: "active",
          is_active: true
        },
        {
          name: "Agendamento de Reunião",
          content: "📅 *AGENDAMENTO DE REUNIÃO*\n\nOlá {nome_cliente},\n\nGostaríamos de agendar uma reunião para {motivo_reuniao}.\n\n📋 *Proposta de horário:*\n• Data: {data_reuniao}\n• Horário: {horario}\n• Duração: {duracao}\n• Local: {local}\n• Modalidade: {modalidade}\n\n📝 *Pauta:*\n{pauta_reuniao}\n\nPor favor, confirme sua disponibilidade ou sugira um novo horário.\n\nAguardamos seu retorno! 📞",
          description: "Template para agendamento de reuniões",
          type: "message",
          category: "agendamento",
          variables: ["nome_cliente", "motivo_reuniao", "data_reuniao", "horario", "duracao", "local", "modalidade", "pauta_reuniao"],
          status: "active",
          is_active: true
        }
      ];

      // Verificar quais templates já existem para evitar duplicatas
      const existingTemplateNames = templates.map(t => t.name);
      const templatesToCreate = defaultTemplates.filter(template => 
        !existingTemplateNames.includes(template.name)
      );

      if (templatesToCreate.length === 0) {
        toast({
          title: "Informação",
          description: "Todos os templates padrão já foram criados",
        });
        return;
      }

      console.log('Creating default templates:', templatesToCreate.length);

      // Criar templates diretamente no banco de dados
      const templatesData = templatesToCreate.map(template => ({
        name: template.name,
        description: template.description,
        content: template.content,
        type: template.type,
        category: template.category,
        variables: template.variables,
        status: template.status,
        is_active: template.is_active,
        company_id: currentCompany.id,
        user_id: null
      }));

      const { data, error } = await supabase
        .from('templates')
        .insert(templatesData)
        .select();

      if (error) {
        console.error('Error creating default templates:', error);
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      console.log('Default templates created successfully:', data);

      // Atualizar a lista de templates
      setTemplates(prev => [...(data || []), ...prev]);

      toast({
        title: "Sucesso",
        description: `${data?.length || 0} templates padrão criados com sucesso!`
      });

    } catch (error) {
      console.error('Error creating default templates:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar templates padrão";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
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
    createDefaultTemplates,
    refetch: fetchTemplates
  };
}
