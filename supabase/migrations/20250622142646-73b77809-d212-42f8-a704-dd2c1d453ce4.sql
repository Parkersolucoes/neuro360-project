
-- Primeiro, vamos verificar e corrigir a função is_master_user para usar a tabela users correta
CREATE OR REPLACE FUNCTION public.is_master_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND is_admin = '0'
  );
$$;

-- Remover as políticas existentes da tabela webhook_integrations
DROP POLICY IF EXISTS "Users can select webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can delete webhook integrations" ON public.webhook_integrations;

-- Recriar políticas mais robustas que garantem acesso para usuários master
CREATE POLICY "Master and company users can select webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    -- Usuário master tem acesso total
    public.is_master_user() OR
    -- Usuário da empresa pode ver da sua empresa
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Master and company users can insert webhook integrations" ON public.webhook_integrations
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

CREATE POLICY "Master and company users can update webhook integrations" ON public.webhook_integrations
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

CREATE POLICY "Master and company users can delete webhook integrations" ON public.webhook_integrations
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

-- Verificar se as políticas estão ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'webhook_integrations';
