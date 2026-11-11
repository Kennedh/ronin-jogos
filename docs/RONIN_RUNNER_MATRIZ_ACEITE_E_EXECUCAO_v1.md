# Ronin Runner — Matriz de aceite, baselines e execução futura pelo Codex (v0.18)

**Uso:** documento de referência para revisão final G0 e futura programação, **sem autorização de código agora**. Contratos detalhados: [motor/partidas/ranking](./RONIN_RUNNER_CONTRATO_SIMULACAO_PARTIDAS_RANKING_v1.md), [conta/dados/privacidade](./RONIN_RUNNER_CONTRATO_IDENTIDADE_DADOS_PRIVACIDADE.md), [arte/telas/catálogos](./RONIN_RUNNER_ARTES_TELAS_CATALOGO_CONTEUDO_v1.md), [VPS/portal/testes](./RONIN_RUNNER_OPERACAO_VPS_PORTAL_TESTES_v1.md), [OpenAPI v1](./openapi.ronin-runner.v1.yaml).

## 1. Estado dos itens G01–G15

| ID | Cobertura nesta revisão | Estado do DESIGN | Comprovação prática ainda necessária |
|---|---|---|---|
| G01 Simulação | ticks, inteiros, física, prioridades, versões | baseline redigida | replay igual client/worker, aferir timing em devices |
| G02 Long runs | chunks, pausa, TTL/retry, reconexão e semana | baseline redigida | stress CPU/SSD, navegador sem rede, UX de pausa |
| G03 Ranking | fórmula, desempates, rules_major, hall da fama | baseline redigida | evitar farm e métricas de patches |
| G04 API/DB | OpenAPI 3.1 draft, tabelas, índices, transação | contrato draft redigido | validar OpenAPI mecanicamente, ERD/DDL e migrations reais |
| G05 Identidade | guest/email/Google, verificação, reset, merge, sessão | fluxos definidos | SMTP real, Google origins e E2E segurança |
| G06 Criador | opções básicas livres, especiais, rig, compatibilidade | catálogo mínimo definido | arte final, pares de peças e performance |
| G07 Arte/áudio | quatro biomas, paletas, layers, som e licenças | bible de produção redigida | criação e licenciamento de assets originais |
| G08 UI/UX | S00–S13, estados, tokens, orientação, i18n | blueprint redigido | wireframes gráficos finais e testes reais |
| G09 Balanceamento | distâncias, boss hits, telegraph, procedural | manifest baseline | playtest e 10k+ seeds válidas |
| G10 Semanais | 30 templates, cinco slots e tiers 2/4/5 | catálogo inicial definido | simular anos de gerador e medir metas |
| G11 Missões | trajes, marcos, selos, recompensas | catálogo inicial definido | ajustar volume/arte e dificuldade |
| G12 VPS | topologia, worker, cache, backup, staging | operação documentada | **medir specs reais da VPS**, carga, restore e SMTP |
| G13 Segurança | sessão, PII, retenção, recurso e abuso | baseline registrada | revisão de segurança/LGPD e políticas publicadas |
| G14 Testes | gates, testes ID, dispositivos e release | matriz definida | **executar** testes na implementação, não alegar aprovado |
| G15 Portal | play.ronin.dev.br proposto, i18n rotas, SEO e Ronin ID | integração documentada | conferir DNS/Caddy/portal real e origem Google |

**Conclusão:** nenhum G01–G15 está sem uma **proposta concreta de design**. Isso **não** significa que código, arte, OpenAPI validado, VPS medida ou QA estejam concluídos. Antes de autorizar Codex, usuário pode aprovar o conjunto de baselines de design com uma única revisão; os limites `TUNABLE` continuam alteráveis por testes.

## 2. Parâmetros e classificação de mudança

- `PRODUTO_CONFIRMADO`: nunca mudar sem nova decisão expressa do usuário (3 vidas sem cura, salto duplo, chefes que recuam, PT/EN, opções básicas livres, semanais 2/4/5 etc.).
- `BASELINE_DESIGN`: valores técnicos padrões propostos pela especificação: 60 ticks/s, 60s chunk, 72h run TTL, semana UTC, 5 templates por semana, anonimização e origem play; revisão unificada antes de implementação.
- `TUNABLE_PRE_RELEASE`: valores de gravidade, salto, telegraph, score de boss, tempo de sessão, retenção, budgets, quantidades estéticas e alvos dos desafios. Deve existir configuração versionada e critério de aceite.
- `EXTERNAL_DEPENDENCY`: DNS, Caddy, CPU/RAM SSD reais da VPS, envio SMTP, Google domains e aprovação de licenças. Não simular como pronto.
- `TESTED`: somente quando houver teste real registrado com commit, ambiente, `rules_version`, dispositivo e evidência.

## 3. Test IDs — núcleo, mundo e competição

| ID | Pré-condição | Entrada | Resultado obrigatório |
|---|---|---|---|
| RR-CORE-001 | run sem modificação | salto 1 + salto 2 + terceiro swipe | apenas 2 impulsos até pouso |
| RR-CORE-002 | run com 3 vidas | três danos não fatais sequenciais | 3→2→1→0 e morte |
| RR-CORE-003 | com vidas 3/2/1 e invulnerabilidade | abismo | morte imediata, sem cura/defesa |
| RR-CORE-004 | same seed, inputs, rules_major | 30/60/120 FPS gráficos | mesmo checksum e score autoritativos |
| RR-CORE-005 | sliders cosméticos e skins diferentes | replay idêntico | mesma física, hitbox, perfect window |
| RR-PROC-001 | quatro biomas e 5 ciclos | 10k seeds (baseline) | sem padrão impossível, inclusive transições |
| RR-PROC-002 | velocidade no teto | geração avançada | densidade/telegraph permanecem alcançáveis |
| RR-BOSS-001 | por chefe | esquivar sem atacar | boss recua, corrida segue, zero boss bonus |
| RR-BOSS-002 | por chefe | acerto suficiente | bônus único, selo da primeira vitória único |
| RR-BOSS-003 | boss recua e novo ciclo | repetir encontro | instância nova pode render bonus, primeiro selo não duplica |
| RR-RUN-001 | partida longa | 100+ segmentos, uploads fora de ordem | hash encadeado, nenhuma duplicação, verificação completa |
| RR-RUN-002 | app em segundo plano | pausa/retoma | tick congelado, sem morte arbitrária |
| RR-RUN-003 | rede cai | buffering, retorno, retry | PENDING até VERIFIED, score não aceito antes |
| RR-RUN-004 | score falso/teleporte | adulterar inputs e resumo | servidor rejeita/impossibilidade detectada |
| RR-RUN-005 | expedição regional | iniciar no Templo e andar 800m | +800m de carreira, somente ranking REGIONAL |
| RR-LEAD-001 | mesmo player com runs validas | score e desempates | melhor run por quadro e ordenação estável |
| RR-LEAD-002 | patch major incompatível | publicar versão nova | quadros separados, hall da fama preservado |
| RR-LEAD-003 | run iniciada perto segunda UTC | cruzar semana | regra de edição por start UTC e janela publicada |

## 4. Test IDs — conta, UI e progressão

