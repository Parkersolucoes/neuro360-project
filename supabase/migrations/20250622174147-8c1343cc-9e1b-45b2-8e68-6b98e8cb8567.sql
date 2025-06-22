
-- Corrigir os erros removendo todas as políticas conflitantes primeiro
-- e depois recriando-as corretamente

-- Remover todas as políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can view company query executions" ON public.query_executions;
DROP POLICY IF EXISTS "Users can manage query executions" ON public.query_executions;
DROP POLICY IF EXISTS "Users can view company schedulings" ON public.schedulings;
DROP POLICY IF EXISTS "Users can manage company schedulings" ON public.schedulings;
DROP POLICY IF EXISTS "Users can view company smtp configs" ON public.smtp_configs;
DROP POLICY IF EXISTS "Users can manage company smtp configs" ON public.smtp_configs;
DROP POLICY IF EXISTS "Users can view company system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Master users can manage system logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can view company system updates" ON public.system_updates;
DROP POLICY IF EXISTS "Users can manage company system updates" ON public.system_updates;
DROP POLICY IF EXISTS "Users can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their company associations" ON public.user_companies;
DROP POLICY IF EXISTS "Master users can manage user companies" ON public.user_companies;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Master users can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Master users can manage all companies" ON public.companies;

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE public.query_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedulings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Recriar todas as políticas corretamente
CREATE POLICY "Users can view company query executions" ON public.query_executions
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_master_user()
  );

CREATE POLICY "Users can manage query executions" ON public.query_executions
  FOR ALL USING (
    user_id = auth.uid() OR public.is_master_user()
  );

CREATE POLICY "Users can view company schedulings" ON public.schedulings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = schedulings.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Users can manage company schedulings" ON public.schedulings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = schedulings.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Users can view company smtp configs" ON public.smtp_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = smtp_configs.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Users can manage company smtp configs" ON public.smtp_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = smtp_configs.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Users can view company system logs" ON public.system_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = system_logs.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Master users can manage system logs" ON public.system_logs
  FOR ALL USING (public.is_master_user());

CREATE POLICY "Users can view company system updates" ON public.system_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = system_updates.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Users can manage company system updates" ON public.system_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = system_updates.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Users can view their transactions" ON public.transactions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = transactions.company_id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Users can manage their transactions" ON public.transactions
  FOR ALL USING (
    user_id = auth.uid() OR public.is_master_user()
  );

CREATE POLICY "Users can view their company associations" ON public.user_companies
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_master_user()
  );

CREATE POLICY "Master users can manage user companies" ON public.user_companies
  FOR ALL USING (public.is_master_user());

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (
    id = auth.uid() OR public.is_master_user()
  );

CREATE POLICY "Master users can manage all users" ON public.users
  FOR ALL USING (public.is_master_user());

CREATE POLICY "Users can view their companies" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = companies.id 
      AND user_companies.user_id = auth.uid()
    ) OR public.is_master_user()
  );

CREATE POLICY "Master users can manage all companies" ON public.companies
  FOR ALL USING (public.is_master_user());
