
-- Criar tabela de relacionamento entre usuários e empresas (many-to-many)
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Habilitar RLS na tabela user_companies
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin_user_check(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND is_admin = true
  );
$$;

-- Política para usuários admin verem todas as associações
CREATE POLICY "Admin users can view all user companies" 
  ON public.user_companies 
  FOR SELECT 
  USING (public.is_admin_user_check());

-- Política para usuários admin criarem associações
CREATE POLICY "Admin users can create user companies" 
  ON public.user_companies 
  FOR INSERT 
  WITH CHECK (public.is_admin_user_check());

-- Política para usuários admin atualizarem associações
CREATE POLICY "Admin users can update user companies" 
  ON public.user_companies 
  FOR UPDATE 
  USING (public.is_admin_user_check());

-- Política para usuários admin deletarem associações
CREATE POLICY "Admin users can delete user companies" 
  ON public.user_companies 
  FOR DELETE 
  USING (public.is_admin_user_check());

-- Remover a coluna company_id da tabela users (não é mais necessária)
ALTER TABLE public.users DROP COLUMN IF EXISTS company_id;
