
-- Função para gerar senha aleatória
CREATE OR REPLACE FUNCTION public.generate_random_password(length integer DEFAULT 8)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Função para definir senha de usuário (criptografada)
CREATE OR REPLACE FUNCTION public.set_user_password(user_id uuid, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users 
    SET password_hash = crypt(new_password, gen_salt('bf'))
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- Função para gerar e definir nova senha para um usuário
CREATE OR REPLACE FUNCTION public.generate_user_password(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_password text;
BEGIN
    -- Gerar nova senha
    new_password := generate_random_password(8);
    
    -- Definir a senha criptografada
    UPDATE public.users 
    SET password_hash = crypt(new_password, gen_salt('bf'))
    WHERE id = user_id;
    
    -- Retornar a senha em texto plano (apenas para mostrar ao admin)
    RETURN new_password;
END;
$$;
