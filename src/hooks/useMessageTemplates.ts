
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
      setTemplates((data || []).map(item => ({
        ...item,
        variables: Array.isArray(item.variables) 
          ? (item.variables as any[]).map(v => String(v))
          : [],
        status: item.status as 'active' | 'inactive'
      })));
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

  const createDefaultTemplates = async () => {
    try {
      if (!currentCompany || !userLogin) throw new Error('Dados necessários não encontrados');

      const defaultTemplates = [
        {
          name: "Lista de Contas a Pagar",
          content: "📋 *CONTAS A PAGAR - {data}*\n\nOlá {nome_cliente},\n\nSegue a lista de contas a pagar para hoje:\n\n{lista_contas}\n\nTotal: R$ {valor_total}\n\nQualquer dúvida, estamos à disposição!",
          variables: ["data", "nome_cliente", "lista_contas", "valor_total"],
          category: "financeiro",
          status: "active" as const
        },
        {
          name: "Cobrança de Fatura Vencida",
          content: "⚠️ *FATURA VENCIDA*\n\nOlá {nome_cliente},\n\nIdentificamos que sua fatura no valor de R$ {valor} com vencimento em {data_vencimento} está em aberto.\n\nPara evitar juros e multas, realize o pagamento o quanto antes.\n\nCódigo de barras: {codigo_barras}",
          variables: ["nome_cliente", "valor", "data_vencimento", "codigo_barras"],
          category: "cobranca",
          status: "active" as const
        },
        {
          name: "Lembrete de Pagamento",
          content: "🔔 *LEMBRETE DE PAGAMENTO*\n\nOlá {nome_cliente},\n\nLembramos que sua fatura de R$ {valor} vence em {data_vencimento}.\n\nEvite juros e multas realizando o pagamento até a data de vencimento.\n\nObrigado!",
          variables: ["nome_cliente", "valor", "data_vencimento"],
          category: "lembrete",
          status: "active" as const
        },
        {
          name: "Confirmação de Pagamento",
          content: "✅ *PAGAMENTO CONFIRMADO*\n\nOlá {nome_cliente},\n\nConfirmamos o recebimento do seu pagamento:\n\n💰 Valor: R$ {valor}\n📅 Data: {data_pagamento}\n🧾 Recibo: {numero_recibo}\n\nObrigado pela preferência!",
          variables: ["nome_cliente", "valor", "data_pagamento", "numero_recibo"],
          category: "confirmacao",
          status: "active" as const
        },
        {
          name: "Agendamento de Reunião",
          content: "📅 *AGENDAMENTO DE REUNIÃO*\n\nOlá {nome_cliente},\n\nGostaríamos de agendar uma reunião:\n\n🗓️ Data: {data_reuniao}\n⏰ Horário: {horario}\n📍 Local: {local}\n📋 Assunto: {assunto}\n\nConfirme sua participação!",
          variables: ["nome_cliente", "data_reuniao", "horario", "local", "assunto"],
          category: "agendamento",
          status: "active" as const
        },
        {
          name: "Boas-vindas Novo Cliente",
          content: "🎉 *BEM-VINDO(A)!*\n\nOlá {nome_cliente},\n\nSeja muito bem-vindo(a) à {nome_empresa}!\n\nEstamos muito felizes em tê-lo(a) conosco. Em breve entraremos em contato para apresentar nossos serviços.\n\nQualquer dúvida, estamos aqui para ajudar!",
          variables: ["nome_cliente", "nome_empresa"],
          category: "welcome",
          status: "active" as const
        },
        {
          name: "Promoção Especial",
          content: "🏷️ *PROMOÇÃO ESPECIAL*\n\nOlá {nome_cliente},\n\nTemos uma oferta imperdível para você!\n\n🎯 {nome_promocao}\n💰 Desconto: {percentual_desconto}%\n⏳ Válida até: {data_validade}\n\nAproveite esta oportunidade única!\n\nMais informações: {telefone_contato}",
          variables: ["nome_cliente", "nome_promocao", "percentual_desconto", "data_validade", "telefone_contato"],
          category: "promocao",
          status: "active" as const
        },
        {
          name: "Relatório Mensal",
          content: "📊 *RELATÓRIO MENSAL - {mes_ano}*\n\nOlá {nome_cliente},\n\nSegue o resumo das atividades do mês:\n\n📈 Receitas: R$ {total_receitas}\n📉 Despesas: R$ {total_despesas}\n💰 Saldo: R$ {saldo_final}\n\nRelatório completo em anexo.",
          variables: ["mes_ano", "nome_cliente", "total_receitas", "total_despesas", "saldo_final"],
          category: "relatorio",
          status: "active" as const
        },
        {
          name: "Solicitação de Documentos",
          content: "📄 *SOLICITAÇÃO DE DOCUMENTOS*\n\nOlá {nome_cliente},\n\nPara dar continuidade ao processo {nome_processo}, precisamos dos seguintes documentos:\n\n{lista_documentos}\n\n📧 Envie para: {email_empresa}\n📱 WhatsApp: {telefone_empresa}\n\nPrazo: {prazo_entrega}",
          variables: ["nome_cliente", "nome_processo", "lista_documentos", "email_empresa", "telefone_empresa", "prazo_entrega"],
          category: "documentos",
          status: "active" as const
        },
        {
          name: "Aviso de Manutenção",
          content: "🔧 *AVISO DE MANUTENÇÃO*\n\nOlá {nome_cliente},\n\nInformamos que haverá manutenção programada:\n\n📅 Data: {data_manutencao}\n⏰ Horário: {horario_inicio} às {horario_fim}\n🛠️ Serviços afetados: {servicos_afetados}\n\nPedimos desculpas pelo inconveniente.",
          variables: ["nome_cliente", "data_manutencao", "horario_inicio", "horario_fim", "servicos_afetados"],
          category: "manutencao",
          status: "active" as const
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
          .from('message_templates')
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
  }, [currentCompany]);

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
