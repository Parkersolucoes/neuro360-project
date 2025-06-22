
-- Criar políticas RLS para a tabela system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer usuário autenticado insira logs
CREATE POLICY "Allow authenticated users to insert system logs"
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir que usuários vejam logs da sua empresa ou logs sem empresa
CREATE POLICY "Users can view system logs"
  ON public.system_logs 
  FOR SELECT 
  USING (
    company_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.company_id = system_logs.company_id 
      AND uc.user_id = auth.uid()
    )
  );

-- Política para permitir que usuários atualizem logs
CREATE POLICY "Users can update system logs"
  ON public.system_logs 
  FOR UPDATE 
  USING (
    company_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.company_id = system_logs.company_id 
      AND uc.user_id = auth.uid()
    )
  );

-- Política para permitir que usuários deletem logs
CREATE POLICY "Users can delete system logs"
  ON public.system_logs 
  FOR DELETE 
  USING (
    company_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_companies uc 
      WHERE uc.company_id = system_logs.company_id 
      AND uc.user_id = auth.uid()
    )
  );
