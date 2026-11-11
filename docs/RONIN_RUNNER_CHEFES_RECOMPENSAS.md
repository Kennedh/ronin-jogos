# Ronin Runner — Encontros de chefes, retirada e recompensas (Game Design v0.11, revisado em v0.12)

**Estado:** design revisável antes da implementação; regras em “Confirmado” são decisões do produto, parâmetros marcados “proposto” precisam de balanceamento.  
**Referências:** [Especificação principal](./RONIN_RUNNER_SPEC.md) · [Movimentação e combate](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md) · [Inimigos e obstáculos](./RONIN_RUNNER_INIMIGOS_CHEFES_OBSTACULOS.md) · [Missões e progressão v0.12](./RONIN_RUNNER_PROGRESSAO_MISSOES.md).

## 1. Regras confirmadas — contrato do produto

**Decisão v0.12 CONFIRMADA:** a recompensa por reunir os quatro selos é o efeito **Traço da Aurora** para a katana. É uma personalização permanente e puramente cosmética, independente do traje, obtida uma única vez por Ronin ID após quatro vitórias contra os quatro chefes (podem ocorrer em partidas diferentes). Os critérios e a persistência completos estão em [progressão v0.12](./RONIN_RUNNER_PROGRESSAO_MISSOES.md).

1. O jogo terá **quatro chefes temáticos**, um próximo do fim de cada região, em todos os ciclos.
2. **Chefes PODEM RECUAR, e a corrida SEMPRE CONTINUA** quando acaba o encontro e o personagem está vivo. Derrotá-los **não é requisito** para desbloquear a próxima região ou ciclo.
3. O jogador pode escolher **apenas esquivar** dos ataques e seguir correndo; não é obrigado a atingir o chefe.
4. Derrotar um chefe concede recompensa de pontuação e progresso de missão/conquistas; **não derrotar não reduz a pontuação nem impõe penalidade**, apenas deixa de conceder o bônus de vitória.
5. Nenhum chefe cura, concede corações, revive, concede escudo ou remove dano; há **três vidas iniciais, sem recuperação**, e abismos continuam fatais.
6. Chefes não pausam a corrida, não exigem novas teclas ou gestos, não criam tela de combate isolada, nem bloqueiam o avanço em um portão até a vitória.
7. Toda instância tem oportunidades de ataque limitadas e registradas; o chefe não permanece em tela indefinidamente se o jogador falhar.
8. Repetições em ciclos seguintes criam novas instâncias legítimas; a mesma instância nunca concede recompensa duas vezes.
9. **Versão completa já no lançamento:** encontros e recompensas reais dos quatro chefes, nos estados vivo/corrompido; nada de chefe representado só por placeholder na versão pública.
10. Interface e nomes de chefes, avisos, missões e conquistas localizados **pt-BR/en**, com a preferência do Ronin ID.

## 2. Fluxo de encontro em uma corrida infinita

**Estados determinísticos do encontro:** `SCHEDULED -> WARNING -> ENTERING -> ACTIVE -> DEFEATED | RETREATED -> EXITING -> COMPLETED`.

- O diretor reserva um corredor de encontro perto do fim da região, com começo/fim estabelecidos por distância percorrida e rules_version, não por FPS.
- O aviso usa silhueta do chefe, um som/efeito característico e texto localizado, sem obscurecer abismos ou inserir animação que bloqueie controles.
- O chefe acompanha o jogador no enquadramento conforme lógica de câmera, mas a distância total continua avançando de forma normal.
- O diretor alterna ataques telegráficos e **janelas de vulnerabilidade** (fases de aproximação, recuo e recuperação).
- Cada ataque pode ser evitado **sem receber dano** com os controles padrão; nenhuma janela exige corte perfeito para sobreviver.
- **Vitória antecipada:** atingiu a quantidade de acertos válidos -> chefe morre, bônus registrado, libera corredor de saída até marcador de região.
- **Retirada:** oportunidades ou trecho do encontro se esgotaram sem a derrota -> chefe recua em animação breve; jogador mantém vidas, pontos, distância e concentração atual, depois continua para a região seguinte.
- **Morte do ronin:** três vidas esgotadas ou abismo fatal -> `RUN_FAILED` e resultado normal, mesmo durante luta.
- Se jogador faz último acerto exatamente no limite de retirada, a máquina de estados aplica uma prioridade única documentada por tick, evitando derrota/retirada simultâneas e recompensa dupla (proposta: resolver acertos válidos antes de validar o fim do trecho no mesmo tick).

