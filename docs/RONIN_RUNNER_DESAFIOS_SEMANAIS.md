# Ronin Runner — Desafios Semanais Autogerados (Game Design v0.13)

**Estado:** especificação funcional de pré-implementação; decisões de negócio CONFIRMADAS versus parâmetros PROPOSTOS. **Não programar ainda.**
**Links:** [Especificação principal](./RONIN_RUNNER_SPEC.md) · [Missões e Progressão](./RONIN_RUNNER_PROGRESSAO_MISSOES.md) · [Chefes e Recompensas](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md).

## 1. Decisões CONFIRMADAS

1. **Desafios semanais estarão no lançamento da versão completa** do Ronin Runner e serão **gerados, publicados, contabilizados e encerrados automaticamente**. O proprietário **não deve selecionar desafios manualmente a cada semana**.
2. Funcionam com **visitantes com apelido, contas por e-mail/senha e Google**, associados ao mesmo Ronin ID, inclusive após vinculação segura.
3. **Opcionais**, sem exigir login diário, frequência obrigatória, streaks, pagamento ou participação em dias diferentes; quem quiser deve poder concluir as metas em uma única sessão semanal, se demonstrar habilidade suficiente.
4. Metas são exclusivamente sobre gameplay já existente e verificável: distância efetiva, inimigos comuns, golpes perfeitos, combos, chefe derrotado/retirado (quando necessário), região/ciclo alcançado e partidas sem dano.
5. **Não conferem score de ranking, corações, cura, invulnerabilidade, força, alcance de katana, velocidade, vantagem em saltos ou pontos de partida.** Três vidas iniciais, sem regeneração; abismo fatal.
6. Mesmos desafios e alvos para **todos** os jogadores naquela semana, inclusive convidados, sem variantes personalizadas que prejudiquem fairness ou forcem coleta extra de dados. Manter tradução PT-BR/EN.
7. Sistema **escalável e autônomo**: gerador de calendário, catálogo versionado de templates aprovados, escolha determinística com regras de diversidade e dificuldade, avaliação no backend por eventos **verificados**, monitoramento e fallback seguro em falhas.
8. Arquitetura de versão completa desde o primeiro código. Nada de tarefas temporárias salvas só no navegador ou configuração manual semanal.

## 2. Ciclo semanal global

**Parâmetros propostos**:
- Semana ISO internacional: **segunda 00:00:00 UTC até segunda seguinte 00:00:00 UTC (fim exclusivo)**.
- Identificador estável `week_id=YYYY-Www` (ano ISO da semana, não necessariamente ano civil).
- Uma **edição global** de 5 desafios por semana: 2 acessíveis, 2 intermediários, 1 avançado. Diversidade de categorias e todos com progresso independente; jogadores podem completar 0 a 5 sem obrigatoriedade.
- O servidor publica/ativa na virada semanal, não exige intervenção humana. Pode gerar a próxima semana com antecedência, mas não a torna ativa antes da hora.
- Exibir contagem regressiva e horário local pelo fuso do usuário; por exemplo, o reinício de segunda à meia-noite UTC costuma ser **domingo às 21h de Brasília** (UTC-3). Não rotular essa virada como "segunda-feira 00:00" no horário brasileiro.
- Desafios de uma semana não são alterados após publicação. Alteração corretiva extraordinária exige nova revisão auditável, e jamais muda silenciosamente o alvo de uma missão já publicada.
- Runs iniciadas dentro da semana e finalizadas depois: atribuir à semana de **início autenticado no servidor**, desde que finalizem dentro da janela de graça proposta de **24h após o encerramento**; validar tempo, pausas e replay para evitar manipular começo/fim. Detalhe é proposta a confirmar após testes de sessões muito longas e abuso.
- Resultados `pending_verification` permanecem aguardando, sem conceder prêmio definitivo; uma semana é consolidada após a janela técnica de validação. Mostrar explicitamente data do término e prazo de análise.
- Não usar horário do navegador para definir semana ou crédito.

## 3. Gerador automático com curadoria por regras

**Não gerar missões aleatoriamente por IA ou combinações irrestritas.** Definir **templates versionados, testados e legíveis**, e selecionar automaticamente novas combinações. Nenhuma API paga necessária.

### 3.1 Templates de desafios por categoria

