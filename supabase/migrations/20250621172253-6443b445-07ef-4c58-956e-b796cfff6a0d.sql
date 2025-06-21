
-- Corrigir as políticas RLS para user_companies
DROP POLICY IF EXISTS "Admin users can view all user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Admin users can create user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Admin users can update user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Admin users can delete user companies" ON public.user_companies;

-- Criar políticas RLS mais permissivas para usuários admin
CREATE POLICY "Admin users can manage all user companies" 
  ON public.user_companies 
  FOR ALL 
  USING (public.is_admin_user_check())
  WITH CHECK (public.is_admin_user_check());

-- Política para usuários verem suas próprias associações
CREATE POLICY "Users can view their own companies" 
  ON public.user_companies 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Adicionar RLS às tabelas users se não existir
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para admin gerenciar todos os usuários
CREATE POLICY "Admin users can manage all users" 
  ON public.users 
  FOR ALL 
  USING (public.is_admin_user_check())
  WITH CHECK (public.is_admin_user_check());

-- Política para usuários verem apenas usuários da mesma empresa
CREATE POLICY "Users can view users from same company" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc1
      JOIN public.user_companies uc2 ON uc1.company_id = uc2.company_id
      WHERE uc1.user_id = auth.uid() AND uc2.user_id = public.users.id
    )
  );
