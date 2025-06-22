
-- Habilitar RLS na tabela webhook_integrations se ainda não estiver habilitado
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can manage company webhook integrations" ON public.webhook_integrations;

-- Criar política para visualizar integrações webhook da empresa
CREATE POLICY "Users can view company webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Criar política para gerenciar (INSERT, UPDATE, DELETE) integrações webhook da empresa
CREATE POLICY "Users can manage company webhook integrations" ON public.webhook_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );
