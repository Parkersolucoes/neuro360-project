
-- Criar tabela para armazenar sessões QR Code com status atualizado
ALTER TABLE public.qr_sessions 
ADD COLUMN IF NOT EXISTS session_status TEXT DEFAULT 'disconnected' CHECK (session_status IN ('connected', 'waiting', 'disconnected')),
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS webhook_data JSONB;

-- Renomear coluna 'status' para 'session_status' se ainda existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'qr_sessions' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.qr_sessions RENAME COLUMN status TO session_status_old;
    END IF;
END $$;

-- Remover coluna antiga se existir
ALTER TABLE public.qr_sessions DROP COLUMN IF EXISTS session_status_old;

-- Criar tabela para mensagens WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  evolution_config_id UUID REFERENCES public.evolution_configs(id) ON DELETE CASCADE,
  message_id TEXT,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document')),
  content TEXT NOT NULL,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para whatsapp_messages
CREATE POLICY "Users can view messages from their companies" 
  ON public.whatsapp_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = whatsapp_messages.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can create messages for their companies" 
  ON public.whatsapp_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = whatsapp_messages.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

-- Habilitar RLS para qr_sessions se ainda não estiver
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para qr_sessions
DROP POLICY IF EXISTS "Users can view QR sessions from their companies" ON public.qr_sessions;
DROP POLICY IF EXISTS "Users can create QR sessions for their companies" ON public.qr_sessions;
DROP POLICY IF EXISTS "Users can update QR sessions from their companies" ON public.qr_sessions;
DROP POLICY IF EXISTS "Users can delete QR sessions from their companies" ON public.qr_sessions;

CREATE POLICY "Users can view QR sessions from their companies" 
  ON public.qr_sessions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = qr_sessions.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can create QR sessions for their companies" 
  ON public.qr_sessions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = qr_sessions.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can update QR sessions from their companies" 
  ON public.qr_sessions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = qr_sessions.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can delete QR sessions from their companies" 
  ON public.qr_sessions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = qr_sessions.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

-- Habilitar RLS para evolution_configs se ainda não estiver
ALTER TABLE public.evolution_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para evolution_configs
DROP POLICY IF EXISTS "Users can view Evolution configs from their companies" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can create Evolution configs for their companies" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can update Evolution configs from their companies" ON public.evolution_configs;
DROP POLICY IF EXISTS "Users can delete Evolution configs from their companies" ON public.evolution_configs;

CREATE POLICY "Users can view Evolution configs from their companies" 
  ON public.evolution_configs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can create Evolution configs for their companies" 
  ON public.evolution_configs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can update Evolution configs from their companies" 
  ON public.evolution_configs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

CREATE POLICY "Users can delete Evolution configs from their companies" 
  ON public.evolution_configs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = evolution_configs.company_id 
      AND user_companies.user_id = auth.uid()
    ) 
    OR public.is_master_user(auth.uid())
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_company_id ON public.whatsapp_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_evolution_config_id ON public.whatsapp_messages(evolution_config_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_company_id ON public.qr_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_evolution_config_id ON public.qr_sessions(evolution_config_id);
CREATE INDEX IF NOT EXISTS idx_evolution_configs_company_id ON public.evolution_configs(company_id);
