

# Melhorias no AR, Camera e Fluxo de Acesso

## Problemas identificados e solucoes

### 1. Video AR nao gruda na imagem (tracking ruim)

O problema esta na configuracao do MindAR no `ArViewer.tsx`:

- O video plane tem dimensoes fixas (`width: 1, height: 0.552`) que podem nao corresponder a proporcao da imagem target
- Faltam parametros de suavizacao do tracking: `filterMinCF` e `filterBeta`
- Falta o atributo `embedded` na `<a-scene>`, o que faz o A-Frame criar seu proprio canvas em vez de usar o container

**Correcoes:**
- Adicionar `filterMinCF: 0.001; filterBeta: 1000` ao atributo `mindar-image` para tracking mais suave e "grudento"
- Adicionar atributo `embedded` na `<a-scene>`
- Manter dimensoes do video mas usar `scale` mais adequado

### 2. Camera nao preenche a tela

O container da `<a-scene>` do A-Frame nao esta ocupando 100% da viewport porque faltam estilos CSS explícitos.

**Correcoes:**
- Adicionar estilos CSS para forcar o `a-scene` e seus elementos internos (canvas, video) a ocupar `100vw x 100vh`
- Adicionar `embedded` ao `a-scene` e definir `width/height: 100%` no container
- Remover `bg-background` do container fixo para evitar fundo escuro sobre a camera

### 3. Substituir "VER DEMO AR" por "VER AR" (sem login)

Na pagina inicial (`Index.tsx`), trocar o botao "VER DEMO AR" que aponta para `/ar/demo` por um campo onde o usuario pode digitar o ID ou colar o link de uma experiencia AR existente. A rota `/ar/:id` ja e publica (RLS permite SELECT para todos).

**Mudancas:**
- Substituir o botao `Link to="/ar/demo"` por um mini-formulario com input + botao "VER AR"
- O usuario digita o ID ou cola um link, e ao clicar e redirecionado para `/ar/{id}`

### 4. Upload restrito a um unico email cadastrado

Em vez de qualquer pessoa logada poder fazer upload, restringir para apenas emails autorizados. Sera feito via verificacao no frontend (no `Upload.tsx`), comparando o email do usuario logado com uma lista de emails permitidos.

**Mudancas:**
- No `Upload.tsx`, adicionar verificacao do email do usuario logado
- Se o email nao for autorizado, mostrar mensagem de acesso negado
- A lista de emails autorizados ficara como constante no codigo (pode ser expandida depois para uma tabela no banco)

---

## Arquivos que serao modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/ArViewer.tsx` | Melhorar tracking MindAR (filterMinCF/filterBeta), adicionar `embedded`, CSS fullscreen para camera |
| `src/index.css` | Adicionar estilos para `a-scene` fullscreen |
| `src/pages/Index.tsx` | Trocar "VER DEMO AR" por campo de input para ID/link + botao "VER AR" |
| `src/pages/Upload.tsx` | Adicionar verificacao de email autorizado |

---

## Detalhes Tecnicos

### Tracking MindAR melhorado
```text
mindar-image="imageTargetSrc: {url}; autoStart: true; filterMinCF: 0.0001; filterBeta: 1000; uiLoading: no; uiError: no; uiScanning: no;"
```
- `filterMinCF: 0.0001` — reduz jitter (vibracao) do tracking
- `filterBeta: 1000` — aumenta responsividade ao movimento, mantendo suavidade

### CSS para camera fullscreen
```text
a-scene { position: fixed; inset: 0; width: 100vw; height: 100vh; }
a-scene canvas { width: 100% !important; height: 100% !important; }
a-scene video { object-fit: cover; }
```

### Fluxo "VER AR" na home
- Input com placeholder "Cole o ID ou link da experiencia"
- Parser que extrai o ID do link (se o usuario colar URL completa como `https://site.com/ar/abc123`, extrai `abc123`)
- Botao "VER AR" navega para `/ar/{id}`

### Restricao de email
- Constante `ALLOWED_EMAILS = ["email@autorizado.com"]` no `Upload.tsx`
- Comparacao `ALLOWED_EMAILS.includes(user.email)` antes de permitir upload
- Tela de "Acesso restrito" se email nao for autorizado

