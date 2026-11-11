# Ronin Runner — Guia de handoff para Codex e pendências de decisão (v0.16)

**ESTADO DO PROJETO: PLANEJAMENTO. NÃO IMPLEMENTAR NESTA ETAPA.** Este guia prepara o futuro início de desenvolvimento com escopo total, sem criar código, issues artificiais ou arquitetura descartável. **Auditoria v0.17 de lacunas para fechamento:** [RONIN_RUNNER_AUDITORIA_ALINHAMENTO_CODEX.md](./RONIN_RUNNER_AUDITORIA_ALINHAMENTO_CODEX.md). **Entrada automática para Codex no repositório:** [AGENTS.md](../AGENTS.md).  
**Leitura obrigatória, nesta ordem:**
1. [Escopo consolidado](./RONIN_RUNNER_SPEC.md)
1a. [Auditoria de lacunas/ordem de fechamento v0.17](./RONIN_RUNNER_AUDITORIA_ALINHAMENTO_CODEX.md)
2. [Movimentação/combate](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md)
3. [Inimigos/chefes/obstáculos](./RONIN_RUNNER_INIMIGOS_CHEFES_OBSTACULOS.md)
4. [Chefes e recompensas](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md)
5. [Missões e progressão](./RONIN_RUNNER_PROGRESSAO_MISSOES.md)
6. [Semanais autogerados](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md)
7. [Interface e autenticação](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md)
8. [Criador modular e animações](./RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md)
9. [Contratos API e DB](./RONIN_RUNNER_CONTRATOS_API_PERSISTENCIA.md)
10. [Segurança, replays e anticheat](./RONIN_RUNNER_SEGURANCA_PARTIDAS.md)
11. [Matriz de testes e lançamento](./RONIN_RUNNER_TESTES_LANCAMENTO.md)

## 1. Decisões de produto FECHADAS — Codex não deve reabrir

- Versão pública inicial terá todo o conteúdo e serviços planejados; construir incrementalmente **na arquitetura de produção**, não MVP limitado à floresta.
- Phaser 4 + TypeScript + Vite; Node Fastify API, PostgreSQL, Caddy/VPS, pacote determinístico compartilhado e validador worker.
- Corrida lateral automática em **quatro regiões contínuas**, ciclos com corrupção crescente, início regional desbloqueável com quadro REGIONAL separado de FULL.
- 3 corações por partida, **nenhuma recuperação de vida**, abismo fatal. Salto duplo universal desde a primeira run.
- Controles mobile principais por gestos, paisagem, fullscreen solicitado se possível, fallback responsivo; teclado no desktop.
- Chefes em todas as regiões **podem recuar sem encerrar corrida**; vitória opcional e recompensada. Quatro selos de chefes liberam efeito de katana **Traço da Aurora** permanente.
- Missões permanentes e desafios semanais globais autogerados sem trabalho manual semanal, **selos Bronze 2/5, Prata 4/5 e Ouro 5/5** puramente cosméticos.
- Ronin ID: visitante com apelido, e-mail/senha e Google **desde o lançamento**; recuperar/vincular identidade sem perder progressão.
- Ranking mundial e semanal FULL, regional separado, guest elegível; pontuação só de runs verificadas.
- Criador de Ronin **completo e modular**: cabelo, rosto, tom de pele, roupas, acessórios e katana. **Aparência básica LIVRE desde o começo**, inclusive visitante. **Cosméticos especiais DESBLOQUEÁVEIS** jogando. Sem buffs por item.
- **PT-BR/EN** obrigatório e persistente em todas as telas, metas, e-mails e mensagens.
- Assets próprios/licenciados, estilo artístico japonês sumi-e/aquarela; não copiar IP alheia.

## 1.1 Auditoria e estado do repositório — v0.17

A revisão atual verificou que o repositório contém **documentação e diretórios de preparação** (em `src/` e `public/`), mas **nenhum código do jogo**. A matriz de lacunas [G01–G15](./RONIN_RUNNER_AUDITORIA_ALINHAMENTO_CODEX.md) é a fila de especificações faltantes; não duplicar planejamento antigo, não transformar PROPOSTO em CONFIRMADO e não começar a programar neste turno. O arquivo [AGENTS.md](../AGENTS.md) é o ponto de entrada automático para o Codex.

O pacote de handoff estará **pronto para executar** quando: G01–G05 e G12–G15 estiverem congelados em contratos/ADRs, G06–G11 tiverem inventários e parâmetros TUNABLE aceitos e G14 fornecer rastreabilidade de teste. A arquitetura final pode ser implementada por etapas, mas **a versão pública completa** mantém todas as funcionalidades já confirmadas.

## 1.2 Especificações consolidadas para handoff v0.18

O conjunto G01–G15 agora tem cobertura de design com defaults: [simulação, pausas, replays e ranking](./RONIN_RUNNER_CONTRATO_SIMULACAO_PARTIDAS_RANKING_v1.md); [Ronin ID, dados, privacidade](./RONIN_RUNNER_CONTRATO_IDENTIDADE_DADOS_PRIVACIDADE.md); [catálogo visual, biomas, telas e desafios](./RONIN_RUNNER_ARTES_TELAS_CATALOGO_CONTEUDO_v1.md); [VPS, DNS sugerido, portal e operação](./RONIN_RUNNER_OPERACAO_VPS_PORTAL_TESTES_v1.md); [OpenAPI draft v1](./openapi.ronin-runner.v1.yaml) e [matriz de aceite/testes](./RONIN_RUNNER_MATRIZ_ACEITE_E_EXECUCAO_v1.md).

**Não confundir design documentado com implementado ou validado**. Contratos ainda precisam de lint/formalização de migrations, medições da VPS, playtests, produção artística, testes reais e revisão G0. Valores de política e tempo são baseline de orientação, não decisões explícitas do usuário; usuário mantém autoridade. O projeto segue sem código do jogo. `AGENTS.md` foi atualizado com precedência e instrução de não programar.

## 2. Escolhas técnicas ainda PROPOSTAS — não assumir aprovação automática

- Quantidade de opções/peças iniciais do criador, arte final, estrutura 2D por rig ou spritesheets híbridos e paleta exata.
- Catálogo numérico de missões e trajes extras, valores de física e hitboxes, limites de timing e pontuação.
- Tempo de pausa e reentrada, tamanho máximo de replay e política de partidas longas.
- Política de duração/versão de leaderboard e compatibilidade de scores entre patches.
- Concessão de progresso de uma run abandonada/interrompida e prazo de reenvio de replay.
- Limiares de rate limit, retenção, índices, DTOs completos e métricas de capacidade efetiva da VPS.
- Semana ISO UTC, 5 desafios com distribuição 2/2/1 e targets: base proposta para 2/4/5, sujeita a validação de UX/metas.
- Framework da interface de menus (HTML/CSS e componentes, React ou alternativa), desde que bundle e i18n sejam adequados.
- Política de anonimização de conta excluída no ranking, moderação de nickname, tratamento de menores e divulgação LGPD.

**Aviso:** estes itens devem virar ADRs/decisões claras antes de congelar contratos de código, mas não justificam reconstruir design do zero.

## 3. Sequência sugerida quando o usuário AUTORIZAR programar

1. Fechar ADRs pendentes, diagramas de estados, contratos OpenAPI 3.1, modelo ER e regras versionadas; preparar banco/ambiente de testes.
2. Estruturar monorepo ou pacote compartilhado com módulos finais de domínio: core determinístico, gerador, cliente Phaser, web UI, API Fastify, worker verifier, catálogo visual, schemas e tests.
3. Criar pipeline CI e staging, credenciais protegidas, migrations, fixtures de replay e testes de API e auth, com separação rigorosa produção/staging.
4. Construir vertical slice de gameplay já usando core/DB/API/anticheat definitivos para validar física, render e latência; não chamar isso de produto público mínimo nem reduzir escopo da release.
5. Completar quatro regiões, chefes, variações de ciclos e assets 2D; provar sequência possível para diversas seeds e velocidades.
6. Concluir criador modular, animações compatíveis e todas as telas; convidado/e-mail/Google e vinculação de progresso.
7. Missões, selos, Traço da Aurora, edições semanais autogeradas, Bronze/Prata/Ouro e rankings; automatizar reconciliação e suporte a run PENDING.
8. Homologação com dispositivos reais, segurança, stress da VPS, soak de corridas longas, acessibilidade, licenças e idiomas; publicar só após gates G0–G4 do documento de testes.

**Não começar com** login fake permanente em localStorage, leaderboards calculados em navegador, score enviado sem replay, rig de sprite descartável, mundo apenas da floresta sem gerador final, scripts semanais que exigem intervenção humana, ou personagens com hitboxes diferentes.

## 4. Condições para iniciar Codex

- Usuário expressamente autoriza programação.
- Contratos propostos de v0.16 revisados para não haver discordância entre documentos.
- Ambientes, limites e políticas de segurança documentados; jogos usam as mesmas rules_version, IDs e schemas.
- Backlog completo do lançamento é dividido em tarefas pequenas com critérios de teste, porém nenhuma funcionalidade prevista passa a ser "futura" só porque sua etapa chega depois.
- Recurso solicitado fora do escopo de v0.16 requer atualização formal da especificação e nova decisão.

## 5. Critérios de qualidade e proteção ao longo da implementação

- Cada PR inclui testes relacionados e atualiza docs quando mudar contrato; nunca alterar silently score/version.
- Nunca salvar senhas/tokens/segredos ou dados de produção no repositório.
- Cada visual modular precisa de teste de animações e igualdade da simulação; assets não alteram movimento autoritativo.
- Todo código de autenticação, conta e progresso valida player_id da sessão e autorização por recurso.
- Toda concessão de missão/selo/traje vem de run VERIFIED, com transações e idempotência.
- Números de performance só são considerados aprovados após medir a VPS e dispositivos; replay verificável é exigência P0.
- Respeitar limite explícito de **não programar** no estado atual.

**Próxima revisão de planejamento:** G0 — decidir parâmetros numéricos, política de runs longas/pausas, catálogo mínimo do criador, retenção do replay, evolução do placar por rules_version e capacidade real da VPS. Só então iniciar desenvolvimento quando usuário pedir.