| Categoria | Exemplos de templates (PT / EN via i18n) | Métrica autoritativa |
|---|---|---|
| Exploração | Percorrer N metros acumulados na semana | soma real de `run.distance_verified` |
| Sobrevivência | Percorrer pelo menos N metros em **uma** corrida sem perder vida | melhor `no_damage_distance` por run |
| Precisão | Executar N cortes perfeitos na semana | soma `verified.perfect_slash` |
| Combate | Derrotar N inimigos comuns na semana | soma `verified.enemy_kill` |
| Combo | Conseguir uma sequência de N cortes perfeitos numa corrida | `max_perfect_streak` verificada |
| Jornada | Alcançar região X ou ciclo Y numa Jornada Completa | eventos `region_reached` / `cycle_entered` |
| Chefes | Derrotar boss X, ou derrotar N chefes na semana | `verified.boss_defeated` por instância |
| Mobilidade | Executar N saltos duplos válidos | `verified.double_jump`, limitado por movimento real |
| Resistência | Completar N corridas válidas atingindo distância mínima por run | partidas distintas verificadas, sem permitir spam de runs curtíssimas |

O gerador nunca exige "curar", "ganhar vida", "derrotar chefe obrigatório para avançar", "jogar em dias consecutivos", "entrar com Google", "comprar" ou "desbloquear habilidade de salto duplo" porque tais requisitos contrariam regras definitivas.

### 3.2 Regras de composição

Proposta de alocação automática por semana:
- **2 desafios acessíveis**, elegíveis desde a Floresta e sem chefes/regiões desbloqueadas.
- **2 intermediários** para distância/perfeitos/combate/região, que possam ser tentados iniciando do marco zero.
- **1 avançado** envolvendo habilidade, ciclos ou chefes, mas sem pressupor acesso prévio a ponto regional.
- Cinco **categorias distintas, se possível**, com no máximo um desafio de chefe e no máximo um desafio de corrida sem dano, para evitar monotonia.
- Não repetir mesmo `template_id` nas últimas **4 semanas**; se o catálogo tornar impossível cumprir isso, relaxar a restrição de forma auditável em vez de não gerar semana.
- Não repetir mesmo conjunto de desafios na janela de **12 semanas**, quando possível; persistir fingerprint para checar duplicações.
- Pesos de escolha equilibrados e rotações automáticas por categoria; seleção não necessita curador semanal.
- Uma mesma run pode contribuir a vários desafios, mas cada `run_id` é processado uma única vez por missão.
- Metas numéricas pertencem a **faixas predefinidas por tier e métrica** (ex.: distância acessível 500–2.000 m acumulados na semana, sujeito a playtests). Evitar alvos que exijam horas compulsórias ou somente horários/dias específicos.
- Desafio "região X" não pode ser de tier acessível se depender de chegar ao Castelo; desafios envolvendo chefes devem permitir progresso mesmo com recuo e livre continuidade, apenas não concedem vitória se boss recuar.
- Sem desafio dependente de outro desafio da mesma semana; todos independentes.
- Validação offline pré-publicação: catálogo, traduções, disponibilidade de eventos, regras da física, plausibilidade e capacidade de completar cada missão sem explorar bugs.

### 3.3 Aleatoriedade determinística e versionamento

- O servidor escolhe a partir de `season_seed = HMAC(server_secret, week_id + ':' + generator_version)`, ou algoritmo determinístico equivalente seguro. Não expor `server_secret`.
- Guardar catálogo, `generator_version`, `rules_version`, seed/fingerprint, templates, parâmetros, tradução por chaves, intervalo UTC e `published_at`.
- **Snapshot imutável** do conjunto publicado: novas versões do código não reescrevem semanas passadas.
- Se a geração falhar restrições repetidamente, usar um **conjunto de reserva validado** para aquela semana, com alerta técnico, sem deixar o portal sem desafios ou publicar tarefas impossíveis.
- Fórmula de seleção independente da instância do servidor; o conjunto público é o mesmo em qualquer réplica.

## 4. Escalabilidade e custos

**Separar três tarefas**: (a) geração de definição semanal, quase sem custo; (b) atualização de progresso; (c) entrega de ranking/UI.

