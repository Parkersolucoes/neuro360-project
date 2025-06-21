
-- Criar tabela para atualizações do sistema
CREATE TABLE public.system_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela system_updates
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam atualizações ativas
CREATE POLICY "Anyone can view active system updates" 
  ON public.system_updates 
  FOR SELECT 
  USING (is_active = true);

-- Política para admins gerenciarem atualizações
CREATE POLICY "Admin users can manage system updates" 
  ON public.system_updates 
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
