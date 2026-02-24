# Plano: Corrigir Problema de Upload

## Problema Identificado

O upload não está funcionando e não mostra nenhuma mensagem de erro. As causas prováveis são:

1. **Erros silenciados**: O código captura erros mas não mostra ao usuário
2. **Políticas RLS**: O storage exige que o caminho comece com o ID do usuário
3. **Possível problema de autenticação**: O usuário pode não estar autenticado corretamente

## Análise do Código

### `src/lib/arStorage.ts`
- `uploadFile()` retorna `null` em caso de erro, mas não lança exceção
- `createExperience()` retorna `null` em caso de erro, mas não lança exceção
- Os erros são apenas logados no console

### `src/pages/Upload.tsx`
- O `handleSubmit` verifica se `uploadFile` retornou `null`, mas a mensagem de erro pode não aparecer
- O estado `uploadProgress` é usado para mostrar progresso, mas pode não estar funcionando

## Soluções

### 1. Melhorar tratamento de erros em `arStorage.ts`

```typescript
export async function uploadFile(
  userId: string,
  folder: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  // ... código ...
  if (error) {
    return { error: `Erro no upload: ${error.message}` };
  }
  return { url: data.publicUrl };
}
```

### 2. Melhorar feedback visual em `Upload.tsx`

- Adicionar estado de erro visível
- Mostrar mensagens de erro específicas
- Adicionar toast/notification para erros

### 3. Verificar autenticação

- Garantir que o usuário está autenticado antes do upload
- Verificar se o `user.id` está correto

## Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/lib/arStorage.ts` | Melhorar retorno de erros |
| `src/pages/Upload.tsx` | Mostrar erros ao usuário |

## Próximos Passos

1. Modificar `arStorage.ts` para retornar erros detalhados
2. Modificar `Upload.tsx` para mostrar erros ao usuário
3. Testar o fluxo completo de upload
