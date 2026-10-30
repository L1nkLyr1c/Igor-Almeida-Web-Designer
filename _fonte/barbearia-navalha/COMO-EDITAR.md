# Código-fonte de projetos/barbearia-navalha.html

A página publicada é um arquivo único, gerado a partir deste código (React + Tailwind + shadcn/ui, empacotado com o skill web-artifacts-builder).
Não edite o HTML publicado à mão. Edite aqui e gere de novo.

- Conteúdo (serviços, preços, horários, equipe): `src/data.ts`
- Layout e textos: `src/App.tsx`
- Cores: `src/index.css` (variáveis) e `tailwind.config.js`
- Fotos: `assets/projetos/navalha/*.webp` (Pexels, uso livre)

## Gerar de novo

1. `pnpm install`
2. Copie `index.src.html` para `index.html` e apague as linhas do Google Fonts. O html-inline não aceita links externos.
3. Rode o `bundle-artifact.sh` do skill web-artifacts-builder. Ele gera o `bundle.html`.
4. `python3 finalize.py ../../projetos/barbearia-navalha.html ../assets/projetos/navalha/capa.webp`. Isso recoloca charset, título, fontes e preload no começo do `<head>`.
5. Gere o print do card de novo (veja CLAUDE.md).

O `package.json` tem `"@parcel/resolver-default": { "packageExports": true }`. Sem isso, o Parcel não acha `@radix-ui/primitive/is-development`.
