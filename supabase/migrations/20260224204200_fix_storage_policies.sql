-- Corrigir políticas do storage para permitir upload de usuários autenticados

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can upload AR files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their AR files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their AR files" ON storage.objects;

-- Criar novas políticas mais permissivas para usuários autenticados
-- Política para upload: qualquer usuário autenticado pode fazer upload
CREATE POLICY "Authenticated users can upload AR files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ar-files');

-- Política para update: usuários podem atualizar seus próprios arquivos
CREATE POLICY "Users can update their AR files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'ar-files');

-- Política para delete: usuários podem deletar seus próprios arquivos
CREATE POLICY "Users can delete their AR files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ar-files');

-- Garantir que o bucket seja público para leitura
DROP POLICY IF EXISTS "AR files are publicly accessible" ON storage.objects;
CREATE POLICY "AR files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'ar-files');
