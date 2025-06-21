
-- Criar usuário master diretamente na tabela auth.users (isso deve ser feito via Supabase Dashboard)
-- Mas vamos criar a estrutura para identificar usuários master

-- Adicionar campo is_master_user na tabela profiles
ALTER TABLE public.profiles ADD COLUMN is_master_user boolean NOT NULL DEFAULT false;

-- Criar função para verificar se usuário é master
CREATE OR REPLACE FUNCTION public.is_master_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND is_master_user = true
  );
$$;

-- Atualizar políticas de admin para incluir usuários master
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can create users" ON public.users;
DROP POLICY IF EXISTS "Admin users can update users" ON public.users;
DROP POLICY IF EXISTS "Admin users can delete users" ON public.users;

-- Recriar políticas com acesso para master users
CREATE POLICY "Admin and master users can view all users" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR public.is_master_user()
  );

CREATE POLICY "Admin and master users can create users" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR public.is_master_user()
  );

CREATE POLICY "Admin and master users can update users" 
  ON public.users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR public.is_master_user()
  );

CREATE POLICY "Admin and master users can delete users" 
  ON public.users 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR public.is_master_user()
  );

-- Atualizar políticas para planos
DROP POLICY IF EXISTS "Admin users can manage plans" ON public.plans;

CREATE POLICY "Admin and master users can manage plans" 
  ON public.plans 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR public.is_master_user()
  );

-- Atualizar políticas para templates
DROP POLICY IF EXISTS "Admin users can manage templates" ON public.templates;

CREATE POLICY "Admin and master users can manage templates" 
  ON public.templates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR public.is_master_user()
  );

-- Atualizar políticas para plan_templates
DROP POLICY IF EXISTS "Admin users can manage plan templates" ON public.plan_templates;

CREATE POLICY "Admin and master users can manage plan templates" 
  ON public.plan_templates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR public.is_master_user()
  );

-- Atualizar função is_admin_user para incluir master users
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid AND (is_admin = true OR is_master_user = true)
  ) OR EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND is_active = true
  );
$$;
