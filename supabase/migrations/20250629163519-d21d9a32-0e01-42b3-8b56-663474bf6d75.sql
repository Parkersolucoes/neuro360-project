
-- Primeiro, adicionar constraint única na tabela system_configs se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'system_configs_company_config_unique'
    ) THEN
        ALTER TABLE public.system_configs 
        ADD CONSTRAINT system_configs_company_config_unique 
        UNIQUE (company_id, config_key);
    END IF;
END $$;

-- Verificar se a empresa Neuro360 já existe e atualizar se necessário
UPDATE public.companies 
SET 
  name = 'Neuro360',
  document = '12.345.678/0001-90',
  email = 'contato@neuro360.com.br',
  phone = '(11) 3333-4444',
  address = 'Rua das Inovações, 360 - São Paulo, SP - CEP: 01234-567',
  status = 'active',
  updated_at = now()
WHERE id = '0a988013-fa43-4d9d-9bfa-22c245c0c1ea'::uuid;

-- Vincular o usuário master à empresa Neuro360 se ainda não estiver vinculado
INSERT INTO public.user_companies (
  user_id,
  company_id,
  role,
  is_primary
)
SELECT
  (SELECT id FROM public.users WHERE is_admin = '0' LIMIT 1),
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea'::uuid,
  'admin',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_companies uc
  WHERE uc.user_id = (SELECT id FROM public.users WHERE is_admin = '0' LIMIT 1)
    AND uc.company_id = '0a988013-fa43-4d9d-9bfa-22c245c0c1ea'::uuid
);

-- Inserir ou atualizar configuração padrão do sistema para Neuro360
INSERT INTO public.system_configs (
  company_id,
  config_key,
  config_value,
  description,
  is_public
)
VALUES (
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea'::uuid,
  'system_appearance',
  jsonb_build_object(
    'system_name', 'Neuro360 - Soluções Inteligentes',
    'system_description', 'Plataforma completa para análise e gestão de dados empresariais',
    'primary_color', '#1e293b',
    'login_background_image', ''
  ),
  'Configurações de aparência do sistema para Neuro360',
  true
)
ON CONFLICT (company_id, config_key) 
DO UPDATE SET
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  updated_at = now();
