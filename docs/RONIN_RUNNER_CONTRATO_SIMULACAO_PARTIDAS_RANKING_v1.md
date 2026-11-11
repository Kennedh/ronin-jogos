# Ronin Runner — Contrato de Simulação, Partidas Longas e Ranking (baseline v0.18)

**Propósito:** resolver G01, G02 e G03 da auditoria. **Somente especificação, sem implementação.**  
**Grau de decisão:** `PRODUTO_CONFIRMADO` = escolha explícita do usuário; `BASELINE` = escolha técnica recomendada para o Codex; `TUNABLE` = valor numérico alterável por teste e rules_version; `VALIDAR` = bloqueio de homologação por medição.

## A. Invariantes confirmados pelo usuário

- Mundo contínuo, quatro regiões e ciclos infinitos; mundo não tem último ciclo.
- Primeira partida e toda nova run começam com 3 vidas; **zero cura**, abismo **fatal instantaneamente**, inclusive durante invulnerabilidade.
- Salto duplo universal desde o começo, mobile por gestos, desktop teclado.
- Chefes podem recuar sem encerrar corrida. Sem vitória, **sem bônus/selos de chefe**, mas o jogador segue vivo e sua distância não é perdida.
- Somente Jornada Completa a partir de 0 entra em global all-time e semanal; Expedição Regional possui ranking próprio e só conta metros reais.
- Replays e servidor são autoridade; customização nunca altera física/colisão/score.

## B. Simulação determinística v1 — BASELINE

| Chave | Valor inicial | Contrato |
|---|---:|---|
| `tick_rate` | 60 Hz | tempo competitivo em **ticks inteiros**, render independente |
| `world_units_per_meter` | 40 | distância visual/interna com conversão declarada |
| `numeric_scale` | 1.000 | posições/velocidades de mundo em inteiros de milli-unidade; **não usar bitwise 32 bits** para distância longa |
| `world_speed_initial` | 360 u/s | 9 m/s iniciais na convenção |
| `world_speed_ceiling` | 600 u/s | 15 m/s, com platô; não escalar indefinidamente |
| `gravity` | 2.100 u/s² | calibrar com geração/gestos |
| `jump_impulse` | -750 u/s | salto base |
| `double_jump_impulse` | -670 u/s | salto duplo permitido 1 vez antes de pousar |
| `coyote_ticks` | 5 | ~83 ms |
| `jump_buffer_ticks` | 6 | 100 ms |
| `slide_ticks` | 33 | 550 ms |
| `slide_recovery_ticks` | 6 | 100 ms |
| `attack_windup_ticks` | 4 | ~67 ms |
| `attack_active_ticks` | 7 | ~117 ms |
| `attack_recovery_ticks` | 11 | ~183 ms |
| `perfect_window_ticks` | ±6 | ~±100 ms em relação ao instante ideal telegráfico |
| `hurt_invulnerability_ticks` | 54 | 900 ms, não protege de abismo |

**Cálculo:** converter constantes de projeto para **inteiros por tick** uma única vez no manifest versionado; gravidade, aceleração, posição e velocidade mantêm regra fixa de arredondamento. Não confiar na mesma aproximação de ponto flutuante entre runtimes; usar inteiro seguro JS até `Number.MAX_SAFE_INTEGER` e rotinas que rejeitam overflow. Os valores acima ainda são `TUNABLE` até testes de física, mas os **estados e invariantes** já são contrato.

**Ordem de processamento canônica por tick:**
1. Validar inputs deste tick e estado RUN/PAUSED/DEAD; deduplicar e ordenar eventos pelo tipo.
2. Atualizar buffers/coyote, estados e impulso de salto, início do slide/ataque válidos.
3. Integrar deslocamento fixo, animações lógicas de ataque e inimigos por ticks.
4. Resolver colisões piso/corpo/espada/inimigo por prioridade determinística e eventos idempotentes.
5. **Aplicar abismo fatal antes de avaliar invulnerabilidade de dano comum**; se há morte por abismo não conceder golpe posterior ao tick fatal.
6. Resolver dano, invulnerabilidade, morte por HP, bosses defeated/retreated e avanço região/ciclo.
7. Calcular estado, distância, score e eventos; gerar hash de estado para auditoria de segmento.

