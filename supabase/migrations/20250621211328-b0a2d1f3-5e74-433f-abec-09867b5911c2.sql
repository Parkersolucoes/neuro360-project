
-- Corrigir as políticas RLS para evolution_configs
-- Primeiro, remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view company evolution configs" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can manage company evolution configs" ON public.evolution_configs;

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

-- Garantir que RLS está habilitado
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela templates também
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
