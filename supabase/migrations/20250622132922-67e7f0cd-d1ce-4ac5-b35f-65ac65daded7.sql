
-- Corrigir completamente as políticas RLS para webhook_integrations
-- Primeiro, desabilitar RLS temporariamente para limpeza
ALTER TABLE public.webhook_integrations DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can delete webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can view company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can insert company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can update company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can delete company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can manage company webhook integrations" ON public.webhook_integrations;

-- Reabilitar RLS
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Criar políticas simplificadas e funcionais
-- Política para SELECT (visualizar)
CREATE POLICY "Enable read for company users" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para INSERT (criar)
CREATE POLICY "Enable insert for company users" ON public.webhook_integrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para UPDATE (atualizar)
CREATE POLICY "Enable update for company users" ON public.webhook_integrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para DELETE (excluir)
CREATE POLICY "Enable delete for company managers" ON public.webhook_integrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );
