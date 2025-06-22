
-- Corrigir todas as políticas RLS do banco de dados

-- 1. PLANOS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all plans" ON public.plans;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;

CREATE POLICY "Master users have full access to plans" ON public.plans
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can view all plans" ON public.plans
  FOR SELECT 
  USING (true);

-- 2. EMPRESAS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all data" ON public.companies;
DROP POLICY IF EXISTS "Master users can manage all companies" ON public.companies;

CREATE POLICY "Master users have full access to companies" ON public.companies
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access their companies" ON public.companies
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = companies.id
    )
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.user_id = auth.uid() 
      AND user_companies.company_id = companies.id
    )
  );

-- 3. USUÁRIOS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all users" ON public.users;

CREATE POLICY "Master users have full access to users" ON public.users
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. USER_COMPANIES - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all user_companies" ON public.user_companies;
DROP POLICY IF EXISTS "Master users can manage all user companies" ON public.user_companies;

CREATE POLICY "Master users have full access to user_companies" ON public.user_companies
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access their company relationships" ON public.user_companies
  FOR ALL 
  USING (
    NOT public.is_master_user() AND
    auth.uid() = user_id
  )
  WITH CHECK (
    NOT public.is_master_user() AND
    auth.uid() = user_id
  );

-- 5. SYSTEM_CONFIGS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all system_configs" ON public.system_configs;

CREATE POLICY "Master users have full access to system_configs" ON public.system_configs
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access their company configs" ON public.system_configs
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

-- 6. SCHEDULINGS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all schedulings" ON public.schedulings;

CREATE POLICY "Master users have full access to schedulings" ON public.schedulings
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access their company schedulings" ON public.schedulings
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

-- 7. SYSTEM_UPDATES - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all system_updates" ON public.system_updates;

CREATE POLICY "Master users have full access to system_updates" ON public.system_updates
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access their company updates" ON public.system_updates
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

-- 8. TRANSACTIONS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all transactions" ON public.transactions;

CREATE POLICY "Master users have full access to transactions" ON public.transactions
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access their company transactions" ON public.transactions
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

-- 9. SMTP_CONFIGS - Corrigir políticas RLS
DROP POLICY IF EXISTS "Master users can manage all smtp_configs" ON public.smtp_configs;

CREATE POLICY "Master users have full access to smtp_configs" ON public.smtp_configs
  FOR ALL 
  USING (public.is_master_user())
  WITH CHECK (public.is_master_user());

CREATE POLICY "Users can access their company smtp configs" ON public.smtp_configs
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

-- CORRIGIR O PROBLEMA DOS PLANOS - Remover referências primeiro
-- Primeiro, remover as referências de planos das empresas
UPDATE public.companies SET plan_id = NULL;

-- Depois, remover planos existentes
DELETE FROM public.plans;

-- Inserir 5 novos modelos de planos
INSERT INTO public.plans (name, description, price, max_sql_queries, max_sql_connections, is_active) VALUES
('Starter', 'Plano inicial para pequenos negócios e freelancers', 19.90, 25, 1, true),
('Basic', 'Plano básico para pequenas empresas', 49.90, 100, 3, true),
('Professional', 'Plano profissional para empresas em crescimento', 99.90, 500, 10, true),
('Business', 'Plano empresarial com recursos avançados', 199.90, 2000, 25, true),
('Enterprise', 'Plano corporativo com recursos ilimitados', 399.90, -1, -1, true);

-- Atualizar a empresa Neuro360 para usar o plano Enterprise
UPDATE public.companies 
SET plan_id = (SELECT id FROM public.plans WHERE name = 'Enterprise' LIMIT 1)
WHERE name = 'Neuro360';
