
-- Criar bucket para imagens de sistema se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('system-images', 'system-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários autenticados façam upload de imagens do sistema
CREATE POLICY "Authenticated users can upload system images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'system-images' AND
    auth.uid() IS NOT NULL
  );

-- Política para permitir que todos vejam as imagens do sistema
CREATE POLICY "Anyone can view system images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-images');

-- Política para permitir que usuários autenticados deletem imagens antigas
CREATE POLICY "Authenticated users can delete system images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'system-images' AND
    auth.uid() IS NOT NULL
  );
