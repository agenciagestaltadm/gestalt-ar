

# GestalT AR v2.0 — Integracaoo Supabase + Camera Real

## Resumo

Vamos integrar Supabase completo (auth, storage, banco de dados) e fazer a camera AR funcionar de verdade no mobile usando MindAR.js via CDN. O link AR sera publico (sem login para escanear), upload protegido por magic link, e video aceita ate 150MB com compressao automatica no navegador.

---

## O que sera feito

### 1. Habilitar Supabase e criar infraestrutura

**Banco de dados** — Uma tabela `ar_experiences`:

```text
ar_experiences
+------------------+----------+-----------------------------------+
| Coluna           | Tipo     | Descricao                         |
+------------------+----------+-----------------------------------+
| id               | uuid PK  | ID unico                          |
| user_id          | uuid FK  | auth.users(id), NOT NULL           |
| title            | text     | Titulo da experiencia             |
| target_image_url | text     | URL publica da imagem no Storage  |
| video_url        | text     | URL publica do video no Storage   |
| mind_file_url    | text     | URL publica do .mind no Storage   |
| created_at       | timestamp| Data de criacao                   |
+------------------+----------+-----------------------------------+
```

**RLS (Row Level Security)**:
- SELECT: qualquer pessoa pode ler (links AR publicos)
- INSERT/UPDATE/DELETE: somente `auth.uid() = user_id`

**Storage** — Bucket `ar-files` (publico para leitura, upload autenticado):
- Pasta por usuario: `{user_id}/targets/`, `{user_id}/videos/`, `{user_id}/minds/`
- RLS: INSERT somente autenticado, SELECT publico

### 2. Autenticacao com Magic Link

**Novos arquivos:**
- `src/lib/supabase.ts` — Cliente Supabase
- `src/contexts/AuthContext.tsx` — Provider de autenticacao
- `src/pages/Auth.tsx` — Pagina de login por magic link (e-mail)

**Fluxo:**
- Quem quer fazer upload precisa estar logado
- Pagina de login simples: digita e-mail, recebe magic link, clica e entra
- `onAuthStateChange` monitora sessao
- Redirect para `/upload` apos login
- Botao de logout no header

### 3. Upload real com Supabase Storage

**Modificacoes em `src/pages/Upload.tsx`:**
- Verifica se usuario esta autenticado (redireciona para `/auth` se nao)
- Upload dos 3 arquivos para Supabase Storage bucket `ar-files`
- Gera URLs publicas para cada arquivo
- Insere registro na tabela `ar_experiences` com os URLs
- Redireciona para `/ar/{id}` apos sucesso

**Compressao de video (fase futura):**
- Nota: FFmpeg WASM tem ~25MB de bundle e complexidade consideravel. Para o MVP, limitaremos o upload a 20MB (limite do Supabase Storage no plano free). Compressao com FFmpeg pode ser adicionada depois.

### 4. Camera AR funcionando de verdade

**Problema atual:** O botao "ABRIR CAMERA" apenas mostra um layout fake com animacao. Nao usa `getUserMedia` nem MindAR.

**Solucao — `src/pages/ArViewer.tsx`:**

1. Carregar MindAR.js e A-Frame via CDN no `index.html`:
```text
<script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>
```

2. Buscar dados da experiencia no Supabase pelo `id` da URL

3. Ao clicar "ABRIR CAMERA":
   - Criar uma `<a-scene>` com atributos MindAR
   - Configurar `mindar-image` com o URL do `.mind`
   - Inserir `<a-video>` com o URL do video
   - MindAR pede permissao de camera automaticamente
   - Video aparece sobre o target quando detectado

4. Meta tags para mobile no `index.html`:
```text
<meta name="apple-mobile-web-app-capable" content="yes">
```

5. O link `/ar/:id` nao exige login (publico)

### 5. Historico conectado ao Supabase

**Modificacoes em `src/pages/History.tsx`:**
- Busca experiencias do usuario logado via Supabase
- Delete real no banco + Storage
- Exibe thumbnail da imagem target

**Modificacao em `src/lib/arStorage.ts`:**
- Substituido por funcoes que usam Supabase client
- `getExperiences()` → query Supabase com filtro `user_id`
- `deleteExperience()` → delete no banco + remove arquivos do Storage

---

## Arquivos que serao criados/modificados

| Arquivo | Acao |
|---------|------|
| `index.html` | Adicionar scripts CDN (A-Frame + MindAR) e meta tags mobile |
| `src/integrations/supabase/client.ts` | Novo — Cliente Supabase |
| `src/integrations/supabase/types.ts` | Novo — Tipos TypeScript |
| `src/contexts/AuthContext.tsx` | Novo — Provider de autenticacao |
| `src/pages/Auth.tsx` | Novo — Pagina de magic link login |
| `src/pages/Upload.tsx` | Modificar — Upload real para Supabase Storage |
| `src/pages/ArViewer.tsx` | Modificar — Camera real com MindAR + busca dados do Supabase |
| `src/pages/History.tsx` | Modificar — Lista do Supabase + delete real |
| `src/pages/Index.tsx` | Modificar — Mostrar estado de login no header |
| `src/lib/arStorage.ts` | Modificar — Funcoes apontam para Supabase |
| `src/App.tsx` | Modificar — Wrap com AuthProvider, proteger rota /upload |
| Migration SQL | Criar tabela `ar_experiences` + RLS + bucket `ar-files` |

---

## Detalhes Tecnicos

### Sequencia de implementacao
1. Habilitar Supabase (migration com tabela + bucket + RLS)
2. Criar cliente Supabase e tipos
3. Criar AuthContext + pagina Auth
4. Atualizar Upload para usar Storage real
5. Atualizar ArViewer com MindAR real via CDN
6. Atualizar History para usar Supabase
7. Ajustar rotas e navegacao

### Riscos e mitigacoes
- **MindAR via CDN em SPA React**: Funciona bem pois MindAR registra componentes A-Frame globalmente. A `<a-scene>` sera criada dinamicamente via `dangerouslySetInnerHTML` ou refs DOM diretos.
- **iOS Safari**: Requer HTTPS + gesto do usuario para `getUserMedia`. O botao "ABRIR CAMERA" satisfaz esse requisito.
- **Tamanho do video**: Supabase free limita a 50MB por arquivo. Informaremos o usuario se o arquivo for muito grande.

