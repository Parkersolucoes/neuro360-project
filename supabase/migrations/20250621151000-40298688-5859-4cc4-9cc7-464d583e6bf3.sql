
-- Adicionar campo para identificar usuários de teste
ALTER TABLE public.profiles ADD COLUMN is_test_user boolean NOT NULL DEFAULT false;

-- Criar tabela de empresas de teste (separada das empresas reais)
CREATE TABLE public.test_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  document TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela test_companies
ALTER TABLE public.test_companies ENABLE ROW LEVEL SECURITY;

-- Política para usuários de teste verem apenas empresas de teste
CREATE POLICY "Test users can view test companies" 
  ON public.test_companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_test_user = true
    )
  );

-- Política para usuários de teste gerenciarem empresas de teste
CREATE POLICY "Test users can manage test companies" 
  ON public.test_companies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_test_user = true
    )
  );

-- Criar tabela de associação usuário-empresa de teste
CREATE TABLE public.test_user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.test_companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Habilitar RLS na tabela test_user_companies
ALTER TABLE public.test_user_companies ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias associações de teste
CREATE POLICY "Users can view their test company associations" 
  ON public.test_user_companies 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários gerenciarem suas associações de teste
CREATE POLICY "Users can manage their test company associations" 
  ON public.test_user_companies 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Inserir algumas empresas de teste padrão
INSERT INTO public.test_companies (name, email, document, phone, address) VALUES
  ('Empresa Teste Alpha', 'teste.alpha@exemplo.com', '11.111.111/0001-11', '(11) 1111-1111', 'Rua Teste Alpha, 123'),
  ('Empresa Teste Beta', 'teste.beta@exemplo.com', '22.222.222/0001-22', '(11) 2222-2222', 'Rua Teste Beta, 456'),
  ('Empresa Teste Gamma', 'teste.gamma@exemplo.com', '33.333.333/0001-33', '(11) 3333-3333', 'Rua Teste Gamma, 789');

-- Atualizar a descrição padrão do sistema
UPDATE public.system_configs 
SET system_description = 'Soluções de Análise dados para seu negócio'
WHERE system_description = 'Automação WhatsApp Inteligente';