**Desempate de ações no mesmo tick:** ataque que estava ativo e toca inimigo ocorre antes de dano comum de colisão se a geometria mostrar interseção válida; uma morte por abismo tem prioridade sobre ataques simultâneos; derrotar chefe no limite do encontro prevalece sobre retirada se hit válido ocorrer dentro do mesmo tick. Testar fixture dessas três bordas.

**RNG:** seed gerada pelo servidor por run; separar fluxos `world`, `enemies`, `cosmetic` de forma que mudanças de partículas não afetem cenário/score. Manter PRNG e hash/manifest fixos por versão. Não gerar padrões impossíveis: restrições de pouso/tempo, slide, alcance da katana e campo de visão mobile são parte do validador de seeds.

**Versões independentes:** `rules_major` (comparabilidade competitiva), `rules_patch` (correção sem alterar score), `generator_version`, `scoring_version`, `replay_protocol_version`, `assets_manifest_version`. Cada run persiste todos os IDs/hashes; **core compartilhado** entre cliente e worker; corrigir simulação exige nova versão compatível ou major.

## C. Corridas longas, pausa e conexão — BASELINE

**Princípio de produto:** *endless* significa sem fase final nem morte compulsória ao alcançar determinada distância. Implementar **streaming de inputs**, não gravar vídeo ou a cada frame de renderização.

### C.1 Protocolo de envio por segmentos

- Novo endpoint proposto `PUT /api/v1/runs/{id}/segments/{index}`, corpo binário compactado (gzip ou formato compacto aprovado), `replay_protocol_version`, start_tick/end_tick, `prev_segment_hash`, `segment_hash`. Metadados em header ou envelope; limite de compressão/descompressão.
- Cliente cria segmento **a cada 60 segundos de tempo ativo de simulação** (3.600 ticks) ou antes de atingir limite de bytes. Envio assíncrono, com retry idempotente; servidor confirma índice e hash aceito, **sem declarar que o conteúdo já foi verificado**.
- Cada segmento armazena os **comandos**, não posições ou score declarados; hashes asseguram encadeamento/identidade do upload, não legitimidade física. Verificador reexecuta segmentos em ordem a partir do primeiro estado/seed, com checkpoints **produzidos e atestados pelo worker**, não assinados só pelo navegador.
- Limite inicial `max_encoded_segment=256 KiB`, `max_decoded_segment=1 MiB`, `max_input_events_per_tick=2` salvo especificação de simultaneidade validada; validar payloads maliciosos.
- Segmentos são gravados em armazenamento durável com índice/UNIQUE(run_id,index,hash); se mesmo index vier com hash diferente, rejeitar e auditar. Commit de resultados só após replay inteiro VERIFIED.
- `POST /runs/{id}/finish` recebe `final_segment_index`, `final_tick` e hash raiz/cabeça do encadeamento, não necessariamente todo replay novamente; transição PENDING e worker valida trecho inteiro.
- **Sem limite de quilômetros ou número de ciclos** pelo motor. Limites de transporte (segmento, armazenamento, tempo máximo de sessão) ficam **declarados, visíveis e monitorados**. Jamais morte por limite de replay.

### C.2 Rede, encerramento e sessão

