
-- Criar tabela de templates
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'message',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento entre planos e templates
CREATE TABLE public.plan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, template_id)
);

-- Criar tabela de sessões QR
CREATE TABLE public.qr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  qr_code TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de conexões SQL
CREATE TABLE public.sql_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  connection_type TEXT NOT NULL DEFAULT 'postgresql',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de consultas SQL
CREATE TABLE public.sql_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.sql_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_text TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de assinatura/subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações financeiras
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'payment',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  payment_method TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações de webhook
CREATE TABLE public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  secret_token TEXT,
  events TEXT[] NOT NULL DEFAULT ARRAY['message'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações Evolution API
CREATE TABLE public.evolution_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações Assas
CREATE TABLE public.assas_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  wallet_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assas_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permissivas para permitir acesso sem autenticação por enquanto)
CREATE POLICY "Allow all access to templates" ON public.templates FOR ALL USING (true);
CREATE POLICY "Allow all access to plan_templates" ON public.plan_templates FOR ALL USING (true);
CREATE POLICY "Allow all access to qr_sessions" ON public.qr_sessions FOR ALL USING (true);
CREATE POLICY "Allow all access to sql_connections" ON public.sql_connections FOR ALL USING (true);
CREATE POLICY "Allow all access to sql_queries" ON public.sql_queries FOR ALL USING (true);
CREATE POLICY "Allow all access to subscriptions" ON public.subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all access to transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Allow all access to webhook_configs" ON public.webhook_configs FOR ALL USING (true);
CREATE POLICY "Allow all access to evolution_configs" ON public.evolution_configs FOR ALL USING (true);
CREATE POLICY "Allow all access to assas_configs" ON public.assas_configs FOR ALL USING (true);

-- Políticas RLS para tabelas existentes (permissivas)
DROP POLICY IF EXISTS "Allow all access to companies" ON public.companies;
DROP POLICY IF EXISTS "Allow all access to plans" ON public.plans;
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to system_configs" ON public.system_configs;
DROP POLICY IF EXISTS "Allow all access to system_updates" ON public.system_updates;
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;

CREATE POLICY "Allow all access to companies" ON public.companies FOR ALL USING (true);
CREATE POLICY "Allow all access to plans" ON public.plans FOR ALL USING (true);
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to system_configs" ON public.system_configs FOR ALL USING (true);
CREATE POLICY "Allow all access to system_updates" ON public.system_updates FOR ALL USING (true);
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true);

-- Inserir alguns dados de exemplo para templates
INSERT INTO public.templates (name, description, content, type) VALUES
('Boas-vindas', 'Mensagem de boas-vindas para novos clientes', 'Olá! Seja bem-vindo à nossa empresa. Como podemos ajudá-lo hoje?', 'welcome'),
('Follow-up', 'Mensagem de acompanhamento', 'Olá! Gostaria de saber como foi sua experiência com nossos serviços.', 'followup'),
('Promoção', 'Mensagem promocional', 'Aproveite nossa promoção especial! Desconto de 20% em todos os produtos.', 'message');
