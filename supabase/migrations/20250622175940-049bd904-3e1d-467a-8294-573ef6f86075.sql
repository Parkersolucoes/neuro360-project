
-- Corrigir e reorganizar todas as políticas RLS do banco de dados

-- 1. COMPANIES - Corrigir políticas para permitir cadastro
DROP POLICY IF EXISTS "Master users have full access to companies" ON public.companies;
DROP POLICY IF EXISTS "Users can access their companies" ON public.companies;

-- Política para usuários master (acesso total)
CREATE POLICY "Master users can manage all companies" ON public.companies
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

-- Política para usuários comuns verem suas empresas
CREATE POLICY "Users can view their companies" ON public.companies
  FOR SELECT 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = companies.id
    )
  );

-- 2. USERS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Admin users can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view users from same company" ON public.users;

-- Políticas para usuários
CREATE POLICY "Master users can manage all users" ON public.users
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. USER_COMPANIES - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to user_companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can access their company relationships" ON public.user_companies;
DROP POLICY IF EXISTS "Admin users can manage all user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can view their own companies" ON public.user_companies;

-- Políticas para user_companies
CREATE POLICY "Master users can manage all user_companies" ON public.user_companies
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can view their associations" ON public.user_companies
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 4. PLANS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to plans" ON public.plans;
DROP POLICY IF EXISTS "Users can view all plans" ON public.plans;

CREATE POLICY "Master users can manage plans" ON public.plans
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "All users can view plans" ON public.plans
  FOR SELECT 
  USING (true);

-- 5. SQL_CONNECTIONS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to sql_connections" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can access sql_connections from their companies" ON public.sql_connections;

CREATE POLICY "Master users can manage sql_connections" ON public.sql_connections
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can manage company sql_connections" ON public.sql_connections
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

-- 6. SQL_QUERIES - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to sql_queries" ON public.sql_queries;
DROP POLICY IF EXISTS "Users can access sql_queries from their companies" ON public.sql_queries;

CREATE POLICY "Master users can manage sql_queries" ON public.sql_queries
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can manage company sql_queries" ON public.sql_queries
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

-- 7. SYSTEM_CONFIGS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to system_configs" ON public.system_configs;
DROP POLICY IF EXISTS "Users can access their company configs" ON public.system_configs;

CREATE POLICY "Master users can manage system_configs" ON public.system_configs
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access company configs" ON public.system_configs
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = system_configs.company_id
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = system_configs.company_id
    )
  );

-- 8. SCHEDULINGS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to schedulings" ON public.schedulings;
DROP POLICY IF EXISTS "Users can access their company schedulings" ON public.schedulings;

CREATE POLICY "Master users can manage schedulings" ON public.schedulings
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can manage company schedulings" ON public.schedulings
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = schedulings.company_id
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = schedulings.company_id
    )
  );

-- 9. SYSTEM_UPDATES - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to system_updates" ON public.system_updates;
DROP POLICY IF EXISTS "Users can access their company updates" ON public.system_updates;

CREATE POLICY "Master users can manage system_updates" ON public.system_updates
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can manage company updates" ON public.system_updates
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = system_updates.company_id
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = system_updates.company_id
    )
  );

-- 10. TRANSACTIONS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can access their company transactions" ON public.transactions;

CREATE POLICY "Master users can manage transactions" ON public.transactions
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can manage company transactions" ON public.transactions
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM public.user_companies 
        WHERE user_companies.user_id = auth.uid() 
        AND user_companies.company_id = transactions.company_id
      )
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM public.user_companies 
        WHERE user_companies.user_id = auth.uid() 
        AND user_companies.company_id = transactions.company_id
      )
    )
  );

-- 11. SMTP_CONFIGS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users have full access to smtp_configs" ON public.smtp_configs;
DROP POLICY IF EXISTS "Users can access their company smtp configs" ON public.smtp_configs;

CREATE POLICY "Master users can manage smtp_configs" ON public.smtp_configs
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can manage company smtp_configs" ON public.smtp_configs
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = smtp_configs.company_id
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = smtp_configs.company_id
    )
  );

-- 12. SYSTEM_LOGS - Manter política permissiva existente
-- Esta tabela precisa ser acessível para logs do sistema
-- Já está configurada corretamente
