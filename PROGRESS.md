# Ronin Runner — continuidade

## Estado atual — parte 3

Implementada em `feat/runner-director-3`, base `3174bd7`/PR #6, em 18/11/2026. O proprietário aceitou a revisão funcional da parte 2, enviou referência de nanquim colorido/camadas/silhuetas, pediu apenas ampliar os abismos por ora e autorizou seguir. Arte final continua 6B; hitbox e demolição/tropeço não foram alterados nesta rodada. PRs anteriores continuam empilhados, sem merge automático/fechar Issue #1. Produção/VPS/DNS e outros sites continuam fora do escopo.

## Entregue e decisões

- Major 3 / physics rr-physics-0.3.0 / generator rr-director-3 / assets rr-four-biomes-study-3. V1/v2 executáveis e sem mudança de estado/trace; dispatch histórico por manifest no cliente e worker. Codec e fórmula de score preservados.
- Quatro regiões e ciclos sem fim, baseline 1500+2000+2500+2000 m, tiers 360/440/520/600 u/s e corrupção limitada a 3. Sem recuperar HP/concentração/tempo ou reset de score. Regional usa offset para ambiente e conta somente metros reais.
- Diretor por seed/índice, 16 padrões, até três perigos/bloco, corredores de respiro/transição e reserva de encontro futuro. Seleção estável entre janelas; candidato inválido vira REST. Nove comportamentos com fases/armas/vulnerabilidade/projéteis inteiros e deflexão sem kill/score.
- Abismos de 190/280 u (antes 90), geometria real e visual maior/profundo; travessia certificada com salto/duplo salto. Aviso PT/EN fora da cena dá antecedência antes da decisão na velocidade máxima.
- Regiões concedidas atomicamente somente em VERIFIED, junto de outcome/outbox; QUIT pode confirmar percurso cumulativo, sem ranking. GET /me/regions próprio e seletor autorizado, retry fixa modo/região. Demais missões/carreira/ranking continuam parte 7.
- Quatro estudos visuais originais, props/paletas/camadas/transições/corrupção e HUD PT/EN de região/ciclo. Nenhuma arte/IP copiada da referência; acabamento/som final permanecem 6B.

Leia [ADR009](docs/adr/ADR-009-DIRETOR-E-REGIOES.md), [ADR008](docs/adr/ADR-008-COMBATE-E-RIG.md) e ADR001–007 antes de continuar. Plano e especificações preservam o lançamento público completo. Nenhuma migration anterior foi editada; schema existente comporta manifest/region unlocks.

## Evidências

`npm ci` e `npm run verify` aprovados localmente: **90 unitários/integração +28 browser**, zero falhas/skips, contrato/geração/typecheck/lint/formato/build. Logs privados artifacts/phase-3-install-clean.log e phase-3-verify-final.log; gate anterior phase-3-verify-clean.log precede o aviso de abismo. CI Windows/Linux precisa ser consultada no commit final e registrada no PR, não presumida pelo teste local.

- Templates: 16×2 variantes×4 velocidades×3 deslocamentos; cada candidato executado no core e confirmado com ±3 ticks. Busca limitada de macros fornece testemunho positivo, não prova exaustiva. Comandos em artifacts/phase-3/pattern-witnesses.json.
- 10 mil seeds, quatro regiões/cinco ciclos/três amostras =600 mil decisões, gates/densidade/repouso/diversidade/janelas. As seeds são amostradas estruturalmente; provas dos templates e replay concatenado são verificações separadas.
- Cinco ciclos padrão/40 km: 267 blocos, 197893 ticks e 55 segmentos; cliente e worker concordam no state_hash/score. Teste real injeta falha de outbox: nenhum score/unlock parcial; retry atômico e idempotente. Replay falso/start bloqueado recusados. Native Postgres é efêmero/local.
- Nove inimigos/duas variantes têm fases/eliminação única verificadas; histórico de 100 abates mantém IDs podados, parry não concede kill/concentração. Regiões e ciclos não curam; pausa congela o core.
- Paridade V1: 0481dd7bcf1f468aca5e64a1013903cc631e4a3aad91377fbc7016a8d47733cc; V2: 9c7d64bf83fa2b6427def78d3c2accf0e8ca4ce9c374a9b947501fd3265251ef; V3: f2eb7c113e7d876b63a049628f54b0dc48d755fb2e41c9d5b4f670121dcd613f. V3 compara 3600 estados em 30/60/120; Chromium local 157.
- Browser usa dist/CSP/API/worker/DB reais, inicia em cada região com zero metros, confere outcome/hash e autorização PT/EN/mobile. Capturas region-bamboo/temple/mountains/castle.png. Void-bamboo-1.png e void-castle-4.png vêm de fixture privada de render, com prefixo alcançável, sem submissão de score. Pixels após pintura confirmam void até o fundo. Regressão 1D/2 de rede, pausa, controles, preview e cores preservada.

Auditoria runtime sem ocorrências em artifacts/phase-3-runtime-audit.json. Picomatch dev segue ADR004. OpenAPI 0.23 válido com 19 avisos explícitos e chunk lazy Phaser ~1376 kB/361 kB gzip; controlador ~273 kB/40 kB gzip, shell ~27 kB/10 kB gzip. Sem esconder avisos ou alegar budget/FPS universal. Capturas e hashes do artefato testado ficam privados em artifacts; não reconstruir depois do gate e chamar o novo build de aprovado.

## Limites / próxima etapa

Testes locais/emulação não homologam Safari/aparelhos físicos, latência humana ou arte/áudio finais. Perfis físicos fora do certificado são recusados até recertificação/versionamento. A referência de nanquim colorido foi aceita como direção; o visual atual continua estudo. Balanceamento ainda é baseline de playtest. Não há quatro chefes prontos, Ronin ID completo, Creator/inventário, missões/rankings/semanas completas, offline durável/retention nem operação pública homologada.

**Próxima parte autorizável: 4**, somente após novo pedido: quatro chefes com janelas de combate/retirada sem bloquear corrida, instâncias únicas, selos/bônus verificados e zero cura. Ler AGENTS/PROGRESS/ADR001–009, especificações de chefes/recompensas e conferir branches/PRs. Não iniciar Google/SMTP/DNS/produção nem divulgar jogo completo.

## Comandos

`npm ci`; `npm run verify`. Para jogar, quatro terminais: `npm run db:dev` (aguardar pronto), `npm run dev:api`, `npm run dev:verifier`, `npm run dev`. http://127.0.0.1:5173/roninrunner/pt-br ou /roninrunner/en; não alternar localhost. Região fechada só abre após um replay verificado que a alcance. API 3001, DB sintético 15432. Ctrl+C preserva dados dev; QA para/remove somente seus próprios clusters.

Após OpenAPI: `npm run contracts:generate`. Testes dirigidos: `node --test tests/director.test.ts tests/director-runtime.test.ts`. Browser exige build antes de test:browser; verify já faz isso. Sem Chrome: `npx playwright install chromium` (Linux pode exigir --with-deps). Nenhum comando desta etapa publica o jogo.
