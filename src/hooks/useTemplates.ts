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
          content: "🎉 *Bem-vindo(a) à nossa empresa!*\n\nOlá *{nome_cliente}*,\n\nÉ um prazer tê-lo(a) conosco! 😊\n\nNossa equipe está preparada para oferecer o melhor atendimento e soluções personalizadas para suas necessidades.\n\nEm breve entraremos em contato para apresentar nossos serviços em detalhes.\n\nQualquer dúvida, estamos aqui para ajudar!\n\nAtenciosamente,\n*Equipe {nome_empresa}* 💙",
          description: "Template de boas-vindas para novos clientes",
          type: "welcome",
          category: "atendimento",
          variables: ["nome_cliente", "nome_empresa"],
          status: "active",
          is_active: true
        },
        {
          name: "Confirmação de Pedido",
          content: "✅ *PEDIDO CONFIRMADO*\n\nOlá *{nome_cliente}*!\n\nSeu pedido foi confirmado com sucesso! 🎉\n\n📋 *Detalhes do Pedido:*\n• Número: #{numero_pedido}\n• Itens: {itens_pedido}\n• Total: R$ {valor_total}\n• Previsão de entrega: {data_entrega}\n\n📦 Acompanhe o status do seu pedido através do link: {link_rastreamento}\n\nObrigado pela confiança! 🙏",
          description: "Template para confirmação de pedidos realizados",
          type: "notification",
          category: "vendas",
          variables: ["nome_cliente", "numero_pedido", "itens_pedido", "valor_total", "data_entrega", "link_rastreamento"],
          status: "active",
          is_active: true
        },
        {
          name: "Lembrete de Agendamento",
          content: "📅 *LEMBRETE DE AGENDAMENTO*\n\nOlá *{nome_cliente}*!\n\nLembramos que você tem um agendamento conosco:\n\n🗓️ *Data:* {data_agendamento}\n⏰ *Horário:* {horario_agendamento}\n📍 *Local:* {endereco_agendamento}\n👥 *Responsável:* {nome_responsavel}\n\n📝 *Serviço:* {tipo_servico}\n\nPor favor, confirme sua presença ou entre em contato para reagendar se necessário.\n\nNos vemos em breve! 😊",
          description: "Template para lembrete de agendamentos",
          type: "notification",
          category: "agendamento",
          variables: ["nome_cliente", "data_agendamento", "horario_agendamento", "endereco_agendamento", "nome_responsavel", "tipo_servico"],
          status: "active",
          is_active: true
        },
        {
          name: "Promoção Especial",
          content: "🔥 *PROMOÇÃO ESPECIAL PARA VOCÊ!*\n\nOlá *{nome_cliente}*!\n\nTemos uma oferta imperdível especialmente para você! 🎯\n\n🏷️ *{nome_promocao}*\n💰 *Desconto:* {percentual_desconto}% OFF\n⏳ *Válida até:* {data_validade}\n🎁 *Condições:* {condicoes_promocao}\n\n💡 *Como aproveitar:*\nUse o código: *{codigo_promocao}*\n\n📞 Entre em contato: {telefone_contato}\n💬 WhatsApp: {whatsapp_contato}\n\nNão perca esta oportunidade! ⚡",
          description: "Template para divulgação de promoções especiais",
          type: "message",
          category: "marketing",
          variables: ["nome_cliente", "nome_promocao", "percentual_desconto", "data_validade", "condicoes_promocao", "codigo_promocao", "telefone_contato", "whatsapp_contato"],
          status: "active",
          is_active: true
        },
        {
          name: "Pesquisa de Satisfação",
          content: "⭐ *COMO FOI SUA EXPERIÊNCIA?*\n\nOlá *{nome_cliente}*!\n\nSua opinião é muito importante para nós! 💙\n\nVocê poderia avaliar o atendimento/serviço que recebeu?\n\n📊 *Avalie de 1 a 5 estrelas:*\n⭐⭐⭐⭐⭐\n\n📝 *Conte-nos mais:*\n• O que mais gostou?\n• O que podemos melhorar?\n• Recomendaria nossos serviços?\n\n🎁 *Participe e concorra a:* {premio_pesquisa}\n\nSeu feedback nos ajuda a melhorar sempre!\n\nObrigado! 🙏",
          description: "Template para pesquisa de satisfação pós-atendimento",
          type: "followup",
          category: "pesquisa",
          variables: ["nome_cliente", "premio_pesquisa"],
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
        console.log('All default templates already exist');
        return;
      }

      console.log('Creating default templates:', templatesToCreate.length);

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

      setTemplates(prev => [...(data || []), ...prev]);

      toast({
        title: "Sucesso",
        description: `${data?.length || 0} templates padrão criados automaticamente!`
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
