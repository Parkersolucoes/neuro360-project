
-- Criar tabela para conexões SQL Server
CREATE TABLE public.sql_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  server TEXT NOT NULL,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  port TEXT NOT NULL DEFAULT '1433',
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações Evolution API
CREATE TABLE public.evolution_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para consultas SQL
CREATE TABLE public.sql_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.sql_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query_text TEXT NOT NULL,
  last_execution TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'error', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para sessões QR Code
CREATE TABLE public.qr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  evolution_config_id UUID REFERENCES public.evolution_configs(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  qr_code_data TEXT,
  session_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (session_status IN ('connected', 'waiting', 'disconnected')),
  connected_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sql_connections
CREATE POLICY "Users can view their own SQL connections" 
  ON public.sql_connections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SQL connections" 
  ON public.sql_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SQL connections" 
  ON public.sql_connections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SQL connections" 
  ON public.sql_connections 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para evolution_configs
CREATE POLICY "Users can view their own Evolution configs" 
  ON public.evolution_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Evolution configs" 
  ON public.evolution_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Evolution configs" 
  ON public.evolution_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Evolution configs" 
  ON public.evolution_configs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para sql_queries
CREATE POLICY "Users can view their own SQL queries" 
  ON public.sql_queries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SQL queries" 
  ON public.sql_queries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SQL queries" 
  ON public.sql_queries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SQL queries" 
  ON public.sql_queries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para qr_sessions
CREATE POLICY "Users can view their own QR sessions" 
  ON public.qr_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR sessions" 
  ON public.qr_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR sessions" 
  ON public.qr_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR sessions" 
  ON public.qr_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_sql_connections_user_id ON public.sql_connections(user_id);
CREATE INDEX idx_evolution_configs_user_id ON public.evolution_configs(user_id);
CREATE INDEX idx_sql_queries_user_id ON public.sql_queries(user_id);
CREATE INDEX idx_sql_queries_connection_id ON public.sql_queries(connection_id);
CREATE INDEX idx_qr_sessions_user_id ON public.qr_sessions(user_id);
CREATE INDEX idx_qr_sessions_evolution_config_id ON public.qr_sessions(evolution_config_id);
