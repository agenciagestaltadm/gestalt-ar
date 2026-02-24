# Corrigir Erro de Upload no Supabase

## Problemas Identificados

1. **Limite de tamanho de arquivo**: O Supabase tem limite padrão de 50MB por arquivo
2. **Erro "failed to fetch"**: Pode ser causado por CORS ou timeout

## Soluções

### 1. Aumentar Limite de Tamanho do Bucket

No **Supabase Dashboard**:

1. Vá em **Storage** → **ar-files**
2. Clique em **Configuration** (ícone de engrenagem)
3. Em **File size limit**, aumente para o valor desejado (ex: 500MB = 524288000 bytes)
4. Ou deixe em branco para sem limite

### 2. Configurar CORS

No **Supabase Dashboard**:

1. Vá em **Settings** → **API**
2. Role até **CORS Configuration**
3. Adicione seu domínio (ou `*` para permitir todos)

### 3. Executar SQL para Configurar Bucket

Vá em **SQL Editor** e execute:

```sql
-- Atualizar configuração do bucket para permitir arquivos maiores
UPDATE storage.buckets 
SET file_size_limit = 524288000 -- 500MB em bytes
WHERE id = 'ar-files';

-- Se quiser sem limite, use:
-- UPDATE storage.buckets SET file_size_limit = NULL WHERE id = 'ar-files';
```

### 4. Verificar Allowed MIME Types

No **SQL Editor**:

```sql
-- Permitir todos os tipos de arquivo
UPDATE storage.buckets 
SET allowed_mime_types = NULL 
WHERE id = 'ar-files';
```

## Verificar se está funcionando

Após as configurações:
1. Tente fazer upload de um arquivo pequeno primeiro
2. Se funcionar, tente com arquivo maior
3. Verifique o console do navegador para erros

## Alternativa: Usar Upload Direto com URL Assinada

Se o problema persistir, podemos modificar o código para usar URL assinada em vez de upload direto.
