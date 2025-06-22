
-- 1. Primeiro, vamos temporariamente desabilitar RLS na tabela webhook_integrations
ALTER TABLE public.webhook_integrations DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow master users full access to webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Allow company users access to their webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can view company webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can manage company webhook integrations" ON public.webhook_integrations;

-- 3. Reabilitar RLS com políticas mais simples
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- 4. Criar uma política super simples que permite tudo para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON public.webhook_integrations
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Verificar se a tabela está funcionando corretamente
SELECT COUNT(*) as total_records FROM public.webhook_integrations;

-- 6. Verificar as políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'webhook_integrations';