### 2.1 Encontros base por distância (PROPOSTA para testes)

Métrica global inicial: 40 unidades de mundo = 1 metro exibido. Velocidade sugerida: 9–15 m/s. Para reduzir divergência entre durações reais, programar ataques por posições relativas dentro do trecho, não timers arbitrários de renderização.

| Região / chefe | Início aproximado | Faixa de encontro | Oportunidades de ataque | Acertos necessários | Bônus por derrota |
|---|---:|---:|---:|---:|---:|
| Bambu — Raiz Negra | 1.200 m | 240 m | 4–5 | 3 | +300 pts |
| Templo — Guardião do Sino | 3.140 m | 300 m | 5–6 | 4 | +450 pts |
| Montanhas — Espírito da Nevasca | 5.580 m | 360 m | 6–8 | 5 | +600 pts |
| Castelo — Senhor do Eclipse | 7.520 m | 420 m | 7–9 | 6 | +900 pts |

- Os inícios consideram regiões terminando em 1.500, 3.500, 6.000 e 8.000 m, deixando ~60 m de corredor de saída seguro após cada encontro.
- Distâncias **se referem ao primeiro ciclo**. Em ciclos subsequentes, aplicar deslocamento `8000 m × (cycle_index - 1)`.
- Comprimentos e oportunidades de ataque **são parâmetros de teste**: validar se realmente há tempo de esquivar, atacar e perceber telegraphs em todas as velocidades.
- Sem surpresa: a última transição do encontro e o início da região seguinte devem preservar ângulos de câmera, plano do chão e legibilidade.
- Atacar não diminui a velocidade do mundo; nenhum golpe do chefe pode causar empurrão inevitável em abismo.

## 3. Comportamentos e contrajogadas

**B01 Raiz Negra — Floresta**
- Raízes baixas: pular; galho alto: deslizar; abrir núcleo vulnerável: golpe normal/perfeito.
- Telegraph: folhas sacodem e raiz se desloca antes do ataque; aviso auditivo suplementar.
- Feedback ao derrotar: raízes se desfazem em tinta, vegetação floresce cosmeticamente.

**B02 Guardião do Sino — Templo**
- Onda sonora alta: deslizar; impacto baixo no piso: saltar; braço estendido após golpe: contra-ataque.
- Telegraph: sino vibrando e braço levantado; não depender exclusivamente do áudio.
- Efeito de purificação: símbolos de tinta clareiam, sem regeneração.

**B03 Espírito da Nevasca — Montanhas**
- Rajada alta: deslizar; fragmentos baixos: saltar; aproximação aérea: golpe enquanto no ar, inclusive com salto duplo.
- Telegraph: direção e altura visíveis antecipadamente; neve não encobre a borda de abismo.
- Correntes de vento visuais não alteram física do jogador sem aviso e validação.

**B04 Senhor do Eclipse — Castelo**
- Corte baixo: pular; arco alto: deslizar; investida frontal: evitar e contra-atacar em janela anunciada.
- Telegraph: poses de guarda e rastro da lâmina; padrões de sequência estáveis por seed, com variação nos ciclos.
- Morte: grande purificação visual da tela, seguida da Floresta do ciclo seguinte; **corrida não termina**.

## 4. Pontuação, risco e recompensa (valores PROPOSTOS)

Pontuação básica permanece `P_base = 10×distância_percorrida_m + 30×inimigos_comuns_derrotados + 100×cortes_perfeitos`.  
Com chefes: `P_total = P_base + soma(bonus_derrota_chefe_por_instância_verificada)`.