- Uma tarefa automática agenda a semana seguinte. **Fallback on-demand:** a primeira API da semana verifica se há edição publicada; se não, tenta gerar por operação idempotente, sem exigir cron ativo para funcionar.
- PostgreSQL `UNIQUE(week_id)` e transação / controle de concorrência garantem exatamente **uma edição global publicada**, mesmo com múltiplas instâncias Fastify.
- Progresso é materializado por `(week_id, player_id, challenge_id)` em agregações incrementais de eventos **verificados**, em vez de varrer todas as partidas a cada leitura.
- Atualização de progresso **idempotente por `run_id` e desafio**; aplicar somente após `verified`, em worker/filas duráveis com retry e deduplicação. Evitar depender de fila externa paga.
- A página busca definições públicas com cache curto e revalidação no fechamento da semana; preferir ETag e índices por `week_id`.
- Recompensas de conclusão são emitidas via transações com unicidade por jogador/desafio/semana; eventos em lotes e replay de fila devem ser seguros contra duplicação.
- Sem tarefas que renderizem assets únicos em lote toda semana. Arte semanal é composição de **assets de selos e bordas reutilizáveis** (paleta/motivo/número semana), ou emblema de perfil gerado no cliente a partir de metadados estáveis.
- Limitar retenção de logs brutos e replays conforme requisitos de auditoria, segurança e privacidade, com arquivamento/expurgo planejados; preservar resumos de conquistas.
- Métricas técnicas: duração da geração, falhas do fallback, edições duplicadas (ideal 0), atraso de verificação, tempo de consulta, backlog da fila, volume de reprocessamento e uso de CPU/RAM/PostgreSQL. Alertar falhas reais, **não exigir operação manual semanal**.

## 5. Recompensas semanais sem economia infinita de itens

**Proposta recomendada para confirmação final:**
- Cada missão concluída acrescenta uma **marca de conclusão** verificável àquela semana, estatísticas de carreira e visual de progresso no Pergaminho do Ronin.
- Ao completar **os cinco desafios** da semana, o jogador ganha um **Selo da Semana** (emblema de perfil puramente cosmético), composto de uma biblioteca fixa de motivos e paletas + texto da semana ISO. Pode ser arquivado no histórico do Ronin ID sem necessidade de artista criar um traje novo semanalmente.
- O jogador pode ostentar **um emblema e um traje**; a biblioteca de selos pode crescer por variações visuais reutilizáveis sem introduzir moeda, loot boxes, compra ou vantagem.
- O Selo da Semana indica participação histórica naquela semana; os mesmos **motivos/bordas/cores podem reaparecer**. Não bloquear uma aparência mecânica exclusiva de forma irrecuperável; emblemas históricos específicos permanecem registros da data, não itens com poderes.
- Recompensas de missões de carreira e chefes seguem independentes. Quatro selos dos chefes => **Traço da Aurora** (confirmado). Concluir desafios semanais **não substitui** requisitos de chefes ou trajes.
- Se cinco objetivos forem considerados exigentes demais em playtest, avaliar meta de conclusão de 3/5 para emblema de semana sem mudar a estrutura de 5 slots.

## 6. Gameplay e fairness

- Sem **multiplicador de ranking** por desafio. Score é o de partida verificada pelo mesmo conjunto de regras para todos.
- Distância semanal considera **metros percorridos de verdade**. Nunca somar distâncias anteriores ao ponto de partida regional.
- A edição pode contar Jornada Completa e Expedições Regionais, **exceto** templates que especificarem modo/ranking; exibir escopo da missão.
- Para todos os modos, eventos só contam se a run for válida e verificada. Chefes que recuam não valem como derrota; gestos/scripts não comprovados não contam.
- Atividades normais dentro de uma mesma run podem avançar vários objetivos, sem dar recompensa duplicada de uma mesma missão.
- Se uma conquista depender de uma única run, sua prova usa somente aquela run, não soma entre dias/partidas.
- Sem bônus de login, sem recuperação de vida, sem tarefas que exijam não pausar ou ficar online sem interrupção (evitar excluir redes móveis instáveis).
- Anti-fraude existente do ranking (seed/ticks/replay) protege as métricas e evita spam de partidas com score forjado.

## 7. Dados lógicos e endpoints (propostos, não contratos finais)

Tabelas/entidades:
- `weekly_challenge_templates`: id/version/tags/metric/eligibility/target_ranges/reward_policy/i18n keys/active.
- `weekly_editions`: unique week_id/start_at/end_at/published_at/generator_version/rules_version/seed/fingerprint/status.
- `weekly_edition_challenges`: edition_id/slot/template_id/target/tier/parameters/definition_snapshot.
- `player_weekly_progress`: player_id/edition_id/challenge_id/current_value/completed_at/verified_at.
- `player_weekly_rewards`: player_id/edition_id/reward_id/granted_at/source_run_id.
- `weekly_run_applications`: player_id/run_id/edition_id/challenge_id/applied_at, unique constraint for dedup.
- `challenge_generation_audits`: outcomes, fallback usage, algorithms, generated/approved hashes.
- `player_profile_emblems`: collection/slot/equip metadata for weekly stamp and other badges.

