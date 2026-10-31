# Código-fonte do site principal (igoralmeida.pages.dev)

React 19 + Three.js (3D, só as peças usadas) + GSAP/ScrollTrigger + Lenis, com build do Vite.
O HTML é pré-renderizado no build: o texto aparece antes do JavaScript carregar.
O 3D (`src/Hero3D.tsx`) só carrega na primeira interação e só no computador. No celular a capa são colunas de telas de celular em CSS.

- Textos e seções: `src/App.tsx` e `src/Contato.tsx`
- WhatsApp, chave do Web3Forms e máscara do telefone: `src/lib.ts`
- Cores e layout: `src/styles.css`
- Telas da espiral: `assets/site/telas/*.webp` (prints dos projetos em `projetos/`)

## Publicar
Na raiz do repositório: `bash _fonte/site/publicar.sh`, depois commit e push.
O script gera o site e copia `index.html` e `assets/app/` para a raiz.

## Quem vê a versão leve (sem 3D)
Quem ativou "reduzir movimento", está com economia de dados ou internet 2G, tem até 2 GB de memória ou 2 núcleos, ou não tem WebGL.
Também quem ficar abaixo de 28 fps nos primeiros 2 segundos: o site troca sozinho para a versão em CSS.
