
-- Criar tabela para configurações de Evolution API
CREATE TABLE IF NOT EXISTS public.evolution_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  api_url TEXT NOT NULL DEFAULT 'https://api.evolution.com',
  api_key TEXT NOT NULL,
  webhook_url TEXT,
  instance_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, instance_name)
);

-- Criar tabela para consultas SQL
CREATE TABLE IF NOT EXISTS public.sql_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query_text TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para conexões SQL
CREATE TABLE IF NOT EXISTS public.sql_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 5432,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  connection_type TEXT NOT NULL DEFAULT 'postgresql' CHECK (connection_type IN ('postgresql', 'mysql', 'sqlserver')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para execuções de consultas
CREATE TABLE IF NOT EXISTS public.query_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_id UUID REFERENCES public.sql_queries(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.sql_connections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  execution_time INTEGER, -- em milissegundos
  rows_affected INTEGER,
  result_data JSONB,
  error_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para sessões QR Code
CREATE TABLE IF NOT EXISTS public.qr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'qr_ready', 'loading')),
  phone_number TEXT,
  instance_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, session_name)
);

-- Criar tabela para templates de mensagem
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para agendamentos
CREATE TABLE IF NOT EXISTS public.schedulings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  message_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para transações financeiras
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'subscription')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT,
  external_id TEXT, -- ID do gateway de pagamento
  description TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para assinaturas de usuários
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedulings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas (usuários podem ver dados de suas empresas)
CREATE POLICY "Users can view company evolution configs" ON public.evolution_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company evolution configs" ON public.evolution_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );

-- Aplicar políticas similares para todas as tabelas relacionadas a empresas
CREATE POLICY "Users can view company sql queries" ON public.sql_queries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_queries.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company sql queries" ON public.sql_queries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_queries.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view company sql connections" ON public.sql_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company sql connections" ON public.sql_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can view query executions" ON public.query_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sql_queries sq
      JOIN public.user_companies uc ON sq.company_id = uc.company_id
      WHERE sq.id = query_executions.query_id 
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create query executions" ON public.query_executions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view company qr sessions" ON public.qr_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = qr_sessions.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company qr sessions" ON public.qr_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = qr_sessions.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view company templates" ON public.message_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = message_templates.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company templates" ON public.message_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = message_templates.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view company schedulings" ON public.schedulings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = schedulings.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company schedulings" ON public.schedulings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = schedulings.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view company transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = transactions.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage transactions" ON public.transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = transactions.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role = 'admin'
    )
  );

CREATE POLICY "Users can view company subscriptions" ON public.user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = user_subscriptions.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = user_subscriptions.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role = 'admin'
    )
  );

-- Sistema de configurações - apenas admins do sistema
CREATE POLICY "System admins can view configs" ON public.system_configs
  FOR SELECT USING (
    is_public = true OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = '0'
    )
  );

CREATE POLICY "System admins can manage configs" ON public.system_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = '0'
    )
  );

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_evolution_configs_company_id ON public.evolution_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_sql_queries_company_id ON public.sql_queries(company_id);
CREATE INDEX IF NOT EXISTS idx_sql_queries_user_id ON public.sql_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_sql_connections_company_id ON public.sql_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_query_executions_query_id ON public.query_executions(query_id);
CREATE INDEX IF NOT EXISTS idx_query_executions_user_id ON public.query_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_company_id ON public.qr_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_company_id ON public.message_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_schedulings_company_id ON public.schedulings(company_id);
CREATE INDEX IF NOT EXISTS idx_schedulings_scheduled_for ON public.schedulings(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON public.transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_company_id ON public.user_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON public.user_subscriptions(expires_at);
