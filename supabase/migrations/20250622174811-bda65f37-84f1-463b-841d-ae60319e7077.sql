
-- Corrigir todas as políticas RLS que estão impedindo inserções

-- 1. Corrigir políticas para sql_connections
DROP POLICY IF EXISTS "Users can view SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can create SQL connections for their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can update SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can delete SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can view company sql connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can manage company sql connections" ON public.sql_connections;

-- Política unificada para sql_connections
CREATE POLICY "Users can manage sql_connections for their companies" ON public.sql_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_connections.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

-- 2. Corrigir políticas para sql_queries  
DROP POLICY IF EXISTS "Users can view company sql queries" ON public.sql_queries;
DROP POLICY IF EXISTS "Users can manage company sql queries" ON public.sql_queries;

-- Política unificada para sql_queries
CREATE POLICY "Users can manage sql_queries for their companies" ON public.sql_queries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_queries.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_queries.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

-- 3. Corrigir políticas para system_logs
DROP POLICY IF EXISTS "Allow authenticated users to insert system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can view system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can update system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can delete system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can manage system logs" ON public.system_logs;

-- Política permissiva para system_logs (logs devem ser sempre inseríveis)
CREATE POLICY "Allow all authenticated users to manage system_logs" ON public.system_logs
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Corrigir políticas para schedulings se necessário
DROP POLICY IF EXISTS "Users can view schedulings" ON public.schedulings;
DROP POLICY IF EXISTS "Users can manage schedulings" ON public.schedulings;

CREATE POLICY "Users can manage schedulings for their companies" ON public.schedulings
  FOR ALL USING (
    company_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = schedulings.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  )
  WITH CHECK (
    company_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = schedulings.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

-- 5. Garantir que todas as tabelas tenham RLS habilitado
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedulings ENABLE ROW LEVEL SECURITY;
