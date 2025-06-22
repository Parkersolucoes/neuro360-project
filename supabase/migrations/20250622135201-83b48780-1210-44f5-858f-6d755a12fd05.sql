
-- Primeiro, vamos verificar e remover TODAS as políticas existentes na tabela webhook_integrations
DROP POLICY IF EXISTS "Users can view webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can delete webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Company users can view webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Company users can insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Company users can update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Company users can delete webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can view company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can insert company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can update company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can delete company webhook integrations" ON public.webhook_integrations;

-- Agora criar as políticas corretas
CREATE POLICY "webhook_select_policy" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "webhook_insert_policy" ON public.webhook_integrations
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "webhook_update_policy" ON public.webhook_integrations
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

CREATE POLICY "webhook_delete_policy" ON public.webhook_integrations
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );
