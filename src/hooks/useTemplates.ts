
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';

export interface Template {
  id: string;
  company_id: string;
  user_id?: string;
  name: string;
  description?: string;
  content: string;
  type: string;
  category: string;
  variables: string[];
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompanies();
  const { userLogin } = useAuth();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      if (!currentCompany || !userLogin) {
        setTemplates([]);
        return;
      }

      console.log('Fetching templates for company:', currentCompany.id);
      
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar templates",
          variant: "destructive"
        });
        return;
      }

      console.log('Templates fetched:', data);
      setTemplates((data || []).map(item => ({
        ...item,
        variables: Array.isArray(item.variables) 
          ? (item.variables as any[]).map(v => String(v))
          : []
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!currentCompany || !userLogin) {
        throw new Error('Nenhuma empresa ou usuário selecionado');
      }

      console.log('Creating template:', templateData);
      
      const { data, error } = await supabase
        .from('templates')
        .insert({
          company_id: templateData.company_id,
          user_id: templateData.user_id,
          name: templateData.name,
          description: templateData.description,
          content: templateData.content,
          type: templateData.type,
          category: templateData.category,
          variables: templateData.variables,
          status: templateData.status,
          is_active: templateData.is_active
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }

      console.log('Template created successfully:', data);
      
      toast({
        title: "Sucesso",
        description: "Template criado com sucesso"
      });

      await fetchTemplates();
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

  const updateTemplate = async (id: string, updates: Partial<Omit<Template, 'id' | 'created_at' | 'company_id'>>) => {
    try {
      console.log('Updating template:', id, updates);
      
      const { data, error } = await supabase
        .from('templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('company_id', currentCompany?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        throw error;
      }

      console.log('Template updated successfully:', data);

      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso"
      });

      await fetchTemplates();
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
      console.log('Deleting template:', id);
      
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id)
        .eq('company_id', currentCompany?.id);

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }

      console.log('Template deleted successfully');

      toast({
        title: "Sucesso",
        description: "Template removido com sucesso"
      });

      await fetchTemplates();
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

  const createDefaultTemplates = async () => {
    try {
      if (!currentCompany || !userLogin) {
        throw new Error('Nenhuma empresa ou usuário selecionado');
      }

      const defaultTemplates = [
        {
          name: "Boas-vindas Novo Cliente",
          content: "🎉 *Bem-vindo(a)!*\n\nOlá {nome_cliente},\n\nSeja muito bem-vindo(a) à {nome_empresa}!\n\nEstamos muito felizes em tê-lo(a) conosco. Em breve entraremos em contato para apresentar nossos serviços.\n\nQualquer dúvida, estamos aqui para ajudar!",
          description: "Template de boas-vindas para novos clientes",
          type: "welcome",
          category: "atendimento",
          variables: ["nome_cliente", "nome_empresa"],
          status: "active",
          is_active: true
        },
        {
          name: "Cobrança de Fatura",
          content: "⚠️ *FATURA VENCIDA*\n\nOlá {nome_cliente},\n\nIdentificamos que sua fatura no valor de R$ {valor} com vencimento em {data_vencimento} está em aberto.\n\nPara evitar juros e multas, realize o pagamento o quanto antes.\n\nCódigo de barras: {codigo_barras}",
          description: "Template para cobrança de faturas em atraso",
          type: "notification",
          category: "cobranca",
          variables: ["nome_cliente", "valor", "data_vencimento", "codigo_barras"],
          status: "active",
          is_active: true
        },
        {
          name: "Lembrete de Pagamento",
          content: "🔔 *LEMBRETE DE PAGAMENTO*\n\nOlá {nome_cliente},\n\nLembramos que sua fatura de R$ {valor} vence em {data_vencimento}.\n\nEvite juros e multas realizando o pagamento até a data de vencimento.\n\nObrigado!",
          description: "Template para lembrete de pagamentos próximos ao vencimento",
          type: "followup",
          category: "lembrete",
          variables: ["nome_cliente", "valor", "data_vencimento"],
          status: "active",
          is_active: true
        },
        {
          name: "Confirmação de Pagamento",
          content: "✅ *PAGAMENTO CONFIRMADO*\n\nOlá {nome_cliente},\n\nConfirmamos o recebimento do seu pagamento:\n\n💰 Valor: R$ {valor}\n📅 Data: {data_pagamento}\n🧾 Recibo: {numero_recibo}\n\nObrigado pela preferência!",
          description: "Template para confirmação de pagamentos recebidos",
          type: "notification",
          category: "confirmacao",
          variables: ["nome_cliente", "valor", "data_pagamento", "numero_recibo"],
          status: "active",
          is_active: true
        },
        {
          name: "Promoção Especial",
          content: "🏷️ *PROMOÇÃO ESPECIAL*\n\nOlá {nome_cliente},\n\nTemos uma oferta imperdível para você!\n\n🎯 {nome_promocao}\n💰 Desconto: {percentual_desconto}%\n⏳ Válida até: {data_validade}\n\nAproveite esta oportunidade única!\n\nMais informações: {telefone_contato}",
          description: "Template para divulgação de promoções e ofertas especiais",
          type: "message",
          category: "promocao",
          variables: ["nome_cliente", "nome_promocao", "percentual_desconto", "data_validade", "telefone_contato"],
          status: "active",
          is_active: true
        }
      ];

      // Verificar quais templates já existem para evitar duplicatas
      const existingTemplates = templates.map(t => t.name);
      const templatesToCreate = defaultTemplates.filter(template => 
        !existingTemplates.includes(template.name)
      );

      if (templatesToCreate.length === 0) {
        toast({
          title: "Informação",
          description: "Todos os templates padrão já foram criados",
        });
        return;
      }

      // Criar templates em lote
      const promises = templatesToCreate.map(template => 
        supabase
          .from('templates')
          .insert({
            ...template,
            company_id: currentCompany.id,
            user_id: userLogin.id
          })
      );

      await Promise.all(promises);

      toast({
        title: "Sucesso",
        description: `${templatesToCreate.length} templates padrão criados com sucesso!`
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error creating default templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar templates padrão",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [userLogin, currentCompany]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createDefaultTemplates,
    refetch: fetchTemplates
  };
}