- Acerto normal/perfeito no chefe pode aumentar concentração e contagem de cortes perfeitos com as mesmas regras de timing do jogo.
- **Não contar morte de chefe como "inimigo comum derrotado"** na parcela +30, para impedir premiação dupla; contar separadamente em `bosses_defeated`.
- **Um único corte perfeito por oportunidade/hit registrado**; não permitir que um golpe gere pontos repetidos por múltiplos frames de overlap na mesma hitbox.
- Acertar parcialmente e deixar o chefe fugir não dá bônus de vitória; os cortes perfeitos legítimos ainda recebem seus pontos normais.
- **Retirada não dá penalidade de score, distância, vida ou progresso:** apenas nenhum bônus de vitória. Os golpes normais do chefe continuam podendo causar dano se não forem evitados; retirada em si não causa dano.
- Bônus de derrota fixo por tipo de chefe, sem multiplicador ilimitado por ciclo, para manter distância como elemento dominante. Quatro vitórias somam +2.250 pontos no primeiro ciclo frente a +80.000 pontos por 8 km, antes de inimigos e perfects (aproximadamente 2,8% da pontuação por distância).
- Derrotar chefes em **Expedição Regional** concede pontos só à classificação regional correspondente, nunca ao ranking mundial da Jornada Completa; nenhum bônus de regiões puladas.
- Mudanças futuras de valores exigem `rules_version`, testes de regressão e política de preservação de marcas históricas.

## 5. Recompensas permanentes e conquistas (sem moedas na V1)

| Evento | Recompensa inicial PROPOSTA | Repetível? |
|---|---|---|
| Primeira derrota da Raiz Negra | Conquista "Raízes Rompidas" + selo do Bambu no Pergaminho | Não, por Ronin ID |
| Primeira derrota do Guardião do Sino | Conquista "Sino Silenciado" + selo do Templo | Não |
| Primeira derrota do Espírito da Nevasca | Conquista "Vento Dominado" + selo das Montanhas | Não |
| Primeira derrota do Senhor do Eclipse | Conquista "Eclipse Dissipado" + selo do Castelo | Não |
| Reunir quatro selos | **CONFIRMADO:** conquista "Guardião das Quatro Trilhas" + efeito cosmético permanente de katana **"Traço da Aurora"** | Não |
| Derrotar todos os quatro na **mesma Jornada Completa**, sem morrer antes | Conquista difícil "Lenda do Caminho" e emblema especial de perfil | Uma vez |
| Derrotar chefe em novo ciclo | Pontos normais da instância + progresso de estatísticas/missões acumuladas | Sim, uma vez por instância |
| Deixar chefe fugir | Sem penalidade; progresso de distância e ações válidas permanece | N/A |

- Selos e conquistas são **decorações do perfil**, não moedas compráveis. Não introduzir loja ou moeda por enquanto.
- Trajes iniciais já previstos permanecem: Ronin Errante, Sombra da Névoa e Corte Silencioso. O rastro da katana é uma recompensa estética **separada de traje**, sem mudar o alcance ou a física.
- Recompensas são creditadas pelo backend após verificação de partida válida. Não depender de `localStorage` para itens conquistados.
- Primeiro desbloqueio de região continua baseado em chegar à região, **não em matar seu chefe**.
- Os 4 selos podem ser conquistados em sessões distintas, incluindo Expedições Regionais **que o jogador já tenha desbloqueado legitimamente**. A conquista "Lenda do Caminho" exige a Jornada Completa começando do zero.
- Se o usuário migrar visitante→Google/e-mail, conciliar selos por identidade interna e eventos únicos, sem duplicar.
- Trajes, selos e rastros mantêm hitboxes, dano, vidas, concentração e velocidade idênticos.

## 6. Progressão, repetição infinita e proteção contra farm

- Uma instância por `(run_id, cycle_index, region_id, boss_id)`; a chave de evento evita dupla contagem e reaplicação de conquistas.
- As quatro regiões reaparecem por ciclo. O mesmo chefe volta com conjunto/ordem de ataques mais difíceis **dentro de um teto**, mas ainda é possível passar sem derrotá-lo.
- Recompensas de **primeira vitória** são concedidas somente uma vez por jogador por chefe. Bônus de score é por instância válida, não pelo mesmo chefe recarregado/respawn na mesma posição.
- Seeds e regras de encontro são determinadas pelo servidor; cliente não escolhe boss, ciclo ou seed competitivo.
- Pausa/reconexão não reinicia chefe nem abre janela de vulnerabilidade extra.
- Se o jogo perde foco, pausar a simulação de forma consistente, conforme política competitiva de duração de pausa definida antes do lançamento.

## 7. Comportamento do mundo e HUD durante os chefes

