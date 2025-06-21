
-- Adicionar RLS para sql_connections para filtrar por empresa
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;

-- Política para admin gerenciar todas as conexões SQL
CREATE POLICY "Admin users can manage all sql connections" 
  ON public.sql_connections 
  FOR ALL 
  USING (public.is_admin_user_check())
  WITH CHECK (public.is_admin_user_check());

-- Política para usuários verem apenas conexões das suas empresas
CREATE POLICY "Users can view sql connections from their companies" 
  ON public.sql_connections 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc
      WHERE uc.user_id = auth.uid() AND uc.company_id = public.sql_connections.company_id
    )
  );

-- Adicionar RLS para sql_queries para filtrar por empresa (através da conexão)
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;

-- Política para admin gerenciar todas as consultas SQL
CREATE POLICY "Admin users can manage all sql queries" 
  ON public.sql_queries 
  FOR ALL 
  USING (public.is_admin_user_check())
  WITH CHECK (public.is_admin_user_check());

-- Política para usuários verem apenas consultas das suas empresas
CREATE POLICY "Users can view sql queries from their companies" 
  ON public.sql_queries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc
      JOIN public.sql_connections sc ON uc.company_id = sc.company_id
      WHERE uc.user_id = auth.uid() AND sc.id = public.sql_queries.connection_id
    )
  );

-- Adicionar RLS para evolution_configs
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;

-- Política para admin gerenciar todas as configurações Evolution
CREATE POLICY "Admin users can manage all evolution configs" 
  ON public.evolution_configs 
  FOR ALL 
  USING (public.is_admin_user_check())
  WITH CHECK (public.is_admin_user_check());

-- Política para usuários verem apenas configurações das suas empresas
CREATE POLICY "Users can view evolution configs from their companies" 
  ON public.evolution_configs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc
      WHERE uc.user_id = auth.uid() AND uc.company_id = public.evolution_configs.company_id
    )
  );
