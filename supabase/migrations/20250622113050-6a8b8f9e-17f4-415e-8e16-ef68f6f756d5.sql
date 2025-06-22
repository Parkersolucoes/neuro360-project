
-- Criar tabela para configurações SMTP por empresa
CREATE TABLE public.smtp_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_username TEXT NOT NULL,
  smtp_password_encrypted TEXT NOT NULL,
  use_tls BOOLEAN NOT NULL DEFAULT true,
  use_ssl BOOLEAN NOT NULL DEFAULT false,
  from_email TEXT NOT NULL,
  from_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar constraint para garantir uma configuração SMTP ativa por empresa
CREATE UNIQUE INDEX idx_smtp_configs_company_active 
ON public.smtp_configs (company_id) 
WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE public.smtp_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para smtp_configs
CREATE POLICY "Users can view SMTP configs for their companies" 
  ON public.smtp_configs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE company_id = smtp_configs.company_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create SMTP configs for their companies" 
  ON public.smtp_configs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE company_id = smtp_configs.company_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update SMTP configs for their companies" 
  ON public.smtp_configs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE company_id = smtp_configs.company_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete SMTP configs for their companies" 
  ON public.smtp_configs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE company_id = smtp_configs.company_id 
      AND user_id = auth.uid()
    )
  );
