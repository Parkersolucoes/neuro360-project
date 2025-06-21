
-- Primeiro, remover todas as tabelas existentes em ordem para evitar problemas de dependências
DROP TABLE IF EXISTS public.webhook_configs CASCADE;
DROP TABLE IF EXISTS public.user_companies CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.system_updates CASCADE;
DROP TABLE IF EXISTS public.system_configs CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.sql_queries CASCADE;
DROP TABLE IF EXISTS public.sql_connections CASCADE;
DROP TABLE IF EXISTS public.qr_sessions CASCADE;
DROP TABLE IF EXISTS public.plan_templates CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.evolution_configs CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.assas_configs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Remover funções e triggers
DROP FUNCTION IF EXISTS public.ensure_single_master() CASCADE;
DROP FUNCTION IF EXISTS public.is_master_user_check(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user_check(uuid) CASCADE;

-- Recriar tabela de planos
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  max_sql_queries INTEGER NOT NULL DEFAULT 10,
  max_sql_connections INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  plan_id UUID REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de usuários
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  department TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_master BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recriar tabela de relacionamento usuário-empresa
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

-- Função para garantir apenas um usuário master
CREATE OR REPLACE FUNCTION public.ensure_single_master()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_master = true THEN
    UPDATE public.users 
    SET is_master = false 
    WHERE id != NEW.id AND is_master = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas um master
CREATE TRIGGER trigger_ensure_single_master
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_master();

-- Função para verificar se usuário é master
CREATE OR REPLACE FUNCTION public.is_master_user_check(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND is_master = true
  );
$$;

-- Habilitar RLS nas tabelas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Políticas para planos (master pode gerenciar todos)
CREATE POLICY "Master users can manage all plans" 
  ON public.plans 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Políticas para empresas (master pode gerenciar todas)
CREATE POLICY "Master users can manage all companies" 
  ON public.companies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Políticas para usuários (master pode gerenciar todos)
CREATE POLICY "Master users can manage all users" 
  ON public.users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Políticas para user_companies (master pode gerenciar todas as associações)
CREATE POLICY "Master users can manage all user companies" 
  ON public.user_companies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Criar plano básico
INSERT INTO public.plans (
  name,
  description,
  price,
  max_sql_queries,
  max_sql_connections,
  is_active
) VALUES (
  'Plano Básico',
  'Plano básico para gerenciamento de dados',
  0,
  100,
  5,
  true
);

-- Criar empresa Visão 360
INSERT INTO public.companies (
  name,
  document,
  email,
  phone,
  address,
  plan_id,
  status
) VALUES (
  'Visão 360',
  '12.345.678/0001-90',
  'contato@visao360.com.br',
  '(11) 3333-4444',
  'Rua das Empresas, 123 - São Paulo, SP',
  (SELECT id FROM public.plans WHERE name = 'Plano Básico' LIMIT 1),
  'active'
);

-- Criar usuário master
INSERT INTO public.users (
  name,
  email,
  phone,
  whatsapp,
  role,
  department,
  is_admin,
  is_master,
  status
) VALUES (
  'Administrador Master - Visão 360',
  'admin@visao360.com.br',
  '(11) 99999-9999',
  '5511999999999',
  'master',
  'Administração',
  true,
  true,
  'active'
);

-- Associar usuário master à empresa Visão 360
INSERT INTO public.user_companies (
  user_id,
  company_id,
  role,
  is_primary
) VALUES (
  (SELECT id FROM public.users WHERE email = 'admin@visao360.com.br' LIMIT 1),
  (SELECT id FROM public.companies WHERE name = 'Visão 360' LIMIT 1),
  'admin',
  true
);