| ID | Cenário | Resultado obrigatório |
|---|---|---|
| RR-AUTH-001 | primeira visita guest | joga sem cadastro e pode escolher nickname antes de ranking público |
| RR-AUTH-002 | registro email → confirmação → reset | tokens únicos, sessão protegida, e-mails PT/EN |
| RR-AUTH-003 | login Google token inválido ou sub incompatível | rejeitado, nunca mescla pelo e-mail |
| RR-AUTH-004 | guest com Aurora → vincula conta | conquistas/records/cosméticos intactos |
| RR-AUTH-005 | mesclar dois perfis com run duplicada | soma só eventos únicos; merge idempotente |
| RR-SEC-001 | payload com player_id/score/item raro forçado | 403/422 ou ignorado conforme contrato, sem desbloqueio |
| RR-SEC-002 | XSS em nickname/CSRF de perfil | não executa script nem altera recursos |
| RR-WEEK-001 | 2/5 → 4/5 → 5/5 | Bronze/Prata/Ouro únicos e ouro exibido |
| RR-WEEK-002 | semana vira e cron falha | fallback publica uma edição global somente |
| RR-WEEK-003 | 3+ anos sintéticos | desafios diferentes/elegíveis, ano ISO/semana53 corretos |
| RR-COSM-001 | guest inicia Criador | cabelo/rosto/pele básico variáveis e equipáveis sem missão |
| RR-COSM-002 | item raro ainda bloqueado | pode preview mas não equip via API |
| RR-COSM-003 | efeitos e trajes | não modificam combate/score/hitbox |
| RR-I18N-001 | PT/EN, erro de rede, reset e resultado | todas strings traduzidas, fallback EN |
| RR-UI-001 | mobile iOS sem orientation lock | experiência responsiva sem morte injusta |
| RR-UI-002 | menu e Hud com safe-area | controles não escondem inimigos, labels legíveis |
| RR-DATA-001 | retry/queda de worker após escrever subset | não duplicar score, missão ou item |
| RR-OPS-001 | restaurar backup em staging | dados, índices, sessões e versionamento íntegros |
| RR-OPS-002 | pico de runs e API | rate limit/worker budgets preservam saúde do portal |
| RR-PRIV-001 | consultar perfil de outro player | sem email, sessão, segredo, replay privado ou IP |

## 5. Critérios mínimos de pronto para programação

### Gate design G0 — preparar uma única revisão

- Dono do projeto tem uma **lista de baselines** redigida neste pacote; opções de produto já confirmadas não serão reabertas. Alterações em baselines podem ser feitas de uma vez, não por dezenas de perguntas sequenciais.
- Escopo completo v1 e interfaces/entidades cobrem S00–S13, creator, boss, weekly, ranking, auth e os quatro biomas.
- OpenAPI deve passar **validação sintática + lint de $refs**; desenho de migrations/DDL e ERD deve cobrir cada constraint; execução e testes de DB aguardam autorização de código.
- Versões de regras e política de run estão explícitas e consistentes; condições de limites de replay e de upload não contradizem "endless" em gameplay.

### Gate implementação G1 (quando autorizado)

- Core, replay, DB/API e CI reais começam sobre arquitetura definitiva, com testes automatizados.
- Toda tarefa de implementação carrega seu ID de requisito/teste e atualização correspondente da documentação.
- Nenhum serviço fake definitivo em localStorage, ranking aceitando cliente ou janela de curas escondidas.

### Gate produção G2–G4

- Quatro regiões e chefes em completo funcionamento, Creator completo, Ronin ID/Google/email/guest, weekly gerados e tiers, server verifier e ranking em staging.
- Tests acima executados com evidências e dispositivos reais; nenhuma falha P0 aberta.
- Revisão de licenças, LGPD/termos, backups/restauração, Caddy/TLS, SMTP, carga e limites da VPS medidos; rollback possível.
- A publicação pública acontece somente após passar os gates; ainda não há permissão de implementação.

## 6. Pacote final para o Codex e estratégia de trabalho

**Ponto de entrada:** [AGENTS.md](../AGENTS.md) e [handoff](./RONIN_RUNNER_PREPARACAO_CODEX.md). Codex deve percorrer os links das especificações e usar esta matriz.

**Lotes de implementação quando houver autorização (não indicam MVP de lançamento):**
1. Contratos, fixtures, migrations, staging, core determinístico e suites base.
2. Game loop completo, quatro regiões/ciclos, inimigos/chefes, movimento+gestos, telegraph/arte.
3. Ronin ID guest/email/Google e perfis, creator completo, inventário e persistência segura.
4. Replay em streaming/verificação, hall da fama/ranking, progresso, selos e semanais autogerados.
5. QA transversal, performance, UX mobile, dados, backups, deploy e release.

**Não dizer "especificação 100% validada" antes de OpenAPI lint, benchmark de VPS, arte final e playtests.** Dizer "design baseline documentado e rastreável, pronto para uma revisão G0, sem implementação" é a descrição precisa neste estágio.
