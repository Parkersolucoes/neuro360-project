
-- Remover todas as políticas existentes de forma mais específica
DROP POLICY IF EXISTS "Users can view company evolution configs" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can manage company evolution configs" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can view company templates" ON public.templates;
DROP POLICY IF EXISTS "Users can create templates for their companies" ON public.templates;
DROP POLICY IF EXISTS "Users can update their company templates" ON public.templates;
DROP POLICY IF EXISTS "Users can delete their company templates" ON public.templates;
DROP POLICY IF EXISTS "Allow all access to templates" ON public.templates;
DROP POLICY IF EXISTS "Allow all access to companies" ON public.companies;
DROP POLICY IF EXISTS "Allow all access to plans" ON public.plans;
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
DROP POLICY IF EXISTS "Allow all access to user_companies" ON public.user_companies;
DROP POLICY IF EXISTS "Allow all access to sql_connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Allow all access to sql_queries" ON public.sql_queries;
DROP POLICY IF EXISTS "Allow all access to qr_sessions" ON public.qr_sessions;
DROP POLICY IF EXISTS "Allow all access to message_templates" ON public.message_templates;
DROP POLICY IF EXISTS "Allow all access to schedulings" ON public.schedulings;
DROP POLICY IF EXISTS "Allow all access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow all access to query_executions" ON public.query_executions;

-- Remover políticas específicas que podem existir
DROP POLICY IF EXISTS "Master users can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admin and master users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin and master users can create users" ON public.users;
DROP POLICY IF EXISTS "Admin and master users can update users" ON public.users;
DROP POLICY IF EXISTS "Admin and master users can delete users" ON public.users;
DROP POLICY IF EXISTS "Users can view users from same company" ON public.users;
DROP POLICY IF EXISTS "Admin users can manage all user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can view their own companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can view their company associations" ON public.user_companies;
DROP POLICY IF EXISTS "Master users can manage all user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Master users can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
DROP POLICY IF EXISTS "Master users can manage plans" ON public.plans;
DROP POLICY IF EXISTS "Admin and master users can manage plans" ON public.plans;
DROP POLICY IF EXISTS "Users can view templates" ON public.templates;
DROP POLICY IF EXISTS "Users can create templates" ON public.templates;
DROP POLICY IF EXISTS "Users can update templates" ON public.templates;
DROP POLICY IF EXISTS "Users can delete templates" ON public.templates;
DROP POLICY IF EXISTS "Admin and master users can manage templates" ON public.templates;
DROP POLICY IF EXISTS "Users can view evolution configs" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can manage evolution configs" ON public.evolution_configs;
DROP POLICY IF EXISTS "Admin users can manage all evolution configs" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can view evolution configs from their companies" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can view sql connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can manage sql connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Admin users can manage all sql connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can view sql connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can view sql queries" ON public.sql_queries;
DROP POLICY IF EXISTS "Users can manage sql queries" ON public.sql_queries;
DROP POLICY IF EXISTS "Admin users can manage all sql queries" ON public.sql_queries;
DROP POLICY IF EXISTS "Users can view sql queries from their companies" ON public.sql_queries;
DROP POLICY IF EXISTS "Users can view qr sessions" ON public.qr_sessions;
DROP POLICY IF EXISTS "Users can manage qr sessions" ON public.qr_sessions;
DROP POLICY IF EXISTS "Users can view message templates" ON public.message_templates;
DROP POLICY IF EXISTS "Users can manage message templates" ON public.message_templates;
DROP POLICY IF EXISTS "Users can view schedulings" ON public.schedulings;
DROP POLICY IF EXISTS "Users can manage schedulings" ON public.schedulings;
DROP POLICY IF EXISTS "Users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Master users can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view query executions" ON public.query_executions;
DROP POLICY IF EXISTS "Users can create query executions" ON public.query_executions;
DROP POLICY IF EXISTS "Anyone can view public system configs" ON public.system_configs;
DROP POLICY IF EXISTS "Master users can manage system configs" ON public.system_configs;

-- Função para verificar se o usuário é master (is_admin = '0')
CREATE OR REPLACE FUNCTION public.is_master_user(user_uuid uuid DEFAULT auth.uid())
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

-- Função para verificar se o usuário tem acesso à empresa
CREATE OR REPLACE FUNCTION public.user_has_company_access(company_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_companies 
    WHERE company_id = company_uuid AND user_id = user_uuid
  ) OR public.is_master_user(user_uuid);
$$;

-- Políticas para tabela companies
CREATE POLICY "Users can view their companies" ON public.companies
  FOR SELECT USING (
    public.is_master_user() OR
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = companies.id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Master users can manage all companies" ON public.companies
  FOR ALL USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Políticas para tabela users
CREATE POLICY "Master users can manage all users" ON public.users
  FOR ALL USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Políticas para tabela user_companies
CREATE POLICY "Master users can manage all user companies" ON public.user_companies
  FOR ALL USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can view their company associations" ON public.user_companies
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_master_user()
  );

