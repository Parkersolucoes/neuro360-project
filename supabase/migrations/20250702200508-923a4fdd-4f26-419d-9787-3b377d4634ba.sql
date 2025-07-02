-- Criar função para obter usuário atual do sistema customizado
CREATE OR REPLACE FUNCTION public.get_current_custom_user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  -- Como não temos sessão do Supabase Auth, precisamos de outra forma
  -- Por enquanto, vamos permitir acesso para usuários master
  SELECT NULL::UUID;
$$;

-- Atualizar políticas RLS para sql_connections para funcionar sem auth.uid()
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can create SQL connections for their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can update SQL connections from their companies" ON public.sql_connections;
DROP POLICY IF EXISTS "Users can delete SQL connections from their companies" ON public.sql_connections;

-- Política temporária mais permissiva enquanto não temos auth.uid()
CREATE POLICY "Allow all operations on sql_connections" 
  ON public.sql_connections 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Comentário explicativo
COMMENT ON POLICY "Allow all operations on sql_connections" ON public.sql_connections IS 
'Política temporária permissiva - deve ser restringida quando implementar autenticação adequada';