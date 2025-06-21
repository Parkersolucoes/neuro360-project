
-- Remover políticas existentes da tabela templates
DROP POLICY IF EXISTS "Anyone can view templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;

-- Criar políticas RLS mais específicas para templates
CREATE POLICY "Users can view company templates" ON public.templates
  FOR SELECT USING (
    company_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates for their companies" ON public.templates
  FOR INSERT WITH CHECK (
    company_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can update their company templates" ON public.templates
  FOR UPDATE USING (
    company_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their company templates" ON public.templates
  FOR DELETE USING (
    company_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_companies.company_id = templates.company_id 
      AND user_companies.user_id = auth.uid()
      AND user_companies.role IN ('admin', 'manager')
    )
  );
