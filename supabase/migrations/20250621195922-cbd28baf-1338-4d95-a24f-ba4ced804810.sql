
-- Remover todas as tabelas existentes em ordem para evitar problemas de dependências
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
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.query_executions CASCADE;
DROP TABLE IF EXISTS public.schedulings CASCADE;
DROP TABLE IF EXISTS public.message_templates CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

-- Remover funções e triggers existentes
DROP FUNCTION IF EXISTS public.ensure_single_master() CASCADE;
DROP FUNCTION IF EXISTS public.is_master_user_check(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user_check(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.validate_user_password(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_master_user(uuid) CASCADE;

-- Instalar extensão para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Criar tabela de planos
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

-- 2. Criar tabela de empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  plan_id UUID REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela de usuários
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  department TEXT NOT NULL,
  is_admin TEXT NOT NULL DEFAULT '1', -- '0' = master, '1' = usuário comum
  status TEXT NOT NULL DEFAULT 'active',
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela de relacionamento usuário-empresa
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

-- 5. Criar tabela de configurações do sistema
CREATE TABLE public.system_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Criar tabela de conexões SQL
CREATE TABLE public.sql_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  connection_type TEXT NOT NULL DEFAULT 'postgresql',
  status TEXT NOT NULL DEFAULT 'active',
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Criar tabela de consultas SQL
CREATE TABLE public.sql_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  query_text TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  user_id UUID REFERENCES public.users(id),
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Criar tabela de execuções de consultas
CREATE TABLE public.query_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_id UUID REFERENCES public.sql_queries(id),
  connection_id UUID REFERENCES public.sql_connections(id),
  user_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  result_data JSONB,
  error_message TEXT,
  execution_time INTEGER,
  rows_affected INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Criar tabela de templates de mensagem
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  variables JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active',
  company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Criar tabela de agendamentos
CREATE TABLE public.schedulings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message_content TEXT NOT NULL,
  recipients JSONB NOT NULL DEFAULT '[]',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  template_id UUID REFERENCES public.message_templates(id),
  user_id UUID REFERENCES public.users(id),
  company_id UUID REFERENCES public.companies(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Criar tabela de sessões QR
CREATE TABLE public.qr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  qr_code TEXT,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  instance_data JSONB,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 12. Criar tabela de configurações da Evolution API
CREATE TABLE public.evolution_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_name TEXT NOT NULL,
  api_url TEXT NOT NULL DEFAULT 'https://api.evolution.com',
  api_key TEXT NOT NULL,
  webhook_url TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 13. Criar tabela de transações
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  external_id TEXT,
  company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES public.users(id),
  plan_id UUID REFERENCES public.plans(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para usuários master
CREATE POLICY "Master users can manage all data" 
  ON public.companies 
  FOR ALL 
  USING (true);

CREATE POLICY "Master users can manage all users" 
  ON public.users 
  FOR ALL 
  USING (true);

CREATE POLICY "Master users can manage all plans" 
  ON public.plans 
  FOR ALL 
  USING (true);

CREATE POLICY "Master users can manage all user_companies" 
  ON public.user_companies 
  FOR ALL 
  USING (true);

-- Função para validar senha
CREATE OR REPLACE FUNCTION public.validate_user_password(user_email TEXT, user_password TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  is_admin TEXT,
  is_master BOOLEAN,
  status TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.role, 
    u.is_admin,
    (u.is_admin = '0') as is_master,
    u.status
  FROM public.users u
  WHERE u.email = user_email 
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.status = 'active';
$$;

-- Função para verificar se usuário é master
CREATE OR REPLACE FUNCTION public.is_master_user_check(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND is_admin = '0'
  );
$$;

-- Inserir planos do sistema
INSERT INTO public.plans (name, description, price, max_sql_queries, max_sql_connections, is_active) VALUES
('Plano Básico', 'Plano básico para pequenas empresas com funcionalidades essenciais', 29.90, 50, 2, true),
('Plano Profissional', 'Plano profissional com recursos avançados para empresas em crescimento', 79.90, 200, 5, true),
('Plano Empresarial', 'Plano empresarial com recursos completos para grandes organizações', 199.90, 1000, 20, true),
('Plano Enterprise', 'Plano customizado para grandes corporações com suporte dedicado', 499.90, -1, -1, true);

-- Inserir empresa padrão Visão 360
INSERT INTO public.companies (
  id,
  name,
  document,
  email,
  phone,
  address,
  plan_id,
  status
) VALUES (
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea',
  'Visão 360 - Soluções em Dados',
  '12.345.678/0001-90',
  'contato@visao360.com.br',
  '(11) 3333-4444',
  'Rua das Soluções, 360 - São Paulo, SP - CEP: 01234-567',
  (SELECT id FROM public.plans WHERE name = 'Plano Enterprise' LIMIT 1),
  'active'
);

-- Inserir usuário administrador master
INSERT INTO public.users (
  name,
  email,
  phone,
  whatsapp,
  role,
  department,
  is_admin,
  status,
  password_hash
) VALUES (
  'Administrador Master - Visão 360',
  'admin@visao360.com.br',
  '(11) 99999-9999',
  '5511999999999',
  'admin',
  'Administração',
  '0', -- Master user
  'active',
  crypt('123456', gen_salt('bf'))
);

-- Associar usuário master à empresa Visão 360
INSERT INTO public.user_companies (
  user_id,
  company_id,
  role,
  is_primary
) VALUES (
  (SELECT id FROM public.users WHERE email = 'admin@visao360.com.br' LIMIT 1),
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea',
  'admin',
  true
);

-- Inserir configuração padrão do sistema
INSERT INTO public.system_configs (
  config_key,
  config_value,
  description,
  is_public
) VALUES (
  'system_appearance',
  '{"system_name": "Visão 360 - Soluções em Dados", "system_description": "Plataforma completa para análise e gestão de dados empresariais", "primary_color": "#1e293b", "login_background_image": ""}',
  'Configurações de aparência do sistema',
  true
);

-- Inserir alguns templates de exemplo
INSERT INTO public.message_templates (
  name,
  content,
  category,
  variables,
  status,
  company_id,
  user_id
) VALUES (
  'Boas-vindas',
  'Olá {{nome}}, seja bem-vindo(a) à {{empresa}}! Estamos felizes em tê-lo(a) conosco.',
  'boas-vindas',
  '["nome", "empresa"]',
  'active',
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea',
  (SELECT id FROM public.users WHERE email = 'admin@visao360.com.br' LIMIT 1)
),
(
  'Lembrete de Reunião',
  'Lembrete: Você tem uma reunião agendada para {{data}} às {{hora}}. Local: {{local}}',
  'lembrete',
  '["data", "hora", "local"]',
  'active',
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea',
  (SELECT id FROM public.users WHERE email = 'admin@visao360.com.br' LIMIT 1)
);