-- Políticas para tabela plans
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Master users can manage plans" ON public.plans
  FOR ALL USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Políticas para tabela templates
CREATE POLICY "Users can view templates" ON public.templates
  FOR SELECT USING (
    company_id IS NULL OR 
    public.user_has_company_access(company_id)
  );

CREATE POLICY "Users can create templates" ON public.templates
  FOR INSERT WITH CHECK (
    (company_id IS NULL AND public.is_master_user()) OR
    public.user_has_company_access(company_id)
  );

CREATE POLICY "Users can update templates" ON public.templates
  FOR UPDATE USING (
    (company_id IS NULL AND public.is_master_user()) OR
    public.user_has_company_access(company_id)
  );

CREATE POLICY "Users can delete templates" ON public.templates
  FOR DELETE USING (
    (company_id IS NULL AND public.is_master_user()) OR
    public.user_has_company_access(company_id)
  );

-- Políticas para tabela evolution_configs
CREATE POLICY "Users can view evolution configs" ON public.evolution_configs
  FOR SELECT USING (public.user_has_company_access(company_id));

CREATE POLICY "Users can manage evolution configs" ON public.evolution_configs
  FOR ALL USING (public.user_has_company_access(company_id))
  WITH CHECK (public.user_has_company_access(company_id));

-- Políticas para tabela sql_connections
CREATE POLICY "Users can view sql connections" ON public.sql_connections
  FOR SELECT USING (public.user_has_company_access(company_id));

CREATE POLICY "Users can manage sql connections" ON public.sql_connections
  FOR ALL USING (public.user_has_company_access(company_id))
  WITH CHECK (public.user_has_company_access(company_id));

-- Políticas para tabela sql_queries
CREATE POLICY "Users can view sql queries" ON public.sql_queries
  FOR SELECT USING (
    public.is_master_user() OR
    (company_id IS NOT NULL AND public.user_has_company_access(company_id))
  );

CREATE POLICY "Users can manage sql queries" ON public.sql_queries
  FOR ALL USING (
    public.is_master_user() OR
    (company_id IS NOT NULL AND public.user_has_company_access(company_id))
  )
  WITH CHECK (
    public.is_master_user() OR
    (company_id IS NOT NULL AND public.user_has_company_access(company_id))
  );

-- Políticas para tabela qr_sessions
CREATE POLICY "Users can view qr sessions" ON public.qr_sessions
  FOR SELECT USING (public.user_has_company_access(company_id));

CREATE POLICY "Users can manage qr sessions" ON public.qr_sessions
  FOR ALL USING (public.user_has_company_access(company_id))
  WITH CHECK (public.user_has_company_access(company_id));

-- Políticas para tabela message_templates
CREATE POLICY "Users can view message templates" ON public.message_templates
  FOR SELECT USING (
    company_id IS NULL OR 
    public.user_has_company_access(company_id)
  );

CREATE POLICY "Users can manage message templates" ON public.message_templates
  FOR ALL USING (
    (company_id IS NULL AND public.is_master_user()) OR
    public.user_has_company_access(company_id)
  )
  WITH CHECK (
    (company_id IS NULL AND public.is_master_user()) OR
    public.user_has_company_access(company_id)
  );

-- Políticas para tabela schedulings
CREATE POLICY "Users can view schedulings" ON public.schedulings
  FOR SELECT USING (
    public.is_master_user() OR
    (company_id IS NOT NULL AND public.user_has_company_access(company_id))
  );

CREATE POLICY "Users can manage schedulings" ON public.schedulings
  FOR ALL USING (
    public.is_master_user() OR
    (company_id IS NOT NULL AND public.user_has_company_access(company_id))
  )
  WITH CHECK (
    public.is_master_user() OR
    (company_id IS NOT NULL AND public.user_has_company_access(company_id))
  );

-- Políticas para tabela transactions
CREATE POLICY "Users can view transactions" ON public.transactions
  FOR SELECT USING (
    public.is_master_user() OR
    (company_id IS NOT NULL AND public.user_has_company_access(company_id))
  );

CREATE POLICY "Master users can manage transactions" ON public.transactions
  FOR ALL USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Políticas para tabela query_executions
CREATE POLICY "Users can view query executions" ON public.query_executions
  FOR SELECT USING (
    public.is_master_user() OR
    auth.uid() = user_id
  );

CREATE POLICY "Users can create query executions" ON public.query_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para tabela system_configs
CREATE POLICY "Anyone can view public system configs" ON public.system_configs
  FOR SELECT USING (is_public = true);

CREATE POLICY "Master users can manage system configs" ON public.system_configs
  FOR ALL USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sql_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedulings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
