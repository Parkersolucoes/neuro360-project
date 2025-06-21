
-- Corrigir função is_master_user para funcionar com sistema de auth personalizado
CREATE OR REPLACE FUNCTION public.is_master_user(user_uuid uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- Se user_uuid for fornecido, usar ele diretamente
  -- Caso contrário, tentar usar auth.uid() (mas pode ser null no sistema personalizado)
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = COALESCE(user_uuid, auth.uid()) AND is_admin = '0'
  );
$$;

-- Atualizar política de usuários para permitir criação por usuários master
DROP POLICY IF EXISTS "Master users can manage all users" ON public.users;

CREATE POLICY "Master users can manage all users" ON public.users
  FOR ALL USING (
    -- Permitir se não há contexto de auth (para sistema personalizado)
    auth.uid() IS NULL OR
    -- Ou se o usuário logado é master
    public.is_master_user(auth.uid())
  )
  WITH CHECK (
    -- Permitir se não há contexto de auth (para sistema personalizado)  
    auth.uid() IS NULL OR
    -- Ou se o usuário logado é master
    public.is_master_user(auth.uid())
  );

-- Política alternativa mais permissiva para user_companies durante criação
DROP POLICY IF EXISTS "Master users can manage all user companies" ON public.user_companies;

CREATE POLICY "Master users can manage all user companies" ON public.user_companies
  FOR ALL USING (
    -- Permitir se não há contexto de auth (para sistema personalizado)
    auth.uid() IS NULL OR
    -- Ou se o usuário logado é master
    public.is_master_user(auth.uid())
  )
  WITH CHECK (
    -- Permitir se não há contexto de auth (para sistema personalizado)
    auth.uid() IS NULL OR
    -- Ou se o usuário logado é master
    public.is_master_user(auth.uid())
  );
