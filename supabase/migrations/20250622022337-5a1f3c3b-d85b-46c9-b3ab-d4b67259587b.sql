
-- Adicionar campo number à tabela evolution_configs para armazenar o número formatado
ALTER TABLE public.evolution_configs 
ADD COLUMN number TEXT;

-- Atualizar registros existentes com o número formatado baseado no telefone da empresa
UPDATE public.evolution_configs ec
SET number = CONCAT('55', REGEXP_REPLACE(c.phone, '\D', '', 'g'))
FROM public.companies c
WHERE ec.company_id = c.id 
AND c.phone IS NOT NULL 
AND c.phone != '';

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.evolution_configs.number IS 'Número de telefone formatado (55 + número da empresa) para criação da instância Evolution API';
