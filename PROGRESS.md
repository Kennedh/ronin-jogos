# Ronin Runner — continuidade

## Estado atual

Parte 1D implementada em 17/11/2026, branch `feat/runner-foundation-1d`, base `bd24224`/PR #4 (1C). PRs #2 (1A), #3 (1B) e #4 (1C) continuam abertos e empilhados. A revisão da 1D deve ter base na branch 1C; não fazer merge automático nem fechar Issue #1 até revisão/integração da fundação inteira. Domínio confirmado: play.ronin.dev.br/roninrunner; idiomas /roninrunner/pt-br e /roninrunner/en. Esta etapa não autoriza deploy/DNS/VPS.

## Implementado na 1D

- Cena Phaser 4/Canvas2D Bambu com desenho vetorial original, animação de silhueta/katana e geometria real do core. Adaptador 60 Hz ligado ao mesmo gerador primitivo/seed/manifest do verificador, sem física paralela nem score autoritativo no browser.
- Teclado/gestos/swipe antecipado/tap sem disparo duplo, cancelamento e multitouch, botões alternativos acessíveis por teclado, preferências locais e motion reduzido. Paisagem/fullscreen opcional com recusa tratada; retrato com pausa e fallback explícito. Campo horizontal preservado e altura lógica adaptativa para mobile.
- Pausa opaca com core congelado e controles ordenados, contagem 3–2–1 sem ticks, confirmação QUIT, idioma preservando run, pausa em foco/visibilidade/orientação/frame longo. Proteção de navegação/envio pendente e ciclo BFCache preservando renderer.
- API mesma origem/CSRF, start idempotente com chave estável mesmo após resposta perdida, manifest histórico autorizado/hash/versões; segmentos canônicos/hashes encadeados e ACK antes de liberar memória. Envio incremental, buffers/limites com pausa protetora, compromisso final imutável e retry. A UI separa estimativa, pendente, confirmado, recusado e rede; nunca inventa ranking/recompensa.
- OpenAPI 0.21, endpoint manifest privado e validators standalone gerados, sem unsafe-eval. CSP no build, Phaser lazy no jogo e hub sem carregar a cena. Proxy de desenvolvimento preserva Host e usa uma origem única 127.0.0.1:5173. Migrations/core/rules competitivos da 1B/1C preservados.
- Hub de um jogo real, UI PT-BR/EN, cores responsivas, instruções e política/prazos. Ativos originais e avisos de terceiros rastreados; sem GA/AdSense ou integrações externas adicionadas.

Decisões/limites: [ADR007](docs/adr/ADR-007-FUNDACAO-1D.md). Histórico de sessões/quotas/worker: [ADR006](docs/adr/ADR-006-FUNDACAO-1C.md); ADR001–005 e especificações v0.18 continuam válidos. Ativos/licenças: [FOUNDATION_ASSETS](docs/FOUNDATION_ASSETS.md).

## Validação da 1D

Smoke dos quatro launchers reais (db/API/worker/Vite) aprovado: proxy/CSP/guest/QUIT VERIFIED no browser, sem pageerror. Evidência privada artifacts/phase-1d-dev-smoke.log; processos encerrados e banco sintético preservado.

Instalação limpa `npm ci` e gate `npm run verify` aprovados localmente: **68 testes de unidade/integração e 15 de navegador**, zero falhas/skips; contratos gerados, typecheck, lint, formato e build aprovados. A suíte anterior de 57 testes foi preservada, acrescida de 10 testes do cliente e um cenário da API/manifest. Browser anterior (2) mais 12 cenários e teste pai (13) da integração jogável. Evidência privada: artifacts/phase-1d-verify-final.log (após reforço preventivo de cancelamento/captura de ponteiros) e phase-1d-verify-clean.log e phase-1d-ci-clean.log. A CI Windows/Linux do commit final deve ser consultada separadamente; sucesso local não implica CI verde.