- Cliente pode continuar localmente durante falha de rede e preservar segmentos pendentes em armazenamento de navegador com **quota explícita e aviso**. `IndexedDB` apenas guarda inputs para recuperação, **não prova** legitimidade.
- Proposta: avisar após 2 minutos desconectado; nunca afirmar que score está salvo em nuvem. Reenviar índices pendentes ao voltar online.
- **Política inicial de run em aberto:** 72 horas de idade máxima no servidor para uma tentativa competitiva, com **aviso claro nas regras/UX antes de começar**; não interromper a simulação por morte. Ao expirar, oferecer encerramento de run não ranqueada e preservar os dados locais que couberem, sem recompensas globais de replay não verificado. `VALIDAR` se limite é realmente necessário sob carga/abuso; permitir ajustar para maior janela por decisão de produto.
- Run já FINALIZADA poderá concluir upload/retry de chunks dentro de **24 h**, se iniciou antes da expiração e integridade e sequência forem verificáveis. Se houver upload incompleto expirar, explicar estado e política de recurso/revisão.
- Sessão expirou no meio da corrida: manter inputs localmente, pedir nova autenticação **do mesmo player_id**, depois reenviar; não reatribuir run a outro visitante.
- Não prometer recuperar run após navegador limpar storage, storage indisponível, troca de aparelho ou perder guest ID; exibir possibilidade e limites.
- `QUIT`: ação de sair termina replay com evento de abandono; se replay do trecho for íntegro pode creditar **estatísticas cumulativas verificadas**, mas **não publica ranking competitivo** de corrida abortada; missões que exigem término válido não contam. `DEAD`: run ranqueável; `BROWSER_CRASH`: não ranqueável sem integridade de fechamento autoritativo.
- Se conexão ficar indisponível por muito tempo, jogador pode optar por continuar como run não ranqueada com aviso explícito; não mudar status silenciosamente.

### C.3 Política de pausa e fairness

- Pausa manual em HUD/Esc e automática em perda de foco, orientação/tela cheia. Pausa **congela tick competitivo**, vidas, inimigos, mundo e score.
- Ao pausar, cena de jogo fica **oculta/embaçada** por overlay não transparente para não usar screenshot como leitura detalhada de ataque futuro. No retorno, contagem 3–2–1 com o mundo ainda imóvel; não consumir vidas/inputs nessa contagem. Render do mundo só retorna ao fim do countdown.
- **Sem limite de quantidade de pausas que cause morte automática**. Política antiabuso baseline: tempo total em PAUSED não conta nos ticks/score nem no desempate, mas entra na idade máxima de 72h da tentativa. Cliente envia eventos de `pause` com motivo e monotonic tick, verificador garante que não são comandos competindo no mesmo tick.
- Pausas podem ajudar reação; o jogo é primariamente de precisão/tempo de ação nos ticks. Se futura competição avançada exigir regra mais estrita, alterar em `rules_major` e sinalizar ao usuário, nunca introduzir penalidade oculta.
- Pausa não cria checkpoints nem recupera corações, concentração, invulnerabilidade ou oportunidade de chefe.
- No mobile um overlay de orientação oferece opção de voltar ao menu sem excluir a run inadvertidamente.

### C.4 Virada da semana e run longa

- Semana global UTC segunda 00:00–próxima segunda 00:00 (fim exclusivo). **Edição semanal vinculada ao `started_at` certificado pelo servidor**, não ao clock do navegador.
- Segmentos podem cruzar a semana; para **semanários**, contar **somente ações com tick cujo horário ativo elegível possa ser atestado dentro da janela**, ou, na baseline simplificada de lançamento, **atribuir todos os eventos à semana do início se a partida terminar até 24h após virada**, regra anunciada aos jogadores. Recomendar **baseline simplificada** por menor custo; não aceitar nova run com start antigo após a virada.
- Se correr além de 24h da virada, ainda pode validar ranking all-time se dentro da validade da run, mas **não gera recompensas semanais da edição já encerrada**. Não perder progresso cumulativo permanente por isso.
- Rankings semanais da Jornada Completa usam `started_at` + run VERIFIED dentro da janela de graça; exibir status 'aguardando verificação' durante consolidação. `VALIDAR` ataques de retenção estratégica e disponibilidade de execução.
- Não expor valor de `server_secret` ou confiar em alteração do relógio cliente.

## D. Score, rankings e mudanças de balanceamento — BASELINE

### D.1 Fórmula canônica v1

`score = 10 × floor(real_distance_m) + 30 × normal_enemy_kills + 100 × perfect_slashes + sum(boss_defeat_bonus)`.

