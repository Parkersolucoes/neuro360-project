
-- Remover todas as tabelas relacionadas ao WhatsApp
DROP TABLE IF EXISTS public.whatsapp_messages CASCADE;
DROP TABLE IF EXISTS public.qr_sessions CASCADE;
DROP TABLE IF EXISTS public.webhook_integrations CASCADE;

-- Verificar se as tabelas foram removidas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('whatsapp_messages', 'qr_sessions', 'webhook_integrations');
