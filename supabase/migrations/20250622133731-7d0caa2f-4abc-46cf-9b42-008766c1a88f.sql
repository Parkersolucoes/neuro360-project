
-- Corrigir as políticas RLS para webhook_integrations
-- Primeiro, remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can insert company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can update company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can delete company webhook integrations" ON public.webhook_integrations;

-- Política para visualizar webhook integrations
CREATE POLICY "Users can view webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para inserir webhook integrations - usar WITH CHECK
CREATE POLICY "Users can insert webhook integrations" ON public.webhook_integrations
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para atualizar webhook integrations
CREATE POLICY "Users can update webhook integrations" ON public.webhook_integrations
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Política para deletar webhook integrations
CREATE POLICY "Users can delete webhook integrations" ON public.webhook_integrations
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );
