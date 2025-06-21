
-- Verificar e corrigir a estrutura da tabela sql_connections
-- Remover a coluna user_id se existir (ela não deve existir nesta tabela)
ALTER TABLE sql_connections DROP COLUMN IF EXISTS user_id;

-- Garantir que a coluna company_id existe e não é nula
ALTER TABLE sql_connections 
ALTER COLUMN company_id SET NOT NULL;

-- Adicionar foreign key constraint para company_id se não existir
ALTER TABLE sql_connections 
DROP CONSTRAINT IF EXISTS sql_connections_company_id_fkey;

ALTER TABLE sql_connections 
ADD CONSTRAINT sql_connections_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_sql_connections_company_id ON sql_connections(company_id);
