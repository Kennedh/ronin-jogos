# Ronin Runner — Plano mestre de testes, lançamento e prontidão (Design técnico v0.16)

**Estado:** PLANO de execução; **nenhum teste deste documento foi executado**. O jogo segue em design; sem código, deploy, migrations ou testes corridos.  
**Documentos relacionados:** [Principal](./RONIN_RUNNER_SPEC.md), [API e persistência](./RONIN_RUNNER_CONTRATOS_API_PERSISTENCIA.md), [Segurança das partidas](./RONIN_RUNNER_SEGURANCA_PARTIDAS.md), [Criador v0.15](./RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md), [Semanais](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md).

## 1. Objetivo e critérios de release

O primeiro lançamento público será a **VERSÃO COMPLETA** do escopo, não apenas protótipo de Floresta. Desenvolvimento pode ser incremental, mas usa desde o início: módulos definitivos de física e replay, banco PostgreSQL, API protegida, identidade e catálogo modular versionados, test fixtures e pipeline de QA. Repetir E2E completo a cada integração significativa e antes da publicação.

**Gate P0 (obrigatório):**
- quatro regiões contínuas, quatro chefes funcionais e que podem recuar, ciclos infinitos com corrupção crescente, gerador procedural capaz de rejeitar blocos impossíveis;
- física fixa, salto duplo inicial, katana/corte perfeito, três vidas sem cura, abismos fatais;
- gestos touch com fullscreen/orientação fallback e teclado, HUD e pausas coerentes;
- Criador de Ronin completo com **cabelo, rosto, tom de pele e cores básicas LIVRES**; roupas/acessórios/katana especiais desbloqueáveis sem buffs; avatar público seguro;
- convidados com apelido e conta e-mail/senha/Google (cadastro, confirmação, reset, vínculo e mesclagem segura);
- ranks FULL global all-time/semanal e REGIONAL em quadros separados, score somente validado;
- progressão e conquistas de chefes; quatro selos liberam Traço da Aurora;
- desafios semanais gerados sem intervenção e selos cosméticos **Bronze 2/5, Prata 4/5, Ouro 5/5**;
- todas as telas e mensagens em pt-BR/en, acessibilidade, privacidade e desempenho por perfil de dispositivo;
- segurança, política de logs, backups/restauração, métricas e rollback.

P0 significa **bloquear lançamento** se quebrado ou sem evidência de teste. P1 inclui problemas de UX visual não bloqueantes que ainda precisam de triagem e correção planejada antes da divulgação; nenhum erro que permita cheat ou perda de conta é P1.

## 2. Rastreabilidade e test IDs

Cada requisito recebe ID `RR-{DOMÍNIO}-{NÚMERO}` com links para:
- arquivo de design e seção;
- DTO e migrations;
- testes unitários, integração, E2E, propriedade e segurança;
- status planejado/implementado/passou/falhou, data da evidência, hash do commit e versão de regras;
- capacidade do dispositivo/ambiente.

Domínios: CORE, PROC, ENEMY, BOSS, AUTH, DATA, LEAD, WEEK, MISS, COSM, UI, I18N, A11Y, PERF, SEC, OPS.

**Exemplo:** RR-CORE-001 = salto duplo desde primeira run → teste simulação (segundo jump sim, terceiro não), teste gesto mobile e teste de replay do servidor. RR-WEEK-001 = tier 2/4/5 → teste de transação/idempotência e tela de perfil.

## 3. Suíte de testes automatizados

### 3.1 Unidade e determinismo

- Core puro, ticks inteiros, RNG por seed, hitboxes, estados locomoção/ataque, perfect slash, concentração, fim por vida e abismo, pausas, boss retreated e resultados.
- Os **mesmos inputs, mesma rules_version e seed** devem produzir o **mesmo checksum/state stream** no navegador e no worker; exigir correspondência exata no mecanismo determinístico, não aproximação de score.
- Testar boundaries em ticks de wind-up, active, recovery, coyote time, jump buffer, i-frames, entrada/saída do deslize e 3→2→1→0.
- Propriedade fundamental: trocar aparência, idioma, FPS gráfico, efeito da katana ou emblema **nunca altera** estados competitivos para o mesmo replay.
- A verificação de score usa o mesmo algoritmo do núcleo, não cálculo paralelo com regras ligeiramente diferentes.

### 3.2 Gerador procedural e fairness de obstáculos

- Geração em massa de seeds por rules_version, modo, região e ciclo (meta de homologação proposta: pelo menos **10.000 seeds por mudança importante**, calibrar custo e cobertura).
- Cada bloco tem pelo menos uma rota de movimentos viável com tempos de reação razoáveis; **verificar também concatenações de blocos**, aterrissagem após segundo pulo e estados de recuperação.
- Incluir telas de larguras e áreas seguras distintas; não aceitar abismo oculto por cenário/efeitos de tinta.
- Variedade permanece interessante com teto de velocidade e densidade nos ciclos IV+, sem padrões impossíveis nem progressão infinita de exigência de reação.
- Simular passagem contínua por quatro regiões, quatro chefes e pelo menos cinco ciclos com observação de memória e score; **não** reiniciar distância/vidas/seed incorretamente.
- Nos encontros de chefe, testes de atravessar apenas esquivando; chefe recua e jogador passa ileso se executou todas as evasões corretamente.

### 3.3 Banco, identidade e APIs

- Migrations no PostgreSQL vazio e atualizado; FKs/UNIQUE/indexes, backup e restauração testada.
- Visitante cria Ronin ID, escolhe apelido, joga, valida score e depois vincula e-mail ou Google sem perder progressão, outfits, emblemas semanais ou Traço da Aurora.
- E-mail: registro, confirmação, reenvio, login/logout, senha perdida, sessão inválida/expirada, mensagens anti-enumeração, teste de entrega e email localized.
- Google: token assinado, aud/iss/exp/sub, CSRF, vínculo com método já existente, não mesclar apenas por mesmo e-mail.
- Duas contas com histórico distinto: `merge/preview` e `merge/confirm` idempotentes com dedup de runs, progresso e cosméticos, opção recusar fusão, prova de posse.
- Moderação de apelido sem vazar PII. Exportação/exclusão/anonimização com requisitos LGPD.
- Testes contrato OpenAPI/DTO, status e mensagens de erros, autorização por usuário/recurso.

### 3.4 Progressão e semana

- Eventos de carreira incrementados **uma vez por run_id**; morte/abandon/expirada/rejeitada não geram crédito indevido.
- Reunir selos dos quatro chefes em runs diferentes: Traço da Aurora desbloqueado exatamente uma vez; derrotar 4 no mesmo FULL: emblema adicional, independente do Traço.
- Recuo de chefe não gera selo/bonus nem bloqueia região; boss kill duplicada, reenvio de run e replay malicioso não duplicam nada.
- Edição semanal única global sob concorrência; 5 missões propostas, duas acessíveis + duas médias + uma avançada, mesmo conjunto para convidados, Google e e-mail.
- 2/5 desafios → Bronze; 4/5 → Prata; 5/5 → Ouro. Se 5/5 em mesmo envio, três tiers concedidos uma vez, maior nível exibido, inventário preservado.
- Simular 3+ anos de semanas, incluindo viradas de ano ISO, semana 53, fuso de Brasília e horário de verão em outros países; sem cron manual e sem catálogo esgotado.
- Sem progresso falso de metros anteriores para expedições regionais; submissão perto da virada semana segue tempo de início **registrado pelo servidor**, com regra de finalização/atraso aprovada.

### 3.5 Criador de Ronin

- Todos os slots **cabelo, rosto, tom de pele, roupas, acessórios e katana**; ao menos variedade de alternativas **básicas livres** desde o começo.
- Bloqueios apenas para cosméticos especiais; backend recusa equipar item não possuído/ID inválido.
- Matriz combinatória com pairwise, casos críticos: cabelo longo+chapéu, máscara+expressão, roupa larga+slide, katana+attack/perfect, efeitos+boss e mobile narrow.
- Run gravada com trajes distintos deve gerar mesmo checksum de simulação, score e ranking.
- Preview de animação e visual original livre de licenças restritivas/cópias; textos em catálogos localizados.
- Mudança concorrente em dois dispositivos respeita appearance_version e não elimina atualizações.

### 3.6 Segurança, abuso e custos

- Ataques por score fake, teleporte, skip de seed, boss fabricated, vida extra, múltiplos hits/tick, versão de regras desatualizada, run duplicada, sessão alheia, idempotency bypass.
- CSRF, XSS apelido, mass assignment, BOLA/IDOR, brute force, reset token leak, login Google inválido, header manipulation, payload gigantesco/zip bomb.
- Vetores DoS: milhões de contas guest, geração simultânea de semana, saturação de filas worker, long runs, uploads massivos, consultas frequentes ao ranking e conexão de banco exaurida.
- Reconhecimento explícito: replay detecta **impossibilidade física**, não necessariamente bot que joga inputs válidos. Recurso de revisão e moderação separado.
- Testes de carga realistas com limite de CPU/RAM/disk observado na VPS; work queue concorrência parametrizada. Nunca lançar sem saber o efeito da carga.

## 4. Matriz E2E de jornadas reais

| Caso ID | Perfil e dispositivo | Passos | Critério |
|---|---|---|---|
| E2E-01 | visitante desktop | iniciar → jogar FULL → morrer → resultado → ranking | score verificado, apelido e 3 vidas sem cura |
| E2E-02 | visitante Android | menu → preparar paisagem/fullscreen → swipes → boss recua → ciclo | nenhuma ação falsa, progresso preservado |
| E2E-03 | Safari iPhone | negar fullscreen/orientation → gesto → pausar/foco → continuar | fallback imersivo sem morte injusta |
| E2E-04 | conta e-mail | cadastrar → receber email → confirmar → entrar → trocar dispositivo | identidade e progresso sincronizados |
| E2E-05 | conta Google | login → reconectar → vincular conta e-mail existente com prova | sem fusão automática por e-mail |
| E2E-06 | visitante com progresso | ganhou Traço Aurora e Ouro semanal → vincula conta | inventário íntegro e idempotente |
| E2E-07 | regional desbloqueado | inicia Templo → percorre 800 m → encerra | +800 carreira, só ranking regional |
| E2E-08 | criador livre | muda cabelo, rosto, pele, cor, roupa base e katana | válido sem pagar ou cumprir missão |
| E2E-09 | traje especial bloqueado | preview → tentativa de equip API | servidor recusa sem perder perfil |
| E2E-10 | chefe ao fim da região | não ataca, esquiva → boss retreat | ganha região, sem boss award nem penalidade |
| E2E-11 | múltiplos ciclos | 4 regiões e chefes, 5+ ciclos, partida longa | sem leak, ritmo justo, no heal |
| E2E-12 | semana UTC | 2/5 → 4/5 → 5/5; trocando idioma | três níveis idempotentes, horário correto |
| E2E-13 | queda rede | run offline temporária, reconnect, finish | pendente até verificação, sem claim falso |
| E2E-14 | API sob carga | fila de verificação atrasada | 202 com status correto, sem perder job |
| E2E-15 | perfil privado | ranking/consulta pública | nenhum e-mail, sessão ou detalhe privado exposto |

## 5. Dispositivos, rede e acessibilidade

**Classes (não modelos obrigatórios):** desktop médio em Windows/Linux; Android básico/intermediário/alto; iPhone Safari recente, navegador desktop Chrome/Firefox/Edge e Safari compatíveis. Medir portrait menus, landscape gameplay, proporções 16:9 e 19.5:9, notches, DPR, toque, 30/60/90/120 Hz quando disponíveis.

**Rede:** boa, alta latência, oscilante, offline no start, offline durante a run, reconexão antes/depois de finish, interrupção após upload e antes de resposta 202.

**Acessibilidade:** alternativa a gesto, contraste, redução de flashes/movimento, distinção não apenas por cor, controles de som, áreas clicáveis, leitura de erro e i18n pt-BR/en com expansão de texto e formatos locais.

**Performance:** metas precisam ser medidas/ajustadas por classe. Objetivo inicial: 60 FPS visual em aparelhos capazes, fallback para 30 FPS visual quando necessário, simulação fixa de 60 ticks/s independente do gráfico; evitar stutter perceptível e crescimento contínuo de memória durante corridas longas. Registrar p50/p95 do frame, CPU por replay, TTI de menus, tamanho de bundle/asset, consumo VRAM/RAM, tamanhos de DB e p95 de APIs. Fixar limites numéricos de performance **somente após baseline em dispositivos alvo e capacidade da VPS**.

## 6. Homologação de arte, licenças e identidade

- Todos os quatro biomas (vivo/corrompido), chefes, animações da katana, gerador de obstáculos e catalogo modular precisam de assets finalizáveis e rastreáveis.
- Registrar licença de bibliotecas, fontes, efeitos e sons; evitar licenças restritivas inesperadas e material protegido copiado de outros jogos.
- Verificar que combinações de personagem têm silhueta legível e não encobrem golpes/abismos.
- Textos fora das imagens e traduzíveis PT-BR/EN. Assets não podem codificar uma só língua no desenho.
- Qualidade adaptável em aparelhos modestos sem eliminar telegraph e indicadores de dano.

## 7. Integração, CI e ambientes (proposta)

- Repositório com pacotes separados para web UI, client game, shared deterministic core, API, verifier worker e schemas/client SDK, cada um com dependências fechadas e testes.
- CI em PR executa format/typecheck, linter, unit, propriedade subset, contratos, migrations, testes de segurança estáticos/dependências e snapshots visuais subset; nightly executa mass seeds, E2E device automation, long soak e carga.
- **Ambiente staging isolado**: PostgreSQL separado, segredos diferentes e dados sintéticos; nunca usar e-mails ou contas reais em testes de segurança/carga. Nenhum fluxo de staging pode inserir score no ranking de produção.
- Merge para main sob branch protection, revisões e resultados. Deploy preview/staging permite QA, rollback de binário/migration segura e preservação de dados.
- Publicação em VPS por Caddy/HTTPS, com observabilidade, rate limits, workers com quotas, backup e restore testados. Política de alerta e recuperação de indisponibilidade.
- Automatizar geração semanal em staging ao simular períodos, sem precisar aguardar semanas reais para testar.

## 8. Gates de decisão e aceite

**G0 — Design congelado:** produto define números finais em aberto (catálogo de peças, versões físicas, pausas, metas semanais, política de scoreboard e retenção). Toda função mapeada a DTO/tabelas e teste; nenhuma contradição documental.

**G1 — Contratos e base testáveis:** schema, OpenAPI, core deterministic, fixture replay, migrations, autenticação e pipeline de CI em arquitetura definitiva. Sem mini-MVP descartável.

**G2 — Integração do escopo completo:** quatro regiões, quatro chefes, ciclos, criador modular, missões, semanários, login triplo e ranking funcional em staging, todos com testes automatizados.

**G3 — Segurança/performance:** simulador contra cliente/replay; testes de abuso e saturação, restauração DB, internacionalização/acessibilidade e UX mobile. Defeitos P0 resolvidos.

**G4 — Go/No-Go de produção:** feature complete + zero falhas P0 abertas; métricas abaixo de limites aprovados por classe; ambiente de produção seguro; backups, alertas e rollback; licença auditada; privacidade publicada; owner de plantão e procedimento de moderação/recurso de ranking.

**G5 — Pós-lançamento:** acompanhar métricas, falhas/filas, fraude, UX/retorno de usuários; fazer tuning somente com rules_version, nunca mudar silenciosamente uma seed/ranking em andamento.

## 9. Riscos e pontos explicitamente em aberto

1. Política de partidas longas/replays grandes: limite de duração, checkpoint verificado, armazenamento e custo CPU.
2. Prazos de pausa e reconexão em partidas ranqueadas; evitar exploração e penalização de jogadores mobile.
3. Ajuste final da física (saltos, attack window), boss encounters, tempo de reação e limites de speed.
4. Catálogo mínimo e número de itens do criador (categorias já confirmadas e base livre).
5. Alvos exatos dos 5 desafios semanais e tempo de graça na virada, emblema temático final.
6. Regras de mudança de score e preservação dos recordes após atualização de physics.
7. Políticas de apelido, privacidade de perfil, moderação, exclusão/anomização e retenção de PII.
8. Capacidade real da VPS (CPU/RAM/disco), disponibilidade de SMTP e meta de simultâneos (decidir depois de medir); não presumir capacidade infinita.
9. Requisitos de acessibilidade específicos a serem aprovados com usuários reais.
10. Requisitos de comparação de ranking de convidado ou bot suspeito e política transparente de revisão.

**Nenhuma etapa acima representa implementação ou teste efetivamente executado.** Documento preparado para orientar o Codex quando o usuário autorizar começar.
