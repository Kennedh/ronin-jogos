# Ronin Runner — continuidade

## Parte atual

**1A concluída localmente em17/11/2026**, sobre revisão9641666 e baseline103dd878. Branch feat/runner-foundation-1a. PR será enviado para revisão; Issue1 permanece aberta até1A–1D integradas. Código não publicado nem jogo completo.

## Decisões

- Portal play.ronin.dev.br; jogo /roninrunner, traduções /roninrunner/pt-br e /roninrunner/en, decisão expressa do proprietário.
- Npm workspace/lockfile, Node24LTS/npm11, TS5.9.3 (peers de gerador/linter não suportamTS7). Phaser4.2.1/Vite8.3.8/Fastify5.12.8.
- Separação apps portal/api/verifier; packages core/client/contracts/data/content. Regras do core isoladas de render, relógio real e rede por lint.
- OpenAPI gera tipos TS e schemas runtime Ajv2020 com formatos. Não editar generated manualmente.
- ADR001rotas/workspace; ADR002replay/clock; ADR003prazos/commit; ADR004qualidade/riscos. Políticas baseline do plano aceito formalizadas, parâmetros físicos ainda TUNABLE.

## Código disponível

Shell local bilíngue de desenvolvimento noindex; rotas de idioma sob caminho confirmado. Não representa jogo jogável. API Fastify com /api/v1/health real e apenas liveness. Funções de fronteira validam ticks seguros e configuração limitada do verificador. Dados/replay/score ainda não são persistidos ou simulados; nada em localStorage como autoridade.

## Validação executada

npm run verify: passou no Windows/Node24.14.0, incluindo lint OpenAPI, conferência exata de geração, typecheck, ESLint, Prettier,9testes e build Vite. Zero falhas/skips nos testes. OpenAPI sem erro estrutural/ref quebrada,20avisos remanescentes (licença ainda não escolhida, respostas4xx em contratos draft e componentes de replay aguardando uso); não houve ignore ou relaxamento do lint para aprovar.

Cobertura inicial: RR-SEC-001/RR-RUN-004 (somente camada schema) rejeitam autoridade cliente/ações forjadas; ticket exige versões/seed/política e FULL começaBAMBOO; resultado VERIFIED exige score decimal e QUIT não pode ranquear; tick não sofre wrap32bits nem overflow silencioso; caminho/locale confirmados; API real responde liveness. RR-DATA-001 transacional ainda não comprovado: sem Postgres/leases nesta parte.

Não foram executados testes de física/replay integral, migrações, servidor de partidas, E2E de corrida, Google/SMTP ou hardware mobile. CI Windows/Linux está configurada, resultado remoto deve ser consultado após push. Gate público verify:release ainda não existe e não deve ser simulado.

Auditoria:0vulnerabilidades runtime reportadas;10entradas high de desenvolvimento correspondem à cadeia picomatch/GHSA-fc5q-39xc-vjpf. Última versão consultada4.0.7 afetada, sem patch compatível disponível nesta verificação. Registrado no ADR004 para revisão antes de staging/release; devservers só loopback, CI sem segredos. Não chamar risco de resolvido nem atualizar com --force.

## Próxima parte: 1B

1. Ler AGENTS, esta continuidade, ADR001–004 e contratos v0.18 afetados.
2. PostgreSQL de desenvolvimento/CI efêmero, ligado a loopback, migrations com ledger/checksum/lock, FKs e UNIQUE(run_id,index). Não conectar produção.
3. Core60Hz e física inteira/racional com resíduos, PRNG versionado/streams,3HP/sem cura/abismo/salto duplo/slide/attack, prioridades e fixtures independentes.
4. Codec canônico rr-input-v1/hashes/intervalos/controles pausados; testes de fronteira e paridade browser/Node30/60/120FPS.
5. Integração DB real e upgrades; expandir CI e manter9testes iniciais. Não fechar Issue1 antes de1C/1D.

## Comandos

npm ci; npm run verify; npm run dev (portal loopback5173); npm run dev:api (liveness loopback3001). Para mudar contrato: npm run contracts:generate, depois verify. Nenhuma credencial necessária para1A. VPS/DNS/Caddy/serviços existentes não alterados.
