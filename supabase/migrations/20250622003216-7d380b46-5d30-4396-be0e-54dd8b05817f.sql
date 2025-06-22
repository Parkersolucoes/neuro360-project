
-- Criar tabela para logs do sistema
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES public.users(id),
  level TEXT NOT NULL DEFAULT 'error' CHECK (level IN ('error', 'warning', 'info')),
  message TEXT NOT NULL,
  component TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_system_logs_company_id ON public.system_logs(company_id);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários master vejam todos os logs
CREATE POLICY "Master users can view all system logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (public.is_master_user());

-- Política para permitir que usuários vejam logs de suas empresas
CREATE POLICY "Users can view their company system logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.user_id = auth.uid() AND uc.company_id = system_logs.company_id
    )
  );

-- Política para inserir logs (qualquer usuário autenticado pode inserir)
CREATE POLICY "Authenticated users can insert system logs" 
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
