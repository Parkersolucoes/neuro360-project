
-- Remover todos os dados da tabela evolution_configs
DELETE FROM public.evolution_configs;

-- Remover a tabela evolution_configs completamente
DROP TABLE IF EXISTS public.evolution_configs CASCADE;

-- Criar uma nova tabela simplificada para webhook integração
CREATE TABLE public.webhook_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  webhook_name TEXT NOT NULL DEFAULT 'Webhook Integração QrCode',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Habilitar RLS
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view company webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage company webhook integrations" ON public.webhook_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );

-- Criar índice para melhor performance
CREATE INDEX idx_webhook_integrations_company_id ON public.webhook_integrations(company_id);
