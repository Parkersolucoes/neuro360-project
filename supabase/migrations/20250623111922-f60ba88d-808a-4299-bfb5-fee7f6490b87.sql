
-- Criar função RPC para permitir que usuários master criem empresas
CREATE OR REPLACE FUNCTION public.create_company_as_master(
  company_name TEXT,
  company_document TEXT,
  company_email TEXT,
  company_phone TEXT DEFAULT NULL,
  company_address TEXT DEFAULT NULL,
  company_status TEXT DEFAULT 'active',
  company_plan_id UUID DEFAULT NULL,
  master_user_id UUID DEFAULT NULL
)
RETURNS TABLE(company_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Verificar se o usuário é master
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = master_user_id AND is_admin = '0'
  ) THEN
    RAISE EXCEPTION 'Apenas usuários master podem criar empresas';
  END IF;

  -- Inserir a nova empresa
  INSERT INTO public.companies (
    name,
    document,
    email,
    phone,
    address,
    status,
    plan_id
  ) VALUES (
    company_name,
    company_document,
    company_email,
    company_phone,
    company_address,
    company_status,
    company_plan_id
  ) RETURNING id INTO new_company_id;

  -- Retornar o ID da empresa criada
  RETURN QUERY SELECT new_company_id;
END;
$$;

-- Permitir que usuários autenticados executem esta função
GRANT EXECUTE ON FUNCTION public.create_company_as_master TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_company_as_master TO anon;
