
-- Adicionar a coluna connection_id na tabela sql_queries
ALTER TABLE public.sql_queries 
ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES public.sql_connections(id);

-- Adicionar a coluna created_by na tabela sql_queries  
ALTER TABLE public.sql_queries 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Criar índice para melhor performance na busca por connection_id
CREATE INDEX IF NOT EXISTS idx_sql_queries_connection_id ON public.sql_queries(connection_id);

-- Criar índice para melhor performance na busca por company_id
CREATE INDEX IF NOT EXISTS idx_sql_queries_company_id ON public.sql_queries(company_id);
