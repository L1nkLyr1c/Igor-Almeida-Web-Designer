# Forno Vivo Pizzaria (código-fonte)

A página publicada é `projetos/forno-vivo-pizzaria.html`: um arquivo único, gerado a partir deste código (React + Tailwind + shadcn/ui).
Não edite o HTML publicado à mão. Edite aqui e gere de novo.

- Cardápio, preços e horários: `src/data.ts`
- Layout e textos: `src/App.tsx`
- Cores: `src/index.css` (variáveis) e `tailwind.config.js` (ember, cream, coal, basil)
- Fotos: `assets/projetos/forno-vivo/*.webp` (Pexels, uso livre)

## Gerar de novo

1. `pnpm install`
2. Tirar as linhas do Google Fonts do `index.html` (o html-inline não aceita links externos), rodar o `bundle-artifact.sh` do skill web-artifacts-builder e devolver o `index.html` original.
3. `python3 finalize.py ../../projetos/forno-vivo-pizzaria.html`: coloca charset, título, fontes e preload no começo do `<head>`.
4. Gerar o print do card de novo (veja CLAUDE.md).

Observação: o `package.json` tem `"@parcel/resolver-default": { "packageExports": true }`. Sem isso o Parcel não acha `@radix-ui/primitive/is-development`.
