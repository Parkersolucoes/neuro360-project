
-- Corrigir as políticas RLS para permitir que usuários master gerenciem configurações
DROP POLICY IF EXISTS "Users can view their company configs" ON public.system_configs;
DROP POLICY IF EXISTS "Master users can view all configs" ON public.system_configs;
DROP POLICY IF EXISTS "Master users can manage all configs" ON public.system_configs;
DROP POLICY IF EXISTS "Company admins can manage configs" ON public.system_configs;

-- Política para permitir que usuários vejam configurações de suas empresas
CREATE POLICY "Users can view their company configs" 
  ON public.system_configs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.user_id = auth.uid() AND uc.company_id = system_configs.company_id
    ) OR public.is_master_user()
  );

-- Política para permitir que usuários master vejam todas as configurações
CREATE POLICY "Master users can view all configs" 
  ON public.system_configs 
  FOR SELECT 
  USING (public.is_master_user());

-- Política para permitir que usuários master gerenciem todas as configurações
CREATE POLICY "Master users can manage all configs" 
  ON public.system_configs 
  FOR ALL 
  USING (public.is_master_user());

-- Política para permitir que usuários da empresa gerenciem suas configurações
CREATE POLICY "Company users can manage configs" 
  ON public.system_configs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.user_id = auth.uid() 
        AND uc.company_id = system_configs.company_id
    ) OR public.is_master_user()
  );

-- Garantir que existe pelo menos uma configuração padrão para cada empresa
INSERT INTO public.system_configs (
  company_id,
  config_key, 
  config_value, 
  description, 
  is_public
)
SELECT 
  c.id,
  'system_appearance',
  jsonb_build_object(
    'system_name', 'Visão 360 - Soluções em Dados',
    'system_description', 'Plataforma completa para análise e gestão de dados empresariais'
  ),
  'Configurações de aparência do sistema',
  true
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.system_configs sc 
  WHERE sc.company_id = c.id AND sc.config_key = 'system_appearance'
);
