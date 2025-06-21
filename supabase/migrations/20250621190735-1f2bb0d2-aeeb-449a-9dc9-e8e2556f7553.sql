
-- Adicionar campo de senha criptografada na tabela users
ALTER TABLE public.users ADD COLUMN password_hash TEXT;

-- Instalar extensão para criptografia se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Atualizar o usuário master com a senha criptografada
UPDATE public.users 
SET password_hash = crypt('Parker@2024', gen_salt('bf'))
WHERE is_master = true;

-- Função para validar senha
CREATE OR REPLACE FUNCTION public.validate_user_password(user_email TEXT, user_password TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  is_admin BOOLEAN,
  is_master BOOLEAN,
  status TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT u.id, u.name, u.email, u.role, u.is_admin, u.is_master, u.status
  FROM public.users u
  WHERE u.email = user_email 
    AND u.password_hash = crypt(user_password, u.password_hash)
    AND u.status = 'active';
$$;
