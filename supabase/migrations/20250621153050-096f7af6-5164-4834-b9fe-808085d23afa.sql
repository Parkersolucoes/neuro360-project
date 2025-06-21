
-- Limpar tabelas existentes (ordem importante devido às dependências)
DROP TABLE IF EXISTS public.test_user_companies CASCADE;
DROP TABLE IF EXISTS public.test_companies CASCADE;
DROP TABLE IF EXISTS public.webhook_configs CASCADE;
DROP TABLE IF EXISTS public.plan_templates CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.user_companies CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.system_updates CASCADE;
DROP TABLE IF EXISTS public.system_configs CASCADE;
DROP TABLE IF EXISTS public.qr_sessions CASCADE;
DROP TABLE IF EXISTS public.sql_queries CASCADE;
DROP TABLE IF EXISTS public.evolution_configs CASCADE;
DROP TABLE IF EXISTS public.assas_configs CASCADE;
DROP TABLE IF EXISTS public.sql_connections CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;

-- Remover funções existentes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_master_user(uuid) CASCADE;

-- Remover triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover políticas de storage existentes
DROP POLICY IF EXISTS "Anyone can view system assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload system assets" ON storage.objects;

-- Remover storage bucket se existir
DELETE FROM storage.buckets WHERE id = 'system-assets';

-- Criar tabela de planos
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_sql_connections INTEGER NOT NULL DEFAULT 1,
  max_sql_queries INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_master_user BOOLEAN NOT NULL DEFAULT false,
  is_test_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de usuários do sistema
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  department TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações do sistema
CREATE TABLE public.system_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL DEFAULT 'Visão 360 - Soluções em Dados',
  system_description TEXT DEFAULT 'Soluções de Análise dados para seu negócio',
  login_background_image TEXT,
  primary_color TEXT DEFAULT '#1e293b',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de atualizações do sistema
CREATE TABLE public.system_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar bucket de storage para assets do sistema
INSERT INTO storage.buckets (id, name, public) 
VALUES ('system-assets', 'system-assets', true);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- Políticas para plans (todos podem ver)
CREATE POLICY "Anyone can view active plans" 
  ON public.plans 
  FOR SELECT 
  USING (is_active = true);

-- Políticas para profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas para system_configs (todos podem ver)
CREATE POLICY "Anyone can view system configs" 
  ON public.system_configs 
  FOR SELECT 
  USING (true);

-- Políticas para system_updates (todos podem ver atualizações ativas)
CREATE POLICY "Anyone can view active system updates" 
  ON public.system_updates 
  FOR SELECT 
  USING (is_active = true);

-- Políticas para storage (todos podem ver assets)
CREATE POLICY "Anyone can view system assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-assets');

-- Função para criar profile automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, is_admin, is_test_user)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'name',
    NEW.email,
    'user',
    false,
    true
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para verificar se usuário é master
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

-- Inserir planos padrão
INSERT INTO public.plans (name, description, price, max_sql_connections, max_sql_queries) VALUES
('Básico', 'Plano básico para pequenas empresas', 29.90, 1, 10),
('Profissional', 'Plano profissional com mais recursos', 79.90, 5, 50),
('Empresarial', 'Plano empresarial com recursos ilimitados', 199.90, 20, 200);

-- Inserir configuração padrão do sistema
INSERT INTO public.system_configs (system_name, system_description, primary_color)
VALUES ('Visão 360 - Soluções em Dados', 'Soluções de Análise dados para seu negócio', '#1e293b');

-- Inserir algumas atualizações do sistema como exemplo
INSERT INTO public.system_updates (title, description, version) VALUES
('Sistema Atualizado', 'Nova interface de usuário mais moderna e intuitiva', 'v2.1.0'),
('Novas Funcionalidades', 'Adicionados novos relatórios e dashboards interativos', 'v2.0.5'),
('Melhorias de Performance', 'Otimizações no banco de dados e consultas mais rápidas', 'v2.0.3');

-- Criar empresa master
INSERT INTO public.companies (name, document, email, phone, address, plan_id) 
SELECT 'Parker Soluções', '12.345.678/0001-90', 'contato@parkersolucoes.com.br', '(11) 3333-4444', 'Rua Demo, 123', id 
FROM public.plans WHERE name = 'Empresarial' LIMIT 1;

-- Criar usuário master na tabela users
INSERT INTO public.users (
  name,
  email,
  phone,
  whatsapp,
  role,
  department,
  company_id,
  is_admin,
  status
) SELECT 
  'Master User - Parker Soluções',
  'contato@parkersolucoes.com.br',
  '(11) 99999-9999',
  '5511999999999',
  'admin',
  'Administração',
  id,
  true,
  'active'
FROM public.companies WHERE email = 'contato@parkersolucoes.com.br';
