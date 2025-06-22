
-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow company users to select webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Allow company users to insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Allow company users to update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Allow company users to delete webhook integrations" ON public.webhook_integrations;

-- Criar políticas que incluem acesso para usuários master
CREATE POLICY "Users can select webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    -- Usuário master pode ver tudo
    public.is_master_user() OR
    -- Usuário da empresa pode ver da sua empresa
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert webhook integrations" ON public.webhook_integrations
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Usuário master pode inserir para qualquer empresa
      public.is_master_user() OR
      -- Usuário da empresa pode inserir para sua empresa
      EXISTS (
        SELECT 1 FROM public.user_companies 
        WHERE user_companies.company_id = webhook_integrations.company_id 
        AND user_companies.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update webhook integrations" ON public.webhook_integrations
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND (
      -- Usuário master pode atualizar qualquer webhook
      public.is_master_user() OR
      -- Usuário da empresa pode atualizar da sua empresa
      EXISTS (
        SELECT 1 FROM public.user_companies 
        WHERE user_companies.company_id = webhook_integrations.company_id 
        AND user_companies.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Usuário master pode atualizar para qualquer empresa
      public.is_master_user() OR
      -- Usuário da empresa pode atualizar para sua empresa
      EXISTS (
        SELECT 1 FROM public.user_companies 
        WHERE user_companies.company_id = webhook_integrations.company_id 
        AND user_companies.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete webhook integrations" ON public.webhook_integrations
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND (
      -- Usuário master pode deletar qualquer webhook
      public.is_master_user() OR
      -- Usuário da empresa pode deletar da sua empresa
      EXISTS (
        SELECT 1 FROM public.user_companies 
        WHERE user_companies.company_id = webhook_integrations.company_id 
        AND user_companies.user_id = auth.uid()
      )
    )
  );
