
-- Função RPC para criar usuários sem problemas de RLS
CREATE OR REPLACE FUNCTION public.create_user_as_master(user_data jsonb)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  phone text,
  whatsapp text,
  role text,
  department text,
  is_admin text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Inserir novo usuário
  INSERT INTO public.users (
    name,
    email,
    phone,
    whatsapp,
    role,
    department,
    is_admin,
    status
  ) VALUES (
    user_data->>'name',
    user_data->>'email',
    user_data->>'phone',
    user_data->>'whatsapp',
    user_data->>'role',
    user_data->>'department',
    user_data->>'is_admin',
    user_data->>'status'
  ) RETURNING users.id INTO new_user_id;

  -- Retornar o usuário criado
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.whatsapp,
    u.role,
    u.department,
    u.is_admin,
    u.status,
    u.created_at,
    u.updated_at
  FROM public.users u
  WHERE u.id = new_user_id;
END;
$$;
