# Site do Igor Almeida (igoralmeida.pages.dev)

Página única em HTML/CSS/JS, sem build. Tudo está no `index.html` (a foto é embutida em base64) e em `assets/`.

## Publicação
- O projeto Pages `igoralmeida` no Cloudflare está ligado a este repositório.
- Todo push na branch `main` publica sozinho em igoralmeida.pages.dev (leva menos de 1 minuto).
- Para voltar uma versão: rollback no Cloudflare (Pages → igoralmeida → Deployments) ou `git revert`.
- Tudo o que está na raiz do repositório fica público no site (inclusive este arquivo). Nunca coloque segredos aqui.

## Regras de trabalho combinadas com o Igor
- Não é preciso pedir autorização para alterar e publicar. Faça a mudança, envie para a `main` e confira no ar.
- Em toda alteração visual, tire print do site no ar ANTES de publicar e DEPOIS de publicado (computador e celular) e envie os dois para o Igor.
- Antes de qualquer ação que não tem volta (apagar projeto, domínio, repositório ou conta), avise o Igor que é irreversível.
- Responda sempre em português do Brasil.

## Não quebrar
- `WEB3FORMS_KEY` no `index.html`: chave do formulário. Ela é pública por design (só envia mensagens para o e-mail do Igor).
- Número do WhatsApp: `5514998470667`.
- Máscara do telefone: remove +55 e 0 inicial e limita a 11 dígitos. Fixo (10 dígitos) usa (00) 0000-0000.
- Projetos na seção "Trabalhos recentes" são conceitos (negócios fictícios). O aviso fica no subtítulo da seção e no rodapé de cada página em `projetos/`; não apresentar como clientes reais.
- As páginas em `projetos/` são geradas a partir de `_fonte/<projeto>/` (React + Tailwind + shadcn, empacotadas num HTML só pelo skill web-artifacts-builder). Não edite o HTML de `projetos/` à mão: edite a fonte e gere de novo (passo a passo em `_fonte/<projeto>/COMO-EDITAR.md`). Fotos ficam em `assets/projetos/<pasta>/*.webp`.
- Os prints dos cards (`assets/projetos/*.jpg`) são gerados a partir das páginas em `projetos/`. Se mudar uma página, gere o print de novo (screenshot com fullPage: true, largura 1440 e altura até 2160, reduzido para 960 de largura mantendo a proporção).
- Identidade visual: fundo `#0d0a14`, roxo `#9d5cff`, lilás `#c084fc`, fontes Sora (títulos) e Inter (texto).
- Logo: `assets/logo/` (wordmark "igor.design" com o ponto como pixel roxo). As letras são vetores gerados da fonte Sora (800 em "igor", 400 em "design"); não troque por texto. Ícone "ig." em `icone.svg` e PNGs (32, 180, 192, 512 e `instagram-perfil.png`).

## Prospecção (mensagens para clientes)
- Quando o Igor mandar o site de um prospect, abra num navegador de verdade (Playwright, computador e celular), tire print e teste os botões e links (WhatsApp, telefone, menus, formulário) antes de escrever. Botões flutuantes de plugins (ex.: Joinchat) não aparecem como link comum: procure por eles. Nunca afirme que algo não existe ou não funciona sem ter testado.
- Mensagens só com o texto pronto, sem "senhor/senhora" e sem a palavra "valor" (use "um exemplo e uma proposta").
