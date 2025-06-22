
-- Verificar e corrigir as políticas RLS para webhook_integrations
-- Primeiro, vamos garantir que a tabela tenha RLS habilitado
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes para recriá-las corretamente
DROP POLICY IF EXISTS "Company users can view webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Company users can insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Company users can update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Company users can delete webhook integrations" ON public.webhook_integrations;

-- Criar políticas mais permissivas para usuários autenticados
-- Política para SELECT (visualizar)
CREATE POLICY "Users can view company webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para INSERT (criar) - mais permissiva
CREATE POLICY "Users can insert company webhook integrations" ON public.webhook_integrations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para UPDATE (atualizar)
CREATE POLICY "Users can update company webhook integrations" ON public.webhook_integrations
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para DELETE (excluir)
CREATE POLICY "Users can delete company webhook integrations" ON public.webhook_integrations
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );
