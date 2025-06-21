
-- Adicionar colunas necessárias na tabela qr_sessions para integração com Evolution API
ALTER TABLE qr_sessions 
ADD COLUMN IF NOT EXISTS evolution_config_id UUID REFERENCES evolution_configs(id),
ADD COLUMN IF NOT EXISTS instance_name TEXT,
ADD COLUMN IF NOT EXISTS session_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE;

-- Remover colunas antigas que não são mais necessárias
ALTER TABLE qr_sessions 
DROP COLUMN IF EXISTS qr_code,
DROP COLUMN IF EXISTS status;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_qr_sessions_company_id ON qr_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_evolution_config_id ON qr_sessions(evolution_config_id);

-- Adicionar constraint para garantir que o instance_name seja único por empresa
ALTER TABLE qr_sessions 
ADD CONSTRAINT unique_instance_per_company 
UNIQUE (company_id, instance_name);
