# Plano: Implementar Compressor de Vídeo

## Requisitos

1. Comprimir vídeos de mais de 300MB para menos de 50MB
2. Usar solução open source
3. Preview de imagens funcionando no upload

## Solução: FFmpeg.wasm

O **FFmpeg.wasm** é uma versão WebAssembly do FFmpeg que roda diretamente no navegador. É open source e muito poderoso.

### Vantagens:
- Roda 100% no navegador (sem servidor)
- Open source (MIT license)
- Suporta múltiplos formatos
- Compressão eficiente com codecs modernos

### Como funciona:
1. Usuário seleciona o vídeo
2. FFmpeg.wasm carrega no navegador (~25MB)
3. Vídeo é comprimido com codec H.264/VP9
4. Arquivo comprimido é enviado para o Supabase

## Diagrama do Fluxo

```mermaid
flowchart TD
    A[Usuário seleciona vídeo] --> B{Tamanho > 50MB?}
    B -->|Não| C[Usar arquivo original]
    B -->|Sim| D[Carregar FFmpeg.wasm]
    D --> E[Comprimir vídeo]
    E --> F[Arquivo comprimido < 50MB?}
    F -->|Não| G[Aumentar compressão]
    G --> E
    F -->|Sim| H[Enviar para Supabase]
    C --> H
```

## Implementação

### 1. Instalar dependências

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

### 2. Criar hook useVideoCompressor

```typescript
// src/hooks/useVideoCompressor.ts
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export function useVideoCompressor() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const compress = async (file: File): Promise<File> => {
    // Implementação da compressão
  };
  
  return { compress, loading, progress };
}
```

### 3. Modificar Upload.tsx

- Adicionar indicador de progresso de compressão
- Comprimir vídeo antes do upload se > 50MB
- Mostrar preview corretamente

## Configuração de Compressão

Para atingir menos de 50MB:
- Codec: H.264 (libx264)
- CRF: 28 (maior = mais compressão)
- Resolution: Reduzir se necessário
- Bitrate: Limitar a ~1Mbps

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/hooks/useVideoCompressor.ts` | Criar - Hook de compressão |
| `src/pages/Upload.tsx` | Modificar - Integrar compressor |
| `vite.config.ts` | Modificar - Headers CORS para FFmpeg |

## Observações Importantes

1. **Headers CORS**: O FFmpeg.wasm precisa de headers específicos
2. **Memória**: Navegador precisa de pelo menos 512MB disponível
3. **Tempo**: Compressão pode demorar alguns minutos
4. **Compatibilidade**: Funciona em navegadores modernos (Chrome, Firefox, Edge)