Endpoints candidatos:
- `GET /weekly/current`, `GET /weekly/archive`, `GET /weekly/me`, `GET /weekly/{week_id}/me`.
- `GET /me/emblems`, `PATCH /me/emblems/equip` (após autenticação da sessão Ronin ID, visitante incluído).
- Edição/criação interna sem endpoints públicos mutáveis; operação idempotente no backend.
- Não expor `seed` secreta ou dados pessoais na resposta pública.

## 8. UX e localização

- Menu/Pergaminho > aba **Desafios Semanais / Weekly Challenges**.
- Mostrar cinco cartões: título, descrição, dificuldade, barra de progresso validado, condição de modo/região, recompensa, tempo restante em fuso local.
- Exibir `pending_verification` em runs ainda não confirmadas, sem mostrar prêmio como já concedido.
- Exibir mensagem clara quando a semana termina, mantendo **histórico consultável** das anteriores; não apagar conquistas.
- Interface não cria pop-ups intrusivos no meio da corrida; notificação de meta cumprida no resultado ou em momento seguro.
- Detectar navegador `pt-BR`/`en`, permitir mudança persistente; traduções de templates **usam ICU/pluralização**, números/unidades locais e formatação correta de datas. Fallback inglês.
- UI mobile horizontal e desktop; não bloquear gestos para visualizar a missão; opção acessível de navegação e contraste.

## 9. Testes automatizados obrigatórios

1. Avanço de semana ISO, ano novo e semana 53 sem erros; datas com DST em clientes e UTC no backend.
2. Concorrência: cem tentativas simultâneas de criar semana => **exatamente uma** edição publicada; sem publicação parcial.
3. Seed/catálogo/generator_version iguais => mesmo conjunto, mesmo fingerprint, em qualquer instância.
4. Restrições: cinco desafios elegíveis, dois acessíveis + dois intermediários + um avançado, diversidade, ausência de impossibilidades, sem curas ou tarefas diárias.
5. Execução automática por meses/anos sintéticos, sem esgotar catálogo nem repetir com frequência indevida. Contingência se catálogo pequeno.
6. Reinício da API, queda do worker, cron indisponível, rede instável e publicação on-demand => semana ativa e logs de alerta.
7. Replays de runs em cada tipo de desafio; progresso acumulado, meta de uma run, chefe recuado vs derrotado, missão regional, precisão e salto duplo.
8. Dupla submissão/retry/corrida válida duplicada não duplica progresso ou selos. Vinculação de visitante a e-mail/Google também não duplica métricas.
9. Runs de virada de semana atribuídas pelo horário de início no servidor e finalização dentro da graça proposta; relógio do cliente nunca decide.
10. Tempo de resposta e capacidade com milhares de jogadores/semana, consumo controlado de memória e índices de PostgreSQL.
11. Um usuário sem completar nada não perde missões permanentes ou trajes já ganhos. Cumprir 5/5 gera **um único Selo da Semana**, exclusivamente cosmético.
12. Verificar traduções PT-BR/EN, fuso exibido, metas claras e acessibilidade mobile.
13. Se edição for invalidada por bug grave, fluxo de correção auditado sem apagar injustamente progressos válidos ou mudar metas silenciosamente.
14. Anti-fraude: ataques fabricados, distância forjada, chefes inexistentes, múltiplos hits por frame e run_id adulterado não geram progresso.

## 10. Parâmetros ainda propostos / decisões para testes

- Confirmação final da **quantidade 5** e distribuição `2 fáceis + 2 médios + 1 avançado`, com metas reais.
- **Selo da Semana** por completar 5/5: proposta, não decisão do usuário; confirmar aparência, nome e requisito.
- Janela de graça de 24 h após segunda UTC para finalizar run iniciada na semana e latência de verificação.
- Catálogo mínimo inicial recomendado de **30 templates** (várias categorias) para comportar semanas e evitar repetição; projeto pode crescer sem alterar o gerador.
- Política de limite/arquivamento de replays e tempo máximo de pausa de runs ranqueadas.
- Versão de regras da física/combate aplicada a desafios publicados no meio de atualização do jogo; garantir replay verificável.
