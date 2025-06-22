
-- Criar bucket para imagens de sistema se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('system-images', 'system-images', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Authenticated users can upload system images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view system images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete system images" ON storage.objects;

-- Política para permitir que usuários autenticados façam upload de imagens do sistema
CREATE POLICY "Authenticated users can upload system images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'system-images' AND
    auth.uid() IS NOT NULL
  );

-- Política para permitir que todos vejam as imagens do sistema (público)
CREATE POLICY "Anyone can view system images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-images');

-- Política para permitir que usuários autenticados deletem suas próprias imagens
CREATE POLICY "Authenticated users can delete system images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'system-images' AND
    auth.uid() IS NOT NULL
  );

-- Política para permitir que usuários autenticados atualizem imagens
CREATE POLICY "Authenticated users can update system images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'system-images' AND
    auth.uid() IS NOT NULL
  );

-- Criar políticas RLS para system_configs se não existirem
DO $$ 
BEGIN
  -- Verificar se as políticas já existem antes de criar
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_configs' 
    AND policyname = 'Users can view system configs'
  ) THEN
    CREATE POLICY "Users can view system configs"
      ON public.system_configs FOR SELECT
      USING (
        is_public = true OR
        EXISTS (
          SELECT 1 FROM public.user_companies uc 
          WHERE uc.company_id = system_configs.company_id 
          AND uc.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_configs' 
    AND policyname = 'Users can insert system configs'
  ) THEN
    CREATE POLICY "Users can insert system configs"
      ON public.system_configs FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_companies uc 
          WHERE uc.company_id = system_configs.company_id 
          AND uc.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_configs' 
    AND policyname = 'Users can update system configs'
  ) THEN
    CREATE POLICY "Users can update system configs"
      ON public.system_configs FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_companies uc 
          WHERE uc.company_id = system_configs.company_id 
          AND uc.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_configs' 
    AND policyname = 'Users can delete system configs'
  ) THEN
    CREATE POLICY "Users can delete system configs"
      ON public.system_configs FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.user_companies uc 
          WHERE uc.company_id = system_configs.company_id 
          AND uc.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Habilitar RLS na tabela system_configs se não estiver habilitado
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
