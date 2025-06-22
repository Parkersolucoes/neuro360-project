
-- Primeiro, vamos verificar e corrigir a estrutura da tabela webhook_integrations
-- Adicionar coluna para armazenar o caminho/URL do webhook se não existir
ALTER TABLE public.webhook_integrations 
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Atualizar a coluna webhook_name para ser mais flexível (pode ser nula)
ALTER TABLE public.webhook_integrations 
ALTER COLUMN webhook_name DROP NOT NULL,
ALTER COLUMN webhook_name SET DEFAULT NULL;

-- Garantir que a coluna webhook_url seja obrigatória quando is_active for true
-- Remover constraint anterior se existir
ALTER TABLE public.webhook_integrations DROP CONSTRAINT IF EXISTS webhook_url_required_when_active;

-- Adicionar nova constraint
ALTER TABLE public.webhook_integrations 
ADD CONSTRAINT webhook_url_required_when_active 
CHECK (
  (is_active = false) OR 
  (is_active = true AND webhook_url IS NOT NULL AND webhook_url != '')
);

-- Desabilitar temporariamente RLS para limpeza completa
ALTER TABLE public.webhook_integrations DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Enable read for company users" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Enable insert for company users" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Enable update for company users" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Enable delete for company managers" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can view webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can insert webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can update webhook integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Users can delete webhook integrations" ON public.webhook_integrations;

-- Reabilitar RLS
ALTER TABLE public.webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Criar políticas mais permissivas para usuários autenticados da empresa
CREATE POLICY "Company users can view webhook integrations" ON public.webhook_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Company users can insert webhook integrations" ON public.webhook_integrations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Company users can update webhook integrations" ON public.webhook_integrations
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Company users can delete webhook integrations" ON public.webhook_integrations
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );
