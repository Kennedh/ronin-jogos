# Ronin Runner — continuidade

## Estado atual

Parte 1C implementada em 17/11/2026, branch `feat/runner-foundation-1c`, base `dc98057`/PR #3 (1B). PR #2 (1A) e #3 ainda abertos; a revisão 1C deve ter base na branch 1B, sem merge automático e sem fechar Issue #1. Domínio/caminho confirmados: play.ronin.dev.br/roninrunner; idiomas /roninrunner/pt-br e /roninrunner/en. Nenhum deploy/DNS/VPS autorizado por esta etapa.

## Implementado na 1C

- Guest real/sessão opaca de 90 dias, cookie HTTPS __Host- host-only, digest no DB, CSRF/Origin/Host e autorização por dono antes do parser. Mensagens PT-BR/EN via message_key/catálogo.
- start com Idempotency-Key e ticket imutável; seed de servidor, hashes/versões/manifests históricos, quotas serializadas e região persistida. Guest começa com BAMBOO desbloqueado.
- Upload identity/gzip limitado antes/depois de expandir; headers/hash/codec conferidos e segmentos imutáveis fora de ordem. Primeiro finish e prazos imutáveis; AWAITING_SEGMENTS→PENDING só após completude estrutural.
- Fila real em Postgres: SKIP LOCKED, lease/heartbeat/generation, retry/backoff e dead letter; replay fora do HTTP/transação longa. Worker derivando resultado pelo core e curso primitivo autoritativo.
- Commit atômico idempotente de run VERIFIED/outcome/outbox; QUIT não ranqueia. Projeções de carreira/recompensas/ranking continuam na parte 7.
- Migration 003 incremental, sem editar 001/002; CLI de API/worker local, somente cluster sintético do projeto. Triggers para manifests/tickets/partes aceitas.

Detalhes/políticas/limitações: [ADR006](docs/adr/ADR-006-FUNDACAO-1C.md). ADR001–005 e specs v0.18 preservados. O curso primitivo não substitui o diretor/quatro regiões/chefes das partes 3/4. Replays íntegros não provam origem humana.

## Testes e evidências

Suíte 1C: 23 cenários de integração + teste pai em Postgres real. Inclui API HTTP real e worker em processo Node separado, 101 segmentos/controles, mortes reais HP_ZERO/ABYSS, morte inventada, idempotência/IDOR/CSRF, gzip hostil, quotas/rate durável, versão antiga, fronteiras 72h/24h/semana, concorrência/fencing/cancelamento/dead letter e rollback de outcome/outbox com falha injetada. Nenhum caso usa banco mock, skip ou dados de usuários.

`npm ci` e `npm run verify` aprovados localmente: 57 testes unitários/integração (33 preservados +24 da suíte 1C) e 2 de navegador, zero falhas/skips, contratos/typecheck/lint/formato/build aprovados. Evidência final: artifacts/phase-1c-verify-final.log. Após o prefixo HTTPS __Host- o gate completo foi repetido e passou; CI do commit final deve ser consultada separadamente. A CI final da 1B passou em Windows e Linux no commit dc98057. Chrome/Node continuam comparados em 600 estados e cadências 30/60/120. Isso não mede FPS em dispositivos reais.

Auditoria de runtime nesta execução: zero vulnerabilidades reportadas (artifacts/phase-1c-runtime-audit.json). O comando dev-db --check também atualizou o cluster sintético existente para 003 e o encerrou. Aviso picomatch em ferramentas dev permanece pendente (ADR004). PostgreSQL18.6 empacotado só para dev/QA; patch/runtime público será revisto antes de deploy. Logs/dados sintéticos ficam ignorados em artifacts; cluster QA é parado e removido depois do teste.

## Próxima parte autorizável: 1D

1. Ler AGENTS, ADR001–006, PROGRESS e contratos; conferir PRs/branches antes de integrar. Não iniciar sem solicitação do proprietário.
2. Primeira corrida Phaser/BAMBOO ligada ao core, manifest/seed do ticket e endpoints reais; render e cosméticos sem alterar física.
3. Teclado/gestos, responsividade/orientação/fullscreen fallback e pausa com tick congelado/countdown; controle de frame longo conforme ADR005.
4. Cliente HTTP mesma origem via proxy local explícito, bootstrap/CSRF, idempotência e envio de segmentos; mostrar quotas/prazos/tolerância e erros PT-BR/EN. Não aceitar score local como confirmado.
5. Tela de resultado/status aguardando worker, QUIT sem ranking, end_reason autoritativo; testar jogar→morrer→VERIFIED e recusa de rede/fullscreen. Retomada offline avançada/checkpoints/retention é endurecimento da parte 8.
6. Antes do público, validators standalone/CSP sem unsafe-eval apenas por Ajv. Publicação da versão inicial completa só após todas as fases e homologação; a Issue #1 só fecha após 1A–1D integradas.

## Limites explícitos

Não há ainda cena Phaser jogável, quatro regiões/chefes, concentração/especial, Creator/arte final, conta Google/e-mail/SMTP, ranking público, recompensas ou semanas completas. Há resultado privado da própria run validada, sem simular concessões futuras. Expiração/limpeza de storage, métricas/carga, checkpoints, moderação, backups e operação pública têm etapas próprias. Não há alteração dos outros sites, da VPS/DNS/Caddy ou de coleta/anúncios.

## Comandos

`npm ci`; `npm run verify`; `npm run db:dev`; em outros terminais `npm run dev:api`, `npm run dev:verifier`, `npm run dev`. `npm run dev:verifier -- --once` processa um job. `node scripts/dev-db.ts --check` inicia/migra/encerra o cluster sintético. API local 127.0.0.1:3001; shell 127.0.0.1:5173 ainda sem jogo. Proxy/cliente são integração da 1D. Testes dirigidos: `node --test tests/run-runtime.test.ts` ou `npm run test:browser`. Sem Chrome local: `npx playwright install chromium`. Windows usa pg_ctl para privilégios reduzidos e shutdown gracioso; Linux mantém launcher nativo.
