# Ronin Runner — continuidade

## Estado atual — parte 2

Pedido “Iniciar parte 2” executado em branch `feat/runner-combat-2`, base `ffe946c`/PR #5 (1D), em 17/11/2026. PRs #2–#5 continuam empilhados e abertos; a parte 2 deve apontar à branch 1D. Não fazer merge automático, fechar Issue #1 ou publicar o jogo. Domínio confirmado play.ronin.dev.br/roninrunner; rotas /roninrunner/pt-br e /roninrunner/en. Infraestrutura/DNS/VPS/serviços existentes continuam fora desta autorização.

Implementação técnica e regressão local aprovadas. **Amostra de rig pronta para revisão estética do proprietário**; o critério “amostra visual aprovada” do plano não pode ser declarado atendido somente pelos testes. O restante do catálogo/arte final pertence à parte 6. CI do commit final deve ser consultada no PR; não inferir CI verde pelo gate local.

## Entregue

- Major 2 com physics rr-physics-0.2.0, generator rr-combat-course-2 e assets rr-rig-2. Concentração 0–100 (+12 perfeito/+3 comum), sequência perfeita/melhor sequência, golpe vazio e especial armado somente para o próximo ataque bem-sucedido. Alcance curto, entidades únicas/elegíveis/vulneráveis, sem cura/imunidade ou novo botão.
- V1 permanece executável com forma exata do estado/score, sem trocar fixtures antigas. API usa major 2 para novas runs; cliente e worker escolhem a implementação pelo manifest histórico. Registry/manifests/replays antigos preservados. Nenhuma migration nova ou edição de migrations anteriores.
- Telegraph de perfect derivado de posição/velocidade/tick inteiro, estável entre janelas. Geometria ainda é curso primitivo Bambu; diretor/quatro regiões/ciclos/arquétipos continuam parte 3 e chefes parte 4.
- HUD PT-BR/EN com barra, combo, especial pronto e feedback de combate. Atalhos remapeáveis/persistidos com validação de duplicatas/teclas reservadas; botões e gestos da 1D preservados, sem vantagem de tempo.
- Rig original vetorial em camadas e pivôs, compartilhado por Phaser na corrida e Canvas2D na amostra. Locomoção/ação separadas; salto aéreo+ataque, slide, dano/morte e efeitos. Prévia real anima/congela/troca pose/mostra pivôs e limpa canvas/RAF, com restauração persistida pelo histórico. Sem inventário ou personalização falsos.
- OpenAPI 0.22 e contracts gerados atualizados. CSP/standalone sem unsafe-eval preservados. Preferências e estudo escondidos durante corrida; paleta e responsividade revistas em capturas.

Decisões detalhadas: [ADR008](docs/adr/ADR-008-COMBATE-E-RIG.md). Fundação: ADR001–007; sessões/quotas/worker no [ADR006](docs/adr/ADR-006-FUNDACAO-1C.md), cliente/rede no [ADR007](docs/adr/ADR-007-FUNDACAO-1D.md). Ativos: [FOUNDATION_ASSETS](docs/FOUNDATION_ASSETS.md). O escopo público completo do plano permanece obrigatório.

## Validação e evidência

`npm ci` e `npm run verify` aprovados localmente: **79 testes unitários/integração e 20 de navegador**, zero falhas/skips; contratos, tipos, lint, formato e build aprovados. São 11 testes novos de core/controles/rig/DB e 5 testes browser adicionais, preservando todas as suítes anteriores. Logs privados: artifacts/phase-2-install-clean.log e phase-2-verify.log. As fixtures API/browser de fundação usam explicitamente o manifest v1; novas suítes exercitam major 2 com os mesmos serviços reais.

Core: ganho/teto, miss, opção comum manter/interromper combo, uma sequência por ataque, especial só no próximo sucesso, alcance frontal/vertical/elegibilidade/janela [start,end), não duplicar prêmio, dano/abismo/pausa, identidade/versionamento, telegraph por janelas, remapping e rig sem mutar core. PostgreSQL/API/worker: comandos legais acumulam 100 e disparam especial antes de QUIT; o state_hash/score do outcome coincide com o cliente, sem confiar em estatísticas enviadas.

Chromium/Node: 600 estados por cenário a 30/60/120. Trace legado **0481dd7bcf1f468aca5e64a1013903cc631e4a3aad91377fbc7016a8d47733cc** preservado. Novo trace de combate **9c7d64bf83fa2b6427def78d3c2accf0e8ca4ce9c374a9b947501fd3265251ef**. Isso não mede FPS em hardware físico.

Browser usa dist exato com CSP/API/Postgres/worker reais. Novo fluxo ganha perfeito por teclado/PT e gestos/EN, confere concentração/feedback/pausa e outcome; prévia comprova pixels animados/congelados, troca de pose, limpeza/reabertura/BFCache e remapping persistido/recusa de duplicata. Regressão 1D inclui rede/ACK perdido/antes de sair, worker atrasado, QUIT/morte, fullscreen negado, retrato/rotação, idiomas e cores. Capturas revistas em artifacts/phase-2: combat-desktop-pt.png, combat-mobile-en.png, rig-study.png e rig-special.png. Logs/dados são sintéticos e ignorados; clusters/processos QA são encerrados no fim.

Auditoria runtime: zero ocorrências reportadas em artifacts/phase-2-runtime-audit.json. Pendência dev picomatch continua ADR004. OpenAPI válido com 20 avisos mantidos, sem ocultar futuras rotas/licença/oneOf/codec. Chunk lazy Phaser ~1372 kB/359 kB gzip; controlador/contratos ~251 kB/35 kB gzip, shell ~25 kB/9 kB gzip e CSS ~15 kB/4 kB gzip. Vite mantém aviso de chunk; orçamento/carga/dispositivos serão medidos antes do público.

## Limites e próximo passo

Amostra precisa de revisão estética; não afirmar arte final, Creator/catálogos aprovados ou homologação em Safari/iPhone/Android físicos. Concentração/alcance/gestos são baseline de playtest, não equilíbrio definitivo aprovado. Contagens de combate são auditáveis por replay/hash; concessões de missão/carreira/ranking não são simuladas antes da parte 7.

Próxima parte autorizável **3**, após pedido do proprietário: diretor procedural, quatro regiões/ciclos, transições e arquétipos baseline; solver/concatenações/seeds/FOV e teto de dificuldade. Continuam depois chefes, Ronin ID completo, Creator/arte, progressão/rankings/semanas, offline durável/retention, aparelhos reais, operação/carga/restore e homologação pública. Não reduzir o lançamento a esta fundação.

## Comandos

`npm ci`; `npm run verify`. Para jogar, quatro terminais no checkout: `npm run db:dev` (aguardar pronto), `npm run dev:api`, `npm run dev:verifier`, `npm run dev`. Abrir http://127.0.0.1:5173/roninrunner/pt-br ou /roninrunner/en; não alternar localhost. Antes de iniciar, abrir “Estudo de animação do personagem” para revisar o rig. API 3001, DB sintético 15432. Ctrl+C preserva dados do dev; `node scripts/dev-db.ts --check` diagnostica/migra/encerra sem apagar.

Após OpenAPI: `npm run contracts:generate`. Testes dirigidos: `node --test tests/combat.test.ts tests/combat-runtime.test.ts`; browser requer `npm run build` antes de `npm run test:browser` (verify já respeita). Sem Chrome: `npx playwright install chromium`, Linux pode exigir --with-deps. Não reconstruir depois do gate e tratar o artefato como já testado; preservar hash/commit do dist aprovado. A parte 2 não publicou nenhuma aplicação nem iniciou parte 3.
