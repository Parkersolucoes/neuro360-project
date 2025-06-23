
-- Vincular o usuário master (is_admin = '0') a todas as empresas existentes
INSERT INTO public.user_companies (user_id, company_id, role, is_primary)
SELECT 
  u.id as user_id,
  c.id as company_id,
  'admin' as role,
  false as is_primary
FROM public.users u
CROSS JOIN public.companies c
WHERE u.is_admin = '0' -- usuário master
  AND NOT EXISTS (
    -- Evitar duplicatas se já existir algum vínculo
    SELECT 1 FROM public.user_companies uc 
    WHERE uc.user_id = u.id AND uc.company_id = c.id
  );
