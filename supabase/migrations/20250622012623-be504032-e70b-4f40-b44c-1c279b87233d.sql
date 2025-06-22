
-- Criar tabela para armazenar atualizações do sistema
CREATE TABLE public.system_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT,
  update_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela system_updates
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam atualizações de suas empresas
CREATE POLICY "Users can view company system updates"
  ON public.system_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.company_id = system_updates.company_id 
      AND uc.user_id = auth.uid()
    )
  );

-- Política para permitir que usuários admin insiram atualizações
CREATE POLICY "Admin users can insert system updates"
  ON public.system_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      JOIN public.users u ON u.id = uc.user_id
      WHERE uc.company_id = system_updates.company_id 
      AND uc.user_id = auth.uid()
      AND u.is_admin = '0'
    )
  );

-- Política para permitir que usuários admin atualizem atualizações
CREATE POLICY "Admin users can update system updates"
  ON public.system_updates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      JOIN public.users u ON u.id = uc.user_id
      WHERE uc.company_id = system_updates.company_id 
      AND uc.user_id = auth.uid()
      AND u.is_admin = '0'
    )
  );

-- Política para permitir que usuários admin deletem atualizações
CREATE POLICY "Admin users can delete system updates"
  ON public.system_updates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      JOIN public.users u ON u.id = uc.user_id
      WHERE uc.company_id = system_updates.company_id 
      AND uc.user_id = auth.uid()
      AND u.is_admin = '0'
    )
  );

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_system_updates_company_id ON public.system_updates(company_id);
CREATE INDEX IF NOT EXISTS idx_system_updates_active ON public.system_updates(is_active, update_date DESC);

-- Inserir algumas atualizações de exemplo
INSERT INTO public.system_updates (company_id, title, description, version, update_date) 
SELECT 
  c.id,
  'Melhoria na Performance',
  'Otimizações gerais de performance e correções de bugs menores no sistema.',
  'v2.1.3',
  CURRENT_DATE - INTERVAL '5 days'
FROM public.companies c
LIMIT 1;

INSERT INTO public.system_updates (company_id, title, description, version, update_date) 
SELECT 
  c.id,
  'Nova Interface de Configurações',
  'Interface completamente redesenhada para configurações do sistema com melhor usabilidade.',
  'v2.1.0',
  CURRENT_DATE - INTERVAL '15 days'
FROM public.companies c
LIMIT 1;

INSERT INTO public.system_updates (company_id, title, description, version, update_date) 
SELECT 
  c.id,
  'Integração com WhatsApp Melhorada',
  'Melhorias na estabilidade da integração com WhatsApp e novos recursos de agendamento.',
  'v2.0.8',
  CURRENT_DATE - INTERVAL '25 days'
FROM public.companies c
LIMIT 1;
