
-- Adicionar campo description na tabela system_configs se não existir
DO $$ 
BEGIN
    -- Verificar se já existe uma configuração para system_description
    IF NOT EXISTS (
        SELECT 1 FROM public.system_configs 
        WHERE config_key = 'system_description'
    ) THEN
        INSERT INTO public.system_configs (
            config_key, 
            config_value, 
            description, 
            is_public
        ) VALUES (
            'system_description',
            '"Soluções em Dados"'::jsonb,
            'Descrição do sistema exibida no menu principal',
            true
        );
    END IF;
END $$;

-- Criar tabela templates se não existir (baseada na estrutura da message_templates)
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'message',
    category TEXT DEFAULT 'general',
    variables JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para templates (remover antes se existirem)
DO $$
BEGIN
    -- Remover políticas existentes se houver
    DROP POLICY IF EXISTS "Anyone can view templates" ON public.templates;
    DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;
    
    -- Criar novas políticas
END $$;

CREATE POLICY "Anyone can view templates" 
    ON public.templates 
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage templates" 
    ON public.templates 
    FOR ALL 
    TO authenticated
    USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_templates_company_id ON public.templates(company_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_status ON public.templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_type ON public.templates(type);

-- Migrar dados da tabela message_templates para templates se houver dados
INSERT INTO public.templates (
    id, name, content, category, variables, status, company_id, user_id, created_at, updated_at
)
SELECT 
    id, name, content, category, variables, status, company_id, user_id, created_at, updated_at
FROM public.message_templates
WHERE NOT EXISTS (
    SELECT 1 FROM public.templates WHERE templates.id = message_templates.id
);
