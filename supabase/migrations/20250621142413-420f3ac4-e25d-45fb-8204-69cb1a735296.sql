
-- Criar tabela para usuários administradores
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  master_password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy para administradores poderem ver seus próprios registros
CREATE POLICY "Admin users can view their own records" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy para inserir administradores (apenas para usuários autenticados)
CREATE POLICY "Authenticated users can become admin" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Remover RLS da tabela plans para permitir acesso aos administradores
DROP POLICY IF EXISTS "Users can view plans" ON public.plans;
DROP POLICY IF EXISTS "Users can create plans" ON public.plans;
DROP POLICY IF EXISTS "Users can update plans" ON public.plans;
DROP POLICY IF EXISTS "Users can delete plans" ON public.plans;

-- Criar policies mais permissivas para plans
CREATE POLICY "Anyone can view active plans" 
  ON public.plans 
  FOR SELECT 
  USING (is_active = true);

-- Policy para administradores gerenciarem planos
CREATE POLICY "Admin users can manage plans" 
  ON public.plans 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid AND is_active = true
  );
$$;
