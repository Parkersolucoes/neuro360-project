
-- Primeiro, vamos verificar e corrigir a constraint da tabela system_logs
-- Remover a constraint existente se houver
ALTER TABLE public.system_logs DROP CONSTRAINT IF EXISTS system_logs_level_check;

-- Recriar a constraint com os valores corretos
ALTER TABLE public.system_logs ADD CONSTRAINT system_logs_level_check 
CHECK (level IN ('info', 'warning', 'error', 'debug'));

-- Agora inserir os dados de amostra corrigidos
-- Inserir empresas de exemplo (se não existirem)
INSERT INTO public.companies (id, name, document, email, phone, address, plan_id, qr_code, status) 
SELECT 
  gen_random_uuid(),
  'Empresa Exemplo ' || generate_series,
  '12.345.678/000' || generate_series || '-0' || generate_series,
  'contato' || generate_series || '@empresa.com',
  '(11) 9999-' || LPAD(generate_series::text, 4, '0'),
  'Rua Exemplo, ' || (generate_series * 100) || ' - São Paulo, SP',
  (SELECT id FROM public.plans ORDER BY RANDOM() LIMIT 1),
  'https://webhook.exemplo.com/qrcode' || generate_series,
  'active'
FROM generate_series(1, 5)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE name LIKE 'Empresa Exemplo%');

-- Inserir usuários de exemplo (se não existirem)
INSERT INTO public.users (id, name, email, phone, whatsapp, role, department, is_admin, status, password_hash)
SELECT 
  gen_random_uuid(),
  'Usuário ' || generate_series,
  'usuario' || generate_series || '@exemplo.com',
  '(11) 8888-' || LPAD(generate_series::text, 4, '0'),
  '(11) 8888-' || LPAD(generate_series::text, 4, '0'),
  CASE WHEN generate_series = 1 THEN 'admin' ELSE 'user' END,
  CASE 
    WHEN generate_series % 3 = 1 THEN 'TI'
    WHEN generate_series % 3 = 2 THEN 'Financeiro'
    ELSE 'Vendas'
  END,
  CASE WHEN generate_series = 1 THEN '0' ELSE '1' END,
  'active',
  crypt('123456', gen_salt('bf'))
FROM generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email LIKE 'usuario%@exemplo.com');

-- Associar usuários às empresas (se não existirem associações)
INSERT INTO public.user_companies (user_id, company_id, role, is_primary)
SELECT 
  u.id,
  c.id,
  CASE WHEN u.is_admin = '0' THEN 'admin' ELSE 'user' END,
  true
FROM public.users u
CROSS JOIN public.companies c
WHERE u.email LIKE '%@exemplo.com' 
  AND c.name LIKE 'Empresa Exemplo%'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_companies uc 
    WHERE uc.user_id = u.id AND uc.company_id = c.id
  );

-- Inserir conexões SQL de exemplo
INSERT INTO public.sql_connections (company_id, name, host, port, database_name, username, password_encrypted, connection_type, status)
SELECT 
  c.id,
  'Conexão SQL ' || generate_series,
  'servidor' || generate_series || '.exemplo.com',
  1433,
  'database' || generate_series,
  'user' || generate_series,
  crypt('senha123', gen_salt('bf')),
  'sqlserver',
  'active'
FROM public.companies c
CROSS JOIN generate_series(1, 3)
WHERE c.name LIKE 'Empresa Exemplo%'
  AND NOT EXISTS (SELECT 1 FROM public.sql_connections WHERE name LIKE 'Conexão SQL%');

-- Inserir queries SQL de exemplo
INSERT INTO public.sql_queries (company_id, connection_id, user_id, name, query_text, description, status)
SELECT 
  sc.company_id,
  sc.id,
  (SELECT id FROM public.users WHERE is_admin = '0' LIMIT 1),
  'Query ' || generate_series,
  'SELECT * FROM tabela' || generate_series || ' WHERE ativo = 1',
  'Consulta de exemplo ' || generate_series,
  'active'
FROM public.sql_connections sc
CROSS JOIN generate_series(1, 5)
WHERE sc.name LIKE 'Conexão SQL%'
  AND NOT EXISTS (SELECT 1 FROM public.sql_queries WHERE name LIKE 'Query%');

-- Inserir execuções de query de exemplo
INSERT INTO public.query_executions (query_id, user_id, connection_id, status, result_data, execution_time, rows_affected)
SELECT 
  sq.id,
  sq.user_id,
  sq.connection_id,
  CASE 
    WHEN generate_series % 3 = 1 THEN 'completed'
    WHEN generate_series % 3 = 2 THEN 'failed'
    ELSE 'pending'
  END,
  CASE 
    WHEN generate_series % 3 = 1 THEN '{"columns": ["id", "nome"], "rows": [["1", "Exemplo"]]}'::jsonb
    ELSE NULL
  END,
  CASE WHEN generate_series % 3 = 1 THEN (random() * 5000)::integer ELSE NULL END,
  CASE WHEN generate_series % 3 = 1 THEN (random() * 100)::integer ELSE NULL END
FROM public.sql_queries sq
CROSS JOIN generate_series(1, 10)
WHERE sq.name LIKE 'Query%'
  AND NOT EXISTS (SELECT 1 FROM public.query_executions);

