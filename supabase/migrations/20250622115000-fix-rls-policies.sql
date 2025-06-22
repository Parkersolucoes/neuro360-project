
-- Corrigir políticas RLS para sql_connections
DROP POLICY IF EXISTS "Users can view company sql connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can manage company sql connections" ON public.sql_connections;

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

-- Corrigir políticas RLS para system_logs
DROP POLICY IF EXISTS "Users can view system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can manage system logs" ON public.system_logs;

CREATE POLICY "Users can view system logs" ON public.system_logs
  FOR SELECT USING (true);

CREATE POLICY "Users can manage system logs" ON public.system_logs
  FOR INSERT WITH CHECK (true);

-- Garantir que RLS está habilitado nas tabelas
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