- Intercalar chefes nos espaços reservados com **piso seguro**; opcionalmente perigos de terreno simples dentro do padrão se realmente testados como solucionáveis.
- **Não inserir abismos dentro das arenas de chefe no primeiro conjunto de regras**: preservar o caráter fatal dos abismos no restante do mundo, mas priorizar clareza de pulo/deslize/ataque durante chefes. Uma opção posterior exige aprovação e novos testes, sem substituir o escopo completo de quatro chefes.
- HUD mostra distância, 3→2→1→0 corações, barra de concentração, energia do chefe e indicador de oportunidades restantes, sem bloquear o campo de visão mobile.
- Mostrar aviso de retirada visual ("O chefe se retirou"/"The boss retreated") discreto; nunca uma tela de fracasso de corrida.
- Tela de resultado diferencia `boss_defeated`, `boss_retreat`, `run_failed` e apresenta bônus de cada chefe após verificação pelo servidor, sem prometer pontos antes de validação.
- Telas/locução localizadas PT-BR/EN: nome do boss, ataque, derrota, retirada, conquistas, selos, descrição do rastro cosmético.
- Efeitos de corrupção e purificação não podem ocultar telegraphs, abismos ou elementos essenciais do HUD.

## 8. Dados de modelo e validação no servidor

Registro recomendado por instância de chefe:
`run_id, rules_version, cycle_index, region_id, boss_id, boss_instance_id, encounter_start_tick, warning_tick, vulnerability_windows[], hits[], damage_events[], defeat_tick?, retreat_tick?, reward_awarded, encounter_end_tick`.

**Fonte de verdade:** replay determinístico de inputs, seed e regras. O servidor reconstrói ou valida o encontro; jamais aceita `boss_defeated=true` ou `points=...` como autoridade.

- Rejeitar teleporte ao chefe, ataques fora de janela, saltos impossíveis, acertos duplicados, instâncias duplicadas e tentativa de crédito após fuga.
- Atualizar pontos, estatísticas, desbloqueios, conquistas e selos em transação idempotente depois de partida validada.
- Prever estado de resultado `pending_verification`, `verified` ou `rejected`; nunca anunciar ranking global definitivo antes da verificação.
- Replays precisam funcionar em jogadores visitantes e autenticados do mesmo jeito.

## 9. Testes de aceitação e fairness

1. Para cada chefe, executar run de **esquiva perfeita sem atacar** e provar que o personagem atravessa a região ileso quando o chefe recua.
2. Vitória antes do limite e retirada no limite são determinísticas, sem instância ficar ativa infinitamente.
3. Um acerto exato no tick-limite segue prioridade documentada; derrota e retirada não podem ocorrer simultaneamente.
4. Chefes repetidos em ciclos aumentam dificuldade de modo finito; janelas nunca se tornam impossíveis.
5. Nenhuma transição de chefe, vitória, derrota, fuga, novo ciclo ou recompensa restaura vida; abismos continuam fatais.
6. Quatro derrotas no primeiro ciclo somam bônus de 2.250 pontos com a tabela inicial, **mais** demais componentes válidos; zero derrotas gera bônus zero, sem subtração.
7. Repetir o mesmo `boss_instance_id` não duplica pontos, conquistas, missões ou cosméticos.
8. Visita com conta Google, conta e-mail e visitante entrega mesma pontuação para o mesmo replay válido em Jornada Completa.
9. Testar 30/60/120 Hz, tamanhos e orientações de tela: HUD não tapa telegraphs, inputs por gesto/teclado continuam reproduzíveis.
10. Testar pelo menos quatro regiões e vários ciclos em uma run longa, com vitória e retirada alternadas sem corte de continuidade.
11. Confirmar PT-BR/EN, fallback inglês e mensagens de recompensa sem strings embutidas nas sprites.
12. Reproduzir alterações maliciosas (hit fora de janela, seed trocada, múltiplos acertos por tick, boss inexistente) e recusar ranking.

## 10. Pontos pendentes de playtest, sem desfazer decisões anteriores

- Quantidade de acertos e oportunidades, comprimento exato dos encontros e bônus de pontos (+300/+450/+600/+900) são parâmetros *propostos*.
- **Recompensa já confirmada:** Traço da Aurora é o efeito cosmético da katana ao reunir os quatro selos; resta apenas validar a arte final, animação e efeitos reduzidos.
- Métricas de reação ao telegraph, legibilidade na corrupção, latência de touch e a tolerância de hitboxes.
- Política de reclassificação de rankings após futuras versões de regra.
- Efeito audiovisual da retirada e transições de boss para região seguinte.
