
-- Vincular o usuário admin@visao360.com.br à empresa especificada
INSERT INTO public.user_companies (user_id, company_id, role, is_primary)
SELECT 
  u.id, 
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea'::uuid,
  'admin',
  true
FROM public.users u
WHERE u.email = 'admin@visao360.com.br'
ON CONFLICT (user_id, company_id) DO UPDATE SET
  role = 'admin',
  is_primary = true,
  updated_at = now();

-- Garantir que existe uma empresa padrão com o ID especificado
INSERT INTO public.companies (
  id,
  name,
  document,
  email,
  phone,
  address,
  status,
  created_at,
  updated_at
) VALUES (
  '0a988013-fa43-4d9d-9bfa-22c245c0c1ea'::uuid,
  'Visão 360 - Empresa Padrão',
  '00.000.000/0001-00',
  'contato@visao360.com.br',
  '(11) 9999-9999',
  'Endereço da Empresa Padrão',
  'active',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  status = EXCLUDED.status,
  updated_at = now();
