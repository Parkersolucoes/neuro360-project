
-- Adicionar colunas que estão faltando na tabela qr_sessions
ALTER TABLE qr_sessions 
ADD COLUMN IF NOT EXISTS evolution_config_id UUID REFERENCES evolution_configs(id),
ADD COLUMN IF NOT EXISTS instance_name TEXT,
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE;

-- Garantir que as colunas status e qr_code existam com os nomes corretos
ALTER TABLE qr_sessions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Remover constraint antiga se existir e recriar
ALTER TABLE qr_sessions 
DROP CONSTRAINT IF EXISTS unique_instance_per_company;

-- Recriar constraint para garantir que o instance_name seja único por empresa
ALTER TABLE qr_sessions 
ADD CONSTRAINT unique_instance_per_company 
UNIQUE (company_id, instance_name);
