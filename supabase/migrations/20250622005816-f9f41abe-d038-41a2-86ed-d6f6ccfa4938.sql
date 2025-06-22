
-- Primeiro, vamos dropar a tabela atual se existir e recriar com vinculação à empresa
DROP TABLE IF EXISTS public.system_configs;

-- Recriar a tabela system_configs vinculada à empresa
CREATE TABLE public.system_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, config_key)
);

-- Habilitar RLS
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam configurações de suas empresas
CREATE POLICY "Users can view their company configs" 
  ON public.system_configs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.user_id = auth.uid() AND uc.company_id = system_configs.company_id
    )
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

-- Política para permitir que admins da empresa gerenciem configurações
CREATE POLICY "Company admins can manage configs" 
  ON public.system_configs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      JOIN public.users u ON u.id = uc.user_id
      WHERE uc.user_id = auth.uid() 
        AND uc.company_id = system_configs.company_id
        AND u.is_admin = '0'
    )
  );

-- Criar índices para melhor performance
CREATE INDEX idx_system_configs_company_id ON public.system_configs(company_id);
CREATE INDEX idx_system_configs_config_key ON public.system_configs(config_key);

-- Inserir configuração de exemplo para a primeira empresa (se existir)
DO $$
DECLARE
    first_company_id UUID;
BEGIN
    -- Buscar a primeira empresa
    SELECT id INTO first_company_id FROM public.companies LIMIT 1;
    
    -- Se existe uma empresa, criar configurações de exemplo
    IF first_company_id IS NOT NULL THEN
        INSERT INTO public.system_configs (
            company_id,
            config_key, 
            config_value, 
            description, 
            is_public
        ) VALUES 
        (
            first_company_id,
            'system_appearance',
            jsonb_build_object(
                'system_name', 'Visão 360 - Soluções em Dados',
                'system_description', 'Plataforma completa para análise e gestão de dados empresariais',
                'primary_color', '#1e293b',
                'login_background_image', ''
            ),
            'Configurações de aparência do sistema',
            true
        ),
        (
            first_company_id,
            'email_settings',
            jsonb_build_object(
                'smtp_host', 'smtp.gmail.com',
                'smtp_port', 587,
                'smtp_secure', true,
                'from_email', 'contato@empresa.com',
                'from_name', 'Sistema'
            ),
            'Configurações de envio de email',
            false
        ),
        (
            first_company_id,
            'notification_settings',
            jsonb_build_object(
                'enable_email_notifications', true,
                'enable_sms_notifications', false,
                'enable_push_notifications', true
            ),
            'Configurações de notificações',
            false
        );
    END IF;
END $$;