-- Inserir configurações SMTP de exemplo
INSERT INTO public.smtp_configs (company_id, smtp_host, smtp_port, smtp_username, smtp_password_encrypted, from_email, from_name, use_tls, use_ssl, is_active, status)
SELECT 
  id,
  'smtp.gmail.com',
  587,
  'noreply@' || LOWER(REPLACE(name, ' ', '')) || '.com',
  crypt('senha123', gen_salt('bf')),
  'noreply@' || LOWER(REPLACE(name, ' ', '')) || '.com',
  name,
  true,
  false,
  true,
  'connected'
FROM public.companies
WHERE name LIKE 'Empresa Exemplo%'
  AND NOT EXISTS (SELECT 1 FROM public.smtp_configs);

-- Inserir agendamentos de exemplo
INSERT INTO public.schedulings (company_id, user_id, name, message_content, recipients, scheduled_for, status)
SELECT 
  c.id,
  (SELECT id FROM public.users WHERE is_admin = '0' LIMIT 1),
  'Agendamento ' || generate_series,
  'Mensagem de exemplo ' || generate_series,
  '["usuario1@exemplo.com", "usuario2@exemplo.com"]'::jsonb,
  now() + (generate_series || ' hours')::interval,
  CASE 
    WHEN generate_series % 3 = 1 THEN 'pending'
    WHEN generate_series % 3 = 2 THEN 'sent'
    ELSE 'failed'
  END
FROM public.companies c
CROSS JOIN generate_series(1, 8)
WHERE c.name LIKE 'Empresa Exemplo%'
  AND NOT EXISTS (SELECT 1 FROM public.schedulings WHERE name LIKE 'Agendamento%');

-- Inserir transações de exemplo
INSERT INTO public.transactions (user_id, company_id, plan_id, amount, type, status, payment_method, description)
SELECT 
  u.id,
  c.id,
  c.plan_id,
  CASE 
    WHEN generate_series % 3 = 1 THEN 29.90
    WHEN generate_series % 3 = 2 THEN 79.90
    ELSE 199.90
  END,
  'subscription',
  CASE 
    WHEN generate_series % 4 = 1 THEN 'pending'
    WHEN generate_series % 4 = 2 THEN 'completed'
    WHEN generate_series % 4 = 3 THEN 'failed'
    ELSE 'refunded'
  END,
  CASE 
    WHEN generate_series % 3 = 1 THEN 'credit_card'
    WHEN generate_series % 3 = 2 THEN 'pix'
    ELSE 'boleto'
  END,
  'Pagamento de assinatura mensal'
FROM public.users u
JOIN public.user_companies uc ON u.id = uc.user_id
JOIN public.companies c ON uc.company_id = c.id
CROSS JOIN generate_series(1, 15)
WHERE u.email LIKE '%@exemplo.com'
  AND NOT EXISTS (SELECT 1 FROM public.transactions WHERE description = 'Pagamento de assinatura mensal');

-- Inserir logs do sistema de exemplo (agora com constraint corrigida)
INSERT INTO public.system_logs (company_id, user_id, level, message, component, details)
SELECT 
  c.id,
  (SELECT id FROM public.users WHERE is_admin = '0' LIMIT 1),
  CASE 
    WHEN generate_series % 4 = 1 THEN 'info'
    WHEN generate_series % 4 = 2 THEN 'warning'
    WHEN generate_series % 4 = 3 THEN 'error'
    ELSE 'debug'
  END,
  'Log de exemplo ' || generate_series,
  CASE 
    WHEN generate_series % 3 = 1 THEN 'WhatsApp'
    WHEN generate_series % 3 = 2 THEN 'SQL'
    ELSE 'Auth'
  END,
  ('{"timestamp": "' || now() || '", "details": "Detalhes do log ' || generate_series || '"}')::jsonb
FROM public.companies c
CROSS JOIN generate_series(1, 20)
WHERE c.name LIKE 'Empresa Exemplo%'
  AND NOT EXISTS (SELECT 1 FROM public.system_logs WHERE message LIKE 'Log de exemplo%');

-- Inserir atualizações do sistema de exemplo
INSERT INTO public.system_updates (company_id, title, description, version, update_date, is_active)
SELECT 
  id,
  'Atualização v' || generate_series || '.0',
  'Descrição da atualização ' || generate_series || ' com melhorias e correções.',
  '1.' || generate_series || '.0',
  CURRENT_DATE - (generate_series || ' days')::interval,
  generate_series <= 3
FROM public.companies
CROSS JOIN generate_series(1, 6)
WHERE name LIKE 'Empresa Exemplo%'
  AND NOT EXISTS (SELECT 1 FROM public.system_updates WHERE title LIKE 'Atualização v%');

-- Adicionar configurações do sistema para todas as empresas
INSERT INTO public.system_configs (company_id, config_key, config_value, description, is_public)
SELECT 
  c.id,
  'system_appearance',
  jsonb_build_object(
    'system_name', 'Visão 360 - Soluções em Dados',
    'system_description', 'Plataforma completa para análise e gestão de dados empresariais',
    'primary_color', '#1e293b'
  ),
  'Configurações de aparência do sistema',
  true
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.system_configs sc 
  WHERE sc.company_id = c.id AND sc.config_key = 'system_appearance'
);
