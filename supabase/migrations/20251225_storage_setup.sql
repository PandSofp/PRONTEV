-- =====================================================
-- PRONTEV - Supabase Storage Configuration
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- para configurar o Storage para imagens de produtos
-- =====================================================

-- 1. Adicionar coluna image_url à tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Criar bucket 'products' (se não existir)
-- NOTA: Isto deve ser feito via UI do Supabase Storage
-- Storage > New Bucket > Name: "products" > Public: YES

-- 3. Configurar RLS Policies para o bucket products

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de imagens" ON storage.objects;

DROP POLICY IF EXISTS "Imagens de produtos são públicas" ON storage.objects;

DROP POLICY IF EXISTS "Usuários autenticados podem deletar imagens" ON storage.objects;

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar imagens" ON storage.objects;

-- Policy: Usuários autenticados podem fazer upload
CREATE POLICY "Usuários autenticados podem fazer upload de imagens" ON storage.objects FOR INSERT TO authenticated
WITH
    CHECK (bucket_id = 'products');

-- Policy: Leitura pública (para exibir imagens)
CREATE POLICY "Imagens de produtos são públicas" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'products');

-- Policy: Usuários autenticados podem deletar suas imagens
CREATE POLICY "Usuários autenticados podem deletar imagens" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');

-- Policy: Usuários autenticados podem atualizar
CREATE POLICY "Usuários autenticados podem atualizar imagens" ON storage.objects
FOR UPDATE
    TO authenticated USING (bucket_id = 'products')
WITH
    CHECK (bucket_id = 'products');

-- 4. Configurar restrições de tamanho (opcional)
-- Isto é feito via UI do Supabase:
-- Storage > products > Settings
-- - File size limit: 5MB
-- - Allowed MIME types: image/*

-- =====================================================
-- Verificação
-- =====================================================
-- Após executar, verifique:
-- 1. Coluna image_url existe: SELECT * FROM products LIMIT 1;
-- 2. Bucket existe: Vá para Storage e veja se 'products' aparece
-- 3. Policies ativas: SELECT * FROM pg_policies WHERE tablename = 'objects';

-- =====================================================
-- Teste Manual
-- =====================================================
-- 1. Vá para Storage > products
-- 2. Upload uma imagem de teste
-- 3. Clique na imagem e copie a Public URL
-- 4. Abra URL no browser - deve exibir a imagem
-- 5. Se funcionar, o Storage está configurado! ✅

COMMENT ON COLUMN products.image_url IS 'URL pública da imagem do produto no Supabase Storage';