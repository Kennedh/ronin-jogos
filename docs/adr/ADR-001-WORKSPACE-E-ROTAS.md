# ADR-001 — Workspace, runtime e rotas

Estado: adotado na parte 1A em 17/11/2026. Escolha expressa do proprietário: play.ronin.dev.br/roninrunner. Substitui as rotas propostas /pt-br/ronin-runner e /en/ronin-runner, sem mudar o escopo do jogo.

O hub vive em /; entrada neutra do jogo em /roninrunner; traduções em /roninrunner/pt-br e /roninrunner/en. A entrada neutra deve respeitar a primeira preferência do navegador com fallback EN e escolha manual; canonical/hreflang/HTML indexável pertencem à integração do portal na9A. Nesta fundação o shell local tem noindex e não representa página publicada. API compartilhada entre jogos em /api/v1, mesma origem, cookie host-only; nenhum cookie amplo .ronin.dev.br.

Npm workspaces, Node24LTS, npm11 e TypeScript5.9.3. .nvmrc fixa o runtime usado localmente; lockfile fecha dependências. TypeScript7 foi descartado nesta etapa porque openapi-typescript7.13 e typescript-eslint8.73 declaram peers incompatíveis. Não usar --force/legacy-peer-deps. Phaser4.2.1, Vite8.3.8, Fastify5.12.8; mudanças futuras exigem o mesmo gate. Referências: https://nodejs.org/en/about/previous-releases e https://phaser.io/download/phaser4.

Pacotes de domínio independentes: core sem render/DOM/DB/rede; client adapta Phaser; API valida e autoriza; verifier reexecuta em processo independente; data encapsula Postgres; contracts deriva DTO/JSON Schema do OpenAPI; content identifica idiomas/rotas/manifests. Arquitetura estável permite refinar algoritmos por versão. Não duplicar score em servidor e cliente.

Runtime TS usa type stripping nativo Node24 e sintaxe apagável; tsc noEmit verifica tipos estritamente. Vite produz frontend. Não é emitido um backend JS diferente dos arquivos testados. API local inicia somente em loopback, tem apenas liveness e não cria runs falsas. Migrations/core/servidor de partidas chegam em1B/1C; cena Phaser em1D.

O código do Ronin e Arquivos permanece independente. Nenhuma operação de VPS/DNS/Caddy é consequência de push/CI desta branch. A CI tem contents:read e não recebe credenciais de produção.
