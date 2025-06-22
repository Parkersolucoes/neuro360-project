
-- Primeiro, vamos verificar e corrigir a função is_master_user para garantir que funcione corretamente
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

-- Remover todas as políticas existentes da tabela webhook_integrations
DROP POLICY IF EXISTS "Master and company users can select webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Master and company users can insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Master and company users can update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Master and company users can delete webhook integrations" ON public.webhook_integrations;

-- Criar políticas mais simples e diretas que garantem acesso para usuários master
CREATE POLICY "Allow master users full access to webhook integrations" ON public.webhook_integrations
  FOR ALL USING (
    public.is_master_user() = true
  )
  WITH CHECK (
    public.is_master_user() = true
  );

-- Política adicional para usuários da empresa (não master)
CREATE POLICY "Allow company users access to their webhook integrations" ON public.webhook_integrations
  FOR ALL USING (
    public.is_master_user() = false AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_master_user() = false AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'webhook_integrations';

-- Verificar se a função is_master_user funciona corretamente
SELECT public.is_master_user() as is_current_user_master;
