
-- Criar tabela para vincular usuários a empresas
CREATE TABLE public.user_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Criar tabela para empresas
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações ASSAS
CREATE TABLE public.assas_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_url TEXT NOT NULL DEFAULT 'https://www.asaas.com/api/v3',
  api_key TEXT NOT NULL,
  wallet_id TEXT,
  webhook_url TEXT,
  is_sandbox BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela evolution_configs para vincular à empresa
ALTER TABLE public.evolution_configs ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Atualizar tabela user_subscriptions para vincular à empresa
ALTER TABLE public.user_subscriptions ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Habilitar RLS
ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assas_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_companies
CREATE POLICY "Users can view their company associations" 
  ON public.user_companies 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their company associations" 
  ON public.user_companies 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Políticas RLS para companies
CREATE POLICY "Users can view companies they are associated with" 
  ON public.companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = companies.id 
      AND user_companies.user_id = auth.uid() 
      AND user_companies.is_active = true
    )
  );

CREATE POLICY "Users can manage companies they admin" 
  ON public.companies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = companies.id 
      AND user_companies.user_id = auth.uid() 
      AND user_companies.role = 'admin'
      AND user_companies.is_active = true
    )
  );

-- Políticas RLS para assas_configs
CREATE POLICY "Users can view their own ASSAS configs" 
  ON public.assas_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ASSAS configs" 
  ON public.assas_configs 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Criar índices
CREATE INDEX idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON public.user_companies(company_id);
CREATE INDEX idx_companies_plan_id ON public.companies(plan_id);
CREATE INDEX idx_assas_configs_user_id ON public.assas_configs(user_id);

-- Inserir dados de exemplo
INSERT INTO public.companies (name, document, email, phone, address, plan_id) 
SELECT 'Empresa Demo', '12.345.678/0001-90', 'demo@empresa.com', '(11) 3333-4444', 'Rua Demo, 123', id 
FROM public.plans WHERE name = 'Básico' LIMIT 1;