Browser serve o dist real com CSP e usa Postgres/API/worker reais. Cobre ABYSS e estado/hash do outcome idêntico ao cliente, QUIT sem ranking, pausa/contagem/teclas repetidas/idioma, atrasar worker sem confirmar resultado, rede offline com buffer/retry e proteção beforeunload, start/finish com resposta perdida após commit, finish forjado recusado, modo regional/botões por teclado, gestos/tap/multitouch CDP com retirada parcial e terceiro dedo, fullscreen recusado, retrato/rotação e retorno pelo histórico. Suíte API com processo Node separado do worker continua passando. Não há dados de usuários ou DB mock.

Cliente também testa segmentos densos de 7200 ticks/2 comandos, corte por bytes e limite de partes, cadeia/ACK errado sem perda de dados, long frame e replay exato da pausa; contrato roda com code generation proibida. Paridade Chrome/Node preserva os 600 estados/cadências e trace 0481dd7bcf1f468aca5e64a1013903cc631e4a3aad91377fbc7016a8d47733cc. Chrome local 157.0.8103.78; mobile é emulação, não aparelho físico. Capturas desktop/PT e mobile/EN, pausa/retrato e cores computadas foram revisadas em artifacts/phase-1d. Clusters de QA são encerrados/removidos no fim.

Auditoria de runtime: zero ocorrências em artifacts/phase-1d-runtime-audit.json. Picomatch dev alto continua pendente (ADR004), sem audit fix --force. OpenAPI válido com 20 avisos explícitos (rotas futuras sem 4xx, licença ainda não definida, análise de oneOf que não considera required do pai, ReplaySegment usado pelo codec e não por JSON de upload). Não ocultar avisos nem anunciar completude das rotas futuras. Vite mantém alerta de chunk grande: cena lazy ~1372 kB/359 kB gzip; controlador/contratos ~231 kB/30 kB gzip; shell ~21 kB/8 kB gzip, CSS ~14 kB/4 kB gzip. Orçamento e aparelhos serão medidos antes do público, não elevar limite apenas para esconder aviso.

## Limites e próxima parte

O curso primitivo permite jogar/verificar a fundação; não substitui quatro regiões/ciclos/diretor/chefes completos. Ainda faltam concentração/especial/combate completo, rig/Creator/arte final, conta Google/e-mail/SMTP, ranking público/carreira/recompensas, semanais completas, durabilidade offline/checkpoints/retention, moderação/segurança final, carga/soak/restore e homologação de aparelhos. Replays íntegros não provam humano. A UI informa a perda de payload ainda não enviado ao fechar/recarregar. Dispositivos físicos/Safari/fullscreen real, FOV/telegraph definitivos e desempenho universal não foram homologados.

**Próxima parte autorizável: 2**, somente após pedido do proprietário. Ler AGENTS, PROGRESS, ADR001–007 e contratos de movimento/combate/rig; conferir PRs/branches. Implementar combate completo, concentração/especial, evolução do HUD/controles e prova de rig/animação original, com testes e amostra estética para revisão. Não antecipar conta/Google, deploy ou a conclusão do jogo. Issue #1 só fecha após revisão/integração de 1A–1D; a primeira versão pública permanece completa conforme o plano.

## Comandos

`npm ci`; `npm run verify`. Para jogar, manter quatro terminais no checkout: `npm run db:dev` (aguardar pronto), `npm run dev:api`, `npm run dev:verifier` e `npm run dev`. Abrir http://127.0.0.1:5173/roninrunner/pt-br ou /roninrunner/en; hub /. Não misturar localhost. API 3001, banco sintético 15432. Worker `-- --once` processa um job. `node scripts/dev-db.ts --check` inicia/migra/encerra o cluster sintético sem apagar dados.

Após editar OpenAPI: `npm run contracts:generate`. Testes dirigidos: `node --test tests/client.test.ts tests/run-runtime.test.ts`; browser: `npm run build` seguido de `npm run test:browser`. Sem Chrome local: `npx playwright install chromium` (Linux pode precisar --with-deps). O gate completo já faz build antes de browser. Servidores/QA são locais; nenhum comando daqui publica o jogo.
