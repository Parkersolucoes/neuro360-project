
-- Remover políticas existentes
DROP POLICY IF EXISTS "webhook_select_policy" ON public.webhook_integrations;
DROP POLICY IF EXISTS "webhook_insert_policy" ON public.webhook_integrations;
DROP POLICY IF EXISTS "webhook_update_policy" ON public.webhook_integrations;
DROP POLICY IF EXISTS "webhook_delete_policy" ON public.webhook_integrations;

-- Criar políticas mais permissivas para todos os usuários da empresa
CREATE POLICY "Allow company users to select webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow company users to insert webhook integrations" ON public.webhook_integrations
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow company users to update webhook integrations" ON public.webhook_integrations
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow company users to delete webhook integrations" ON public.webhook_integrations
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );
