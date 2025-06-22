
-- Verificar se a tabela templates já existe e removê-la se necessário
DROP TABLE IF EXISTS public.templates CASCADE;

-- Criar tabela templates vinculada à empresa
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'welcome', 'followup', 'notification')),
  category TEXT NOT NULL DEFAULT 'general',
  variables JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para templates baseadas na empresa
CREATE POLICY "Users can view templates from their companies" 
  ON public.templates 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can create templates for their companies" 
  ON public.templates 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can update templates from their companies" 
  ON public.templates 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can delete templates from their companies" 
  ON public.templates 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

-- Criar índices para performance
CREATE INDEX idx_templates_company_id ON public.templates(company_id);
CREATE INDEX idx_templates_status ON public.templates(status);
CREATE INDEX idx_templates_type ON public.templates(type);
CREATE INDEX idx_templates_category ON public.templates(category);
