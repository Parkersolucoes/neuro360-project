
-- Verificar e ajustar a tabela webhook_integrations para garantir que possa receber os dados corretamente
-- Remover constraint UNIQUE se existir para permitir múltiplas integrações por empresa (se necessário)
ALTER TABLE public.webhook_integrations DROP CONSTRAINT IF EXISTS webhook_integrations_company_id_key;

-- Garantir que o campo webhook_name aceite texto suficiente
ALTER TABLE public.webhook_integrations ALTER COLUMN webhook_name TYPE TEXT;

-- Adicionar constraint UNIQUE apenas se quisermos uma integração por empresa
-- (mantenho comentado para avaliar se é necessário)
-- ALTER TABLE public.webhook_integrations ADD CONSTRAINT webhook_integrations_company_id_key UNIQUE (company_id);

-- Atualizar as políticas RLS para garantir inserção correta
DROP POLICY IF EXISTS "Users can manage company webhook integrations" ON public.webhook_integrations;

-- Política mais específica para inserção
CREATE POLICY "Users can insert company webhook integrations" ON public.webhook_integrations
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager', 'user')
    )
  );

-- Política para atualização
CREATE POLICY "Users can update company webhook integrations" ON public.webhook_integrations
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager', 'user')
    )
  );

-- Política para exclusão
CREATE POLICY "Users can delete company webhook integrations" ON public.webhook_integrations
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = webhook_integrations.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );
