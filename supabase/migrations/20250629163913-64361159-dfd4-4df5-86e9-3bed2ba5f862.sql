
-- Criar tabela sql_connections se não existir
CREATE TABLE IF NOT EXISTS public.sql_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  database_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 1433,
  connection_type TEXT NOT NULL DEFAULT 'sqlserver' CHECK (connection_type IN ('sqlserver', 'mysql', 'postgresql')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela sql_connections
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem e criar novas
DROP POLICY IF EXISTS "Users can view SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can create SQL connections for their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can update SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can delete SQL connections from their companies" ON public.sql_connections;

-- Criar políticas RLS para sql_connections
CREATE POLICY "Users can view SQL connections from their companies" 
  ON public.sql_connections 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can create SQL connections for their companies" 
  ON public.sql_connections 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can update SQL connections from their companies" 
  ON public.sql_connections 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can delete SQL connections from their companies" 
  ON public.sql_connections 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_sql_connections_company_id ON public.sql_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_sql_connections_status ON public.sql_connections(status);

-- Adicionar constraint de foreign key para companies se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'companies_plan_id_fkey'
    ) THEN
        ALTER TABLE public.companies 
        ADD CONSTRAINT companies_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;
    END IF;
END $$;
