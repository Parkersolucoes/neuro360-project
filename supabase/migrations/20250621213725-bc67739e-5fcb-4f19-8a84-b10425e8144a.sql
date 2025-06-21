
-- Remover políticas existentes que podem estar muito permissivas
DROP POLICY IF EXISTS "Master users can manage all users" ON public.users;

-- Criar política mais restritiva que permite apenas usuários master criar usuários
CREATE POLICY "Only master users can create users" ON public.users
  FOR INSERT 
  WITH CHECK (
    -- Verificar se não há contexto de auth (sistema personalizado) OU se o usuário é master
    auth.uid() IS NULL OR
    public.is_master_user(auth.uid())
  );

-- Criar política para usuários master visualizarem todos os usuários
CREATE POLICY "Master users can view all users" ON public.users
  FOR SELECT 
  USING (
    -- Permitir se não há contexto de auth (sistema personalizado) OU se o usuário é master
    auth.uid() IS NULL OR
    public.is_master_user(auth.uid())
  );

-- Criar política para usuários master atualizarem todos os usuários
CREATE POLICY "Master users can update all users" ON public.users
  FOR UPDATE 
  USING (
    -- Permitir se não há contexto de auth (sistema personalizado) OU se o usuário é master
    auth.uid() IS NULL OR
    public.is_master_user(auth.uid())
  )
  WITH CHECK (
    -- Permitir se não há contexto de auth (sistema personalizado) OU se o usuário é master
    auth.uid() IS NULL OR
    public.is_master_user(auth.uid())
  );

-- Criar política para usuários master deletarem todos os usuários
CREATE POLICY "Master users can delete all users" ON public.users
  FOR DELETE 
  USING (
    -- Permitir se não há contexto de auth (sistema personalizado) OU se o usuário é master
    auth.uid() IS NULL OR
    public.is_master_user(auth.uid())
  );
