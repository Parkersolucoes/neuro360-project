
-- Adicionar coluna qr_code na tabela companies
ALTER TABLE public.companies 
ADD COLUMN qr_code TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.companies.qr_code IS 'QR Code da empresa para integração';
