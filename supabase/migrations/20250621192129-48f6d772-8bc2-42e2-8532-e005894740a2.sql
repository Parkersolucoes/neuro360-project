
-- Primeiro, remover a função existente
DROP FUNCTION IF EXISTS public.validate_user_password(text, text);

-- Alterar o campo is_admin para string e ajustar valores
ALTER TABLE public.users ALTER COLUMN is_admin TYPE TEXT;

-- Atualizar valores existentes baseado na lógica atual
-- Se is_master = true, então is_admin = '0' (master)
-- Caso contrário, is_admin = '1' (usuário comum)
UPDATE public.users 
SET is_admin = CASE 
  WHEN is_master = true THEN '0'
  ELSE '1'
END;

-- Remover a coluna is_master já que agora usaremos apenas is_admin
ALTER TABLE public.users DROP COLUMN is_master;

-- Criar a nova função de validação de senha com o novo formato
CREATE OR REPLACE FUNCTION public.validate_user_password(user_email text, user_password text)
RETURNS TABLE(id uuid, name text, email text, role text, is_admin text, is_master boolean, status text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.role, 
    u.is_admin,
    (u.is_admin = '0') as is_master, -- is_master será true quando is_admin = '0'
    u.status
  FROM public.users u
  WHERE u.email = user_email 
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.status = 'active';
$$;

-- Remover o trigger de master único já que não precisamos mais
DROP TRIGGER IF EXISTS trigger_ensure_single_master ON public.users;
DROP FUNCTION IF EXISTS public.ensure_single_master();

-- Atualizar a função is_master_user_check para usar o novo formato
CREATE OR REPLACE FUNCTION public.is_master_user_check(user_uuid uuid DEFAULT auth.uid())
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