- `real_distance_m` é distância **percorrida** desde início real da run, calculada por deslocamento autoritativo; nunca incluir metros pulados por ponto de partida regional.
- Boss defeat bônus por instância verificada: B01 +300; B02 +450; B03 +600; B04 +900 (todos `TUNABLE` antes do lançamento).
- Boss não soma +30 de inimigo comum por morrer; um corte perfeito de chefe conta apenas uma vez em sua janela legítima.
- Kills/perfects limitados pelo catálogo de spawns versionado e hits uma vez por entidade; antibug com plausibilidade por metros, sem impor cap arbitrário que rejeite jogadas legítimas.
- Missões, selos e cosméticos **não alteram score**. Nenhuma ação durante PAUSED pontua.
- Score calculado em inteiros seguros; quando aproximar limite de precisão `Number`, backend trabalha com `bigint`/inteiros decimais serializados em string no JSON, nunca arredonda sem informar.

### D.2 Desempate e períodos

Ranking por: `score DESC, real_distance_m DESC, active_ticks ASC, verified_at ASC, run_id ASC`. O tick menor só é usado em **desempate exato** e não altera os pontos recebidos. Melhor run verificada por player em cada quadro.

**Quadros:**
- `GLOBAL_ALL_TIME_CURRENT_RULES`: todos os tempos **dentro do rules_major competitivo atual**; nome visível "Recordes — regras atuais" para não insinuar comparabilidade histórica falsa.
- `GLOBAL_WEEKLY`: somente FULL iniciado em 0 m, edição UTC; rotular período local.
- `REGIONAL_{region}_ALL_TIME` e opcional WEEKLY, somente partidas que iniciaram nessa região.
- `HALL_OF_FAME_{rules_major}`: quadros arquivados quando mudanças de regras alterarem comparabilidade; nunca apagar conquistas legítimas.
- **Mudanças patch que comprovadamente não alteram semântica de score/geração** podem continuar no mesmo major se testes de replay/fixtures demonstrarem equivalência; qualquer balanceamento que altere pontuação, padrões, velocidades ou hittiming competitivo exige novo major ou ADR específica de compatibilidade.

### D.3 Confiabilidade e versão de regras

- `rules_major` congelado por run. Atualização de regras no meio da semana **não altera o quadro ativo**: publicar nova major na virada semanal definida (salvo correção crítica de segurança com incidente documentado), deixar runs antigas finalizarem dentro de janela de 72h/24h.
- Conquistas permanentes e cosméticos válidos sobrevivem a mudança de major; leaderboards históricos ficam consultáveis em hall da fama.
- Ao cliente iniciar com manifesto obsoleto, atualização controlada antes de começar run; não forçar refresh e matar run já ativa.
- Ranking de suspeitos pode ficar em `under_review`; não afirmar anticheat perfeito, permitir recurso e trilha de auditoria sem publicar dados privados.

## E. Fixtures e testes para Codex

- Mesmo `run_id`, seed, commands e rules_version => **mesmo estado e hash por tick** em client, Node worker e CI nas plataformas suportadas.
- Testes de fronteira: jump buffer 6 ticks, coyote 5, 2 saltos e terceiro negado, slide33, attack4+7+11, ±6 perfects, i-frame54, abismo fatal.
- Testes de 72h/24h (clock servidor fake), chunks fora de ordem/repetidos/divergentes, limite de compactação, browser offline, sessão trocada, pausa arbitrária e ghost pause.
- Validar morte por HP e abismo em todas as regiões, chefes defeated/retreated, quadruplicação de selo/score inexistente.
- Simular dias de jogo com chunks em streaming e memory bounded; métricas CPU por minuto validado, espaço de armazenamento e backlog.
- Compare rankings major old/current, nova edição semanal, tie-breaker e hall da fama; sem score retroativamente alterado.

**Políticas em C/D são baseline de design escolhida para orientar o Codex, não alegações de que o usuário aprovou números de 72h, 24h ou pausas. Valores `TUNABLE` são ajustados com medição; invariantes do produto nunca mudam sem instrução explícita.**
