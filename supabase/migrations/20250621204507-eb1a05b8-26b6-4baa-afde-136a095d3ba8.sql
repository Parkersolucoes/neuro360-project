
-- Recriar a tabela evolution_configs com as configurações corretas
DROP TABLE IF EXISTS public.evolution_configs CASCADE;

CREATE TABLE public.evolution_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  api_url TEXT NOT NULL DEFAULT 'https://api.evolution.com',
  api_key TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, instance_name)
);

-- Habilitar RLS
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir que usuários vejam e gerenciem configurações de suas empresas
CREATE POLICY "Users can view company evolution configs" ON public.evolution_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company evolution configs" ON public.evolution_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );

-- Criar índice para melhor performance
CREATE INDEX idx_evolution_configs_company_id ON public.evolution_configs(company_id);
CREATE INDEX idx_evolution_configs_status ON public.evolution_configs(status);
