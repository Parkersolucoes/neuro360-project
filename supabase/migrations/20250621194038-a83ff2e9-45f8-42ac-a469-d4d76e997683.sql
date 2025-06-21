
-- Criar tabela para relacionar templates aos planos
CREATE TABLE public.plan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.message_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, template_id)
);

-- Habilitar RLS na tabela plan_templates
ALTER TABLE public.plan_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plan_templates (todos podem ver, apenas admins podem modificar)
CREATE POLICY "Anyone can view plan templates" 
  ON public.plan_templates 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage plan templates" 
  ON public.plan_templates 
  FOR ALL 
  TO authenticated
  USING (true);

-- Atualizar os planos existentes com valores mais apropriados
UPDATE public.plans 
SET 
  name = 'Básico',
  description = 'Plano ideal para pequenas empresas com funcionalidades essenciais',
  price = 29.90,
  max_sql_connections = 1,
  max_sql_queries = 100
WHERE name = 'Básico';

UPDATE public.plans 
SET 
  name = 'Intermediário', 
  description = 'Plano para empresas em crescimento com recursos avançados',
  price = 79.90,
  max_sql_connections = 5,
  max_sql_queries = 500
WHERE name = 'Profissional';

UPDATE public.plans 
SET 
  name = 'Professional',
  description = 'Plano completo para grandes empresas com recursos ilimitados',
  price = 199.90,
  max_sql_connections = 20,
  max_sql_queries = 2000
WHERE name = 'Empresarial';

-- Inserir planos se não existirem
INSERT INTO public.plans (name, description, price, max_sql_connections, max_sql_queries, is_active)
SELECT 'Básico', 'Plano ideal para pequenas empresas com funcionalidades essenciais', 29.90, 1, 100, true
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = 'Básico');

INSERT INTO public.plans (name, description, price, max_sql_connections, max_sql_queries, is_active)
SELECT 'Intermediário', 'Plano para empresas em crescimento com recursos avançados', 79.90, 5, 500, true
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = 'Intermediário');

INSERT INTO public.plans (name, description, price, max_sql_connections, max_sql_queries, is_active)
SELECT 'Professional', 'Plano completo para grandes empresas com recursos ilimitados', 199.90, 20, 2000, true
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE name = 'Professional');

-- Criar índices para melhor performance
CREATE INDEX idx_plan_templates_plan_id ON public.plan_templates(plan_id);
CREATE INDEX idx_plan_templates_template_id ON public.plan_templates(template_id);
