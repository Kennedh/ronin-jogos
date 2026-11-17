# Ronin Runner — continuidade

## Estado atual

Parte1B concluída localmente em17/11/2026, branch feat/runner-foundation-1b, sobre3b6e405 (1A). Plano e domínio/caminho confirmados pelo proprietário: play.ronin.dev.br/roninrunner; idiomas /roninrunner/pt-br e /roninrunner/en. A1A está no PR2 ainda aberto; PR1B deve ter como base essa branch para revisão incremental. Não mesclar nem fechar Issue1 automaticamente; faltam1C/1D.

## Implementado na1B

- Core puro60Hz, fixed-point com resíduos inteiros, overflow protegido, score decimal,3HP sem cura, salto duplo/coyote/buffer, slide e ataque, iFrame e abismo fatal.
- PRNGxoshiro128** e streams separados; manifests imutáveis e vinculados à simulação; fixtures de geometrias autoritativas. Diretor/mundo completo/chefes não implementados.
- Codec identity rr-input-v1, JSON canônico estrito/SHA256, parser de duplicatas/limites, cursor de partes/controls, fechamento estrutural e playback no mesmo core.
- PostgreSQL nativo real de desenvolvimento/QA, migrations001/002 com ledger/checksumLF/lock/transação, FK/UNIQUE/constraints; dev local persistente via npm run db:dev.
- Clock fracionário e paridade Node/Chromium em30/60/120cadências; CI expandida para instalar Chromium em Windows/Linux.

Decisões completas em [ADR005](docs/adr/ADR-005-FUNDACAO-1B.md). ADR001–004 e specs v0.18 continuam fontes; parâmetros físicos pre-release são TUNABLE com versão, não regras silenciosamente alteráveis numa run ativa.

## Testes e evidências

Local Windows/Node24.14.0: npm run verify aprovado,33unitários/integração+2navegador,zero falhas/skips, contratos/typecheck/lint/formato/build. DB server_version18.6, loopback apenas, cluster efêmero limpo. npm run db:dev -- --check (equivalente node scripts/dev-db.ts --check) validou duas inicializações sucessivas sem recriar schema; cluster dev foi parado e dados fictícios preservados.

Navegador Chrome157.0.8103.78,600estados iguais nas três cadências e Node, trace0481dd7bcf1f468aca5e64a1013903cc631e4a3aad91377fbc7016a8d47733cc. Isso não mede FPS em hardware mobile. Vetor de codec independente e curso300inimigos/12000ticks aprovados. CI Linux passou no primeiro push. Falha Windows identificou recusa de postgres.exe sob runneradmin; adaptador local passou a iniciar/parar via pg_ctl, com privilégio reduzido e shutdown gracioso. Teste adicional recusa segundo start e confirma que o banco permanece ativo. CI do commit final deve ser consultada após push; local não implica resultado remoto.

Logs privados: artifacts/phase-1b-verify.log,phase-1b-db.log,phase-1b-browser.log e phase-1b-runtime-audit.json. Runtime audit0; picomatch de desenvolvimento permanece pendente conformeADR004. NativePostgres18.6 só dev/QA; revisar versão de produção antes de deploy.

## Próxima parte autorizável:1C

1. Ler AGENTS, ADR001–005 e contratos/estados v0.18; conferir branch/PR2 e PR1B atuais antes de integrar.
2. Guest real/sessãoCSRF, APIstart/segments/finish/status com autorização por dono e limites; prefixo /api/v1. Sem score cliente como autoridade.
3. Persistência das partes fora de ordem e conflitos por índice/hash. Gzip somente com limite antes/depois de descompressão; codec identity já funciona.
4. Registro imutável de regras/seed, checksum ligando Ticket/DB/engine; regras antigas suportadas. Verificar corpo/versões, idade/ticks e fim real por replay, não só assertFinish.
5. Jobs com lease/generation/heartbeat/fencing, retry e commit atômico idempotente de outcome/outbox. Testar queda/stale/cancelamento e concessão única; projeções completas de progresso/ranking na7.
6. Testes API/DB reais e regressão completa. Issue1 continua aberta até cena Phaser/gestos/resultado da1D.

## Limitações explícitas

Sem HTTP de partidas, worker executando jobs, ranking público, concentração/especial, diretor procedural, quatro regiões/chefes, creator, authGoogle/SMTP, progressão e semanais completos. Shell local ainda informa que o jogo não é jogável. Sem VPS/DNS/Caddy/credenciais de produção tocados. Gate de fundação não aprova publicação; verify:release completo será criado antes da promoção pública.

## Comandos

npm ci; npm run verify; npm run db:dev; npm run dev; npm run dev:api. Teste dirigido: node --test tests/core.test.ts ou tests/database.test.ts; npm run test:browser. Sem Chrome local: npx playwright install chromium. Na CI Linux, instalação inclui --with-deps. Dados privados de QA não vão ao Git. Nenhum passo inicia1C automaticamente.
