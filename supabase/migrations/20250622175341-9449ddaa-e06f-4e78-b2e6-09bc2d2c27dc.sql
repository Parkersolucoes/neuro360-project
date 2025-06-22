
-- Corrigir políticas RLS para sql_connections
DROP POLICY IF EXISTS "Master users can manage all sql_connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can manage sql_connections for their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can view SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can create SQL connections for their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can update SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can delete SQL connections from their companies" ON public.sql_connections;

-- Criar política permissiva para usuários master (acesso total)
CREATE POLICY "Master users have full access to sql_connections" ON public.sql_connections
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Criar política para usuários comuns (apenas suas empresas)
CREATE POLICY "Users can access sql_connections from their companies" ON public.sql_connections
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = sql_connections.company_id
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = sql_connections.company_id
    )
  );

-- Corrigir políticas RLS para sql_queries também
DROP POLICY IF EXISTS "Master users can manage all sql_queries" ON public.sql_queries;
DROP POLICY IF EXISTS "Users can manage sql_queries for their companies" ON public.sql_queries;

-- Criar política permissiva para usuários master (acesso total)
CREATE POLICY "Master users have full access to sql_queries" ON public.sql_queries
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Criar política para usuários comuns (apenas suas empresas)
CREATE POLICY "Users can access sql_queries from their companies" ON public.sql_queries
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = sql_queries.company_id
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = sql_queries.company_id
    )
  );
