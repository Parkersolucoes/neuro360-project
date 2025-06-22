
-- Corrigir políticas RLS para sql_queries
DROP POLICY IF EXISTS "Users can view sql queries from their companies" ON public.sql_queries;
DROP POLICY IF EXISTS "Admin users can manage all sql queries" ON public.sql_queries;

-- Política para usuários verem consultas SQL de suas empresas
CREATE POLICY "Users can view company sql queries" ON public.sql_queries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_queries.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

-- Política para usuários gerenciarem consultas SQL de suas empresas
CREATE POLICY "Users can manage company sql queries" ON public.sql_queries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = sql_queries.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

-- Garantir que RLS está habilitado na tabela
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;
