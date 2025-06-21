
-- Remover tabela de usuários existente e dependências
DROP TABLE IF EXISTS public.user_companies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Recriar tabela de usuários com tipo master (sem constraint de subconsulta)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  department TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_master BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Função para garantir apenas um usuário master
CREATE OR REPLACE FUNCTION public.ensure_single_master()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estamos definindo um usuário como master
  IF NEW.is_master = true THEN
    -- Remover master de todos os outros usuários
    UPDATE public.users 
    SET is_master = false 
    WHERE id != NEW.id AND is_master = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas um master
CREATE TRIGGER trigger_ensure_single_master
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_master();

-- Recriar tabela user_companies
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (admin e master podem ver todos)
CREATE POLICY "Admin and master users can view all users" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Políticas para criação de usuários (admin e master)
CREATE POLICY "Admin and master users can create users" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Políticas para atualização de usuários (admin e master)
CREATE POLICY "Admin and master users can update users" 
  ON public.users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Políticas para deletar usuários (admin e master)
CREATE POLICY "Admin and master users can delete users" 
  ON public.users 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_admin = true OR is_master_user = true)
    )
  );

-- Políticas para user_companies (master vê todas, admin vê da empresa)
CREATE POLICY "Master users can view all user companies" 
  ON public.user_companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_master_user = true
    )
  );

CREATE POLICY "Admin users can view company user associations" 
  ON public.user_companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_companies uc ON uc.user_id = p.id
      WHERE p.id = auth.uid() AND p.is_admin = true 
      AND uc.company_id = user_companies.company_id
    )
  );

-- Políticas para criação/atualização de user_companies (apenas master)
CREATE POLICY "Only master users can manage user companies" 
  ON public.user_companies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_master_user = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_master_user = true
    )
  );

-- Função para verificar se usuário é master
CREATE OR REPLACE FUNCTION public.is_master_user_check(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_uuid AND is_master = true
  );
$$;

-- Criar usuário master padrão
INSERT INTO public.users (
  name,
  email,
  phone,
  whatsapp,
  role,
  department,
  is_admin,
  is_master,
  status
) VALUES (
  'Master User - Parker Soluções',
  'master@parkersolucoes.com.br',
  '(11) 99999-9999',
  '5511999999999',
  'master',
  'Administração',
  true,
  true,
  'active'
);
