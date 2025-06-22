
-- Remover tabelas não utilizadas no sistema atual

-- Tabela admin_users não é utilizada (substituída por sistema de usuários master)
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Tabela webhook_configs não é utilizada
DROP TABLE IF EXISTS public.webhook_configs CASCADE;

-- Tabela user_subscriptions não é utilizada
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

-- Tabela test_companies não é utilizada
DROP TABLE IF EXISTS public.test_companies CASCADE;

-- Tabela test_user_companies não é utilizada
DROP TABLE IF EXISTS public.test_user_companies CASCADE;

-- Tabela system_updates não é utilizada (mencionada como não existente nos hooks)
DROP TABLE IF EXISTS public.system_updates CASCADE;

-- Tabela profiles não é utilizada (sistema usa tabela users diretamente)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover funções não utilizadas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_master_user_check(uuid) CASCADE;

-- Limpar dados órfãos na tabela transactions (sem company_id ou user_id válidos)
DELETE FROM public.transactions 
WHERE company_id IS NULL AND user_id IS NULL;

-- Limpar dados órfãos na tabela query_executions (sem query_id válido)
DELETE FROM public.query_executions 
WHERE query_id IS NULL;

-- Remover registros de system_configs sem company_id válido
DELETE FROM public.system_configs 
WHERE company_id NOT IN (SELECT id FROM public.companies);

-- Remover registros de user_companies sem company_id ou user_id válidos
DELETE FROM public.user_companies 
WHERE company_id NOT IN (SELECT id FROM public.companies)
   OR user_id NOT IN (SELECT id FROM public.users);

-- Remover registros de evolution_configs sem company_id válido
DELETE FROM public.evolution_configs 
WHERE company_id NOT IN (SELECT id FROM public.companies);

-- Remover registros de sql_connections sem company_id válido
DELETE FROM public.sql_connections 
WHERE company_id NOT IN (SELECT id FROM public.companies);

-- Remover registros de whatsapp_messages sem company_id válido
DELETE FROM public.whatsapp_messages 
WHERE company_id NOT IN (SELECT id FROM public.companies);

-- Remover registros de qr_sessions órfãos
DELETE FROM public.qr_sessions 
WHERE company_id IS NOT NULL 
  AND company_id NOT IN (SELECT id FROM public.companies);

-- Remover registros de schedulings órfãos
DELETE FROM public.schedulings 
WHERE company_id IS NOT NULL 
  AND company_id NOT IN (SELECT id FROM public.companies);

-- Remover registros de sql_queries órfãos
DELETE FROM public.sql_queries 
WHERE company_id IS NOT NULL 
  AND company_id NOT IN (SELECT id FROM public.companies);

-- Remover registros de system_logs órfãos
DELETE FROM public.system_logs 
WHERE company_id IS NOT NULL 
  AND company_id NOT IN (SELECT id FROM public.companies);

-- Limpar storage bucket não utilizado
DELETE FROM storage.buckets WHERE id = 'system-assets';

-- Remover políticas de storage não utilizadas
DROP POLICY IF EXISTS "Admin users can upload system assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view system assets" ON storage.objects;

-- Criar índices para melhorar performance nas tabelas utilizadas
CREATE INDEX IF NOT EXISTS idx_system_configs_company_config ON public.system_configs(company_id, config_key);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_evolution_configs_company_id ON public.evolution_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_company_id ON public.whatsapp_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_sql_connections_company_id ON public.sql_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_company_id ON public.qr_sessions(company_id);

-- Atualizar estatísticas das tabelas após limpeza
ANALYZE public.companies;
ANALYZE public.users;
ANALYZE public.user_companies;
ANALYZE public.system_configs;
ANALYZE public.evolution_configs;
ANALYZE public.plans;
ANALYZE public.transactions;
ANALYZE public.whatsapp_messages;
ANALYZE public.sql_connections;
ANALYZE public.sql_queries;
ANALYZE public.query_executions;
ANALYZE public.qr_sessions;
ANALYZE public.schedulings;
ANALYZE public.system_logs;
