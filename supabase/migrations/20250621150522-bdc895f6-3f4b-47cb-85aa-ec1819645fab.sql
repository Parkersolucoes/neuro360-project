
-- Criar tabela para configurações do sistema
CREATE TABLE public.system_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL DEFAULT '360 Solutions',
  system_description TEXT DEFAULT 'Automação WhatsApp Inteligente',
  login_background_image TEXT,
  primary_color TEXT DEFAULT '#1e293b',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela system_configs
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam as configurações
CREATE POLICY "Anyone can view system configs" 
  ON public.system_configs 
  FOR SELECT 
  USING (true);

-- Política para admins gerenciarem configurações
CREATE POLICY "Admin users can manage system configs" 
  ON public.system_configs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Criar bucket de storage para assets do sistema
INSERT INTO storage.buckets (id, name, public) 
VALUES ('system-assets', 'system-assets', true);

-- Política para permitir upload apenas para admins
CREATE POLICY "Admin users can upload system assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'system-assets' AND
    (EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    ))
  );

-- Política para permitir que todos vejam os assets
CREATE POLICY "Anyone can view system assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-assets');

-- Inserir configuração padrão
INSERT INTO public.system_configs (system_name, system_description, primary_color)
VALUES ('360 Solutions', 'Automação WhatsApp Inteligente', '#1e293b');
