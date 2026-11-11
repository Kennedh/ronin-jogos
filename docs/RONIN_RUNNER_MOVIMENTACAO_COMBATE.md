# Ronin Runner — Movimentação, combate e controles (Game Design v0.9)

**Status:** especificação de design anterior ao código. **Nenhuma regra é implementada neste documento.**  
**Escopo:** primeira versão pública completa (desktop, mobile, ranking verificado, identidade persistente).  
**Depende de:** [Especificação geral v0.8](./RONIN_RUNNER_SPEC.md).

## 0. Decisões herdadas e obrigatórias

- Phaser 4, TypeScript, Vite; jogo 2D lateral em pintura japonesa original inspirada na estética de sumi-e/aquarela.
- Corrida automática, combate de tempo de reação, três vidas no início; **nunca há recuperação de vida**; cair em abismo sempre termina a partida.
- Quatro regiões em mundo contínuo, ciclos de corrupção crescente e expedições regionais desbloqueadas.
- Sem vantagens mecânicas decorrentes de trajes, conta, compras ou região desbloqueada.
- Controle principal mobile por gestos; horizontal/paisagem e fullscreen quando possível; fallback responsivo quando navegador impedir fullscreen/orientação.
- Visitante com apelido, e-mail/senha e Google; jogadores válidos em rankings adequados.
- **Localização obrigatória `pt-BR` e `en`** desde o primeiro fluxo de jogo: menus, tutoriais, configurações, feedback de combate, missões, nomes/descrições de trajes, rankings, autenticação e mensagens de erro. Detectar idioma do navegador; seletor manual persistente; fallback EN. Não inserir texto diretamente nos sprites ou no código de gameplay.

## 1. Princípios de controle e sensação

- `Responsivo`: qualquer input válido entra na próxima atualização fixa, sem atraso artificial.
- `Legível`: animações telegráficas e efeitos jamais escondem abismos e hitboxes.
- `Justo`: riscos solucionáveis por ação humana razoável no mobile; jogo informa o motivo da derrota.
- `Consistente`: os mesmos inputs e a mesma seed devem resultar nos mesmos eventos dentro de uma versão de regras.
- `Acessível`: modo de controles alternativos configurável sem oferecer vantagem competitiva.
- `Sem farm`: ataques não podem ser disparados sem custo de recuperação; pontuação verificada.

## 2. Espaço do jogo e simulação

| Parâmetro | Valor inicial proposto | Observações |
|---|---:|---|
| Área lógica de referência | 1280 × 720 unidades | Ajustar enquadramento sem alterar física em cada dispositivo |
| Simulação | 60 passos/segundo | `tick` fixo = 16,6667 ms; renderização independente |
| Gravidade vertical | 2.100 unidades/s² | Ajustar durante playtests |
| Velocidade mundo (início) | 360 unidades/s | Continua após troca de região/ciclo |
| Velocidade máxima | 600 unidades/s | Nunca cresce indefinidamente |
| Mapeamento de distância | 40 unidades = 1 metro no placar | Convenção de jogo; não pretende simular escala real |
| Altura visual do ronin | ~115 unidades | Sprite animado; desacoplado da colisão |
| Hitbox base do corpo | ~44 × 88 unidades | Ajustar após arte e frame data |
| Hitbox no deslize | ~54 × 44 unidades | Ancorada ao chão; sem teleporte |
| Posição visual horizontal | ~27% da viewport lógica | Garantir campo de visão à frente |

**Importante:** 360–600 unidades/s correspondem a 9–15 m/s na convenção adotada; valores iniciais para coerência de gameplay, não promessa sobre tempo exato de atravessar regiões. Distâncias de região do v0.8 são provisórias e serão reavaliadas com telemetria real de sessões. Normalizar campo de visão por **tempo disponível até obstáculos**, não simplesmente pela proporção fixa em pixels, principalmente em aparelhos estreitos.

### 2.1 Fonte de verdade competitiva

O núcleo competitivo deve ser uma simulação pura e versionada em TypeScript, executável em cliente e servidor, com:
- tick inteiro e comandos por tick (jump, slide, attack, pause, etc.);
- gerador pseudoaleatório com seed e algoritmo fixos por `rules_version`;
- estados/movimentos quantizados e colisões reproduzíveis;
- mesmo modelo para replay, geração, verificação de score, desbloqueios e testes.
  
Phaser gerencia renderização, animação, input e áudio; Arcade Physics pode auxiliar efeitos **não autoritativos**. Não depender de física baseada no FPS nem pressupor que um `fixedStep` de engine, sozinho, garanta replay idêntico em plataformas diversas. Usar somente uma autoridade por colisão competitiva e garantir que a representação visual corresponda ao núcleo. Se usar Arcade Physics para gameplay, antes de aceitar resultados globais demonstrar reprodutibilidade interplataforma e equivalência com o validador.

## 3. Máquina de estados do personagem

Estados de locomoção: `RUN`, `JUMP`, `DOUBLE_JUMP`, `FALL`, `SLIDE`, `HURT`, `DEAD`, `PAUSED`. O ataque é uma **camada de ação** (`ATTACK_WINDUP`, `ATTACK_ACTIVE`, `ATTACK_RECOVERY`), não uma troca permanente da locomoção. Assim é possível correr/pular enquanto ataca.

Regras:
- Corrida automática sem botão para acelerar ou frear.
- `JUMP` e `DOUBLE_JUMP` podem atacar, respeitando alcance vertical.
- `SLIDE` não inicia ataques no primeiro conjunto de regras; ataques já iniciados devem obedecer à transição definida na simulação para não gerar golpes invisíveis.
- `HURT`: animação curta, invulnerabilidade temporária, movimento do mundo continua se seguro; sem stun que cause queda inevitável no abismo.
- `DEAD`: congela simulação de corrida e abre resultado após efeito; comandos seguintes não valem.
- `PAUSED`: congela simulação e pontuação; UI/áudio conforme configurações.

## 4. Saltos

| Regra | Valor inicial | Justificativa |
|---|---:|---|
| Impulso vertical do salto | -750 unidades/s | Aproximadamente 134 unidades de altura e 0,71 s de voo sobre mesmo nível |
| Coyote time | 80 ms | Tolera apertar após deixar a borda, sem permitir salto já em queda profunda |
| Jump buffer | 100 ms | Tolera comando pouco antes de tocar o chão |
| Segundo salto | Permitido desde o começo | Mantém condições competitivas iguais para visitantes e cadastrados |
| Impulso do salto duplo | -670 unidades/s | Levemente menor; substitui velocidade vertical por impulso configurado |
| Limite | Um salto duplo por decolagem | Recarrega apenas após pouso real em piso seguro |
| Salto segurado | Não necessário na V1 | Gesto mobile não depende de manter dedo pressionado |

O salto duplo deve ser **habilidade base**, não desbloqueada por trajes ou distância: é parte do movimento competitivo e o mesmo para todos. Exigir segundo swipe vertical no ar no mobile ou segundo comando no desktop. Ao cair em um abismo, não permitir "salto de emergência" depois do estado de morte. Landing exige superfície segura e cruzamento correto das caixas de colisão.

**Limites de geração:** o gerador deve calcular distância possível durante o voo considerando velocidade atual, buffers, margem de segurança e a possibilidade de o jogador optar por pulo simples ou duplo. Não criar abismos além do alcance de um input razoável nem obstáculos que precisem de movimentos mutuamente exclusivos no mesmo instante.

## 5. Deslize

- Entrada: gesto para baixo, S ou seta para baixo.
- Duração proposta: **550 ms**, com estado e hitbox reduzida.
- Deslizar somente ao estar no chão; em queda, não produzir "teleporte" nem salvar de abismo.
- Um comando recebido imediatamente antes de pousar pode entrar no **buffer de 100 ms**, caso seguro.
- Durante deslize: não iniciar ataque ou salto, salvo transições explicitamente aprovadas em playtests; padrões não podem exigir ação incompatível até terminar a animação + margem.
- Após deslize: recuperação/estabilização inicial de **100 ms** antes de outro deslize.
- Área do corpo e arte permanecem alinhadas; não permitir reerguer dentro de obstáculo de teto.

## 6. Ataque — Corte comum e corte perfeito

**Entrada:** J no desktop; toque curto no mobile.  
**Equipamento:** katana padrão; trajes alteram somente aparência/efeito.

| Fase | Duração-alvo | Ação |
|---|---:|---|
| Preparação (wind-up) | 70 ms | Anticipação visual curta |
| Acerto ativo (active) | 120 ms | Hitbox de katana disponível; máximo 1 acerto por inimigo e por golpe |
| Recuperação (recovery) | 180 ms | Não permite novo golpe |
| **Ciclo total** | **370 ms** | Não permite spam mais rápido do que regras finais |

- Zona frontal de corte proposta: até **140 unidades à frente** do corpo, com altura vertical dependente da animação e postura.
- `Normal hit`: primeiro contato válido entre hitbox ativa e inimigo vulnerável dentro do ciclo.
- `Perfect hit`: contato válido que ocorre dentro da **janela de precisão de referência ±100 ms** do instante ideal **telegráfico** do inimigo. A faixa não diminui indefinidamente em ciclos avançados. "Instante ideal" deve ser função reproduzível da animação/posição/tempo do inimigo e da velocidade atual, nunca um valor secreto sem indicação visual.
- A referência visual do tempo ideal deve ser lida em movimento; indicador opcional de brilho/pose de vulnerabilidade sobre o inimigo, sem HUD invasivo.
- Ataque prematuro/vazio não pontua, consome ciclo de 370 ms e zera combo; **não** perde uma vida automaticamente.
- Um inimigo só pode ser eliminado uma vez e não pode fornecer recompensa duplicada.
- Inimigos básicos caem com um golpe; inimigos especiais podem ter múltiplos estados (esquiva, telegraph, janela vulnerável), sem obrigar múltiplos golpes cegos.
- Cortes durante salto possíveis se overlap vertical; ao deslizar, não iniciar golpes na V1.

### 6.1 Verificação de timing

Nunca basear `perfect` apenas na diferença de FPS do dispositivo. Registrar entrada/contato e janela por **ticks**; por exemplo, seis ticks de cada lado em 60 Hz equivalem a aproximadamente ±100 ms. A autoridade de pontuação verifica eventos contra a versão do algoritmo. Ajustar a faixa por playtest humano e testes de diferentes displays/touch latency antes de congelar `rules_version`.

### 6.2 Dano recebido

- Contato com inimigo/obstáculo não fatal remove **1 vida**.
- Invulnerabilidade proposta: **900 ms** após dano; não permite recuperar vidas.
- Impactos no período invulnerável não removem mais vidas; **não protege de abismo fatal**.
- Após dano, não induzir deslocamento ou stun que torne inevitável outra colisão.
- Feedback: flash breve e contorno, som, perda de um coração; opção de reduzir flashes.
- Cair em abismo termina a partida de imediato independentemente da vida restante.

## 7. Combos, Concentração do Ronin e especial

**Combos:** sequência de cortes perfeitos; corte comum pode manter progresso mas interrompe `perfect streak` (decisão de design inicial); ataque errado zera sequência. Combo influencia feedback e eventos de missão, não multiplica pontuação sem teto.

**Concentração (0–100):**
- Corte perfeito: +12 pontos de concentração (**alvo inicial**).
- Corte comum: +3.
- Erro: não retira concentração já conquistada.
- Ao chegar a 100, o próximo ataque **bem-sucedido** ativa automaticamente um corte especial de tinta; um ataque falho não consome concentração.
- Especial elimina inimigos elegíveis **num alcance curto delimitado** e gera eventos auditáveis; não cria invencibilidade, não cura e não atravessa abismo.
- Limitar recompensas de score por inimigo/ato para impedir `farm` e multiplicação infinita.
- Efeitos artísticos de purificação são cosméticos; mudança vivo/corrompido da região permanece controlada pelo diretor de cenário.

Questão futura de ajuste de gameplay: a regra de corte comum encerrar ou não a sequência perfeita; manter contrato explícito e testes de ambas as opções na avaliação.

## 8. Mobile — gestos e fullscreen

| Entrada | Interpretação |
|---|---|
| Touch curto sem deslizar | Katana |
| Swipe vertical para cima | Salto |
| Segundo swipe para cima durante voo | Salto duplo |
| Swipe vertical para baixo no chão | Deslize |
| Ícone PAUSAR | Pausa imediata, não dispara ataque |
| Rotação, app em segundo plano, fullscreen encerrado | Pausar de modo seguro |

Parâmetros **iniciais e calibráveis** de reconhecimento:
- toque: deslocamento total < **18 px CSS** e duração < **230 ms**;
- swipe: deslocamento vertical ≥ **35 px CSS** e dominante no eixo Y (|dy| > 1,3 × |dx|);
- reconhecimento antecipado: disparar o comando de swipe quando cruzar limiar, sem exigir soltar o dedo;
- gesto iniciado na UI de pausa ou menu não vira ataque;
- cancelar gesto quando interação for interrompida; ignorar multitouch ambíguo na zona de jogo;
- impedir scroll/zoom acidental **apenas na superfície do game**, sem bloquear navegação da página inteira;
- limiares devem considerar densidade e acessibilidade, com testes em aparelhos reais.

**Orientação:** modo paisagem recomendado. Ao selecionar "Jogar", solicitar fullscreen e bloquear orientação **se suportados e permitidos**, após gesto explícito. Se impossível (Safari/iOS, políticas ou permissão negada), manter modo imersivo responsivo. A mudança de orientação/foco não pode causar morte injusta. Configuração opcional de controles alternativos por botões em tela, sem vantagem de tempo de resposta.

## 9. Desktop — teclas

- `Space` ou `ArrowUp`: salto / salto duplo.
- `S` ou `ArrowDown`: deslize.
- `J`: atacar.
- `Esc`: pausar / retomar com contagem visual, sem simulação durante contagem.
- Rebinds e preferência de controles salvos por jogador/dispositivo; ignorar `key repeat` automático para não disparar saltos/ataques duplicados.

## 10. Colisões, prioridade de eventos e justiça

- AABB para corpo / piso / abismos e alcance da espada versionados; gráficos não devem distorcer percepção do jogador.
- Ordenar eventos no mesmo tick de maneira explícita e auditável. Proposta: processar inputs → movimento → detecção de solo/abismo → ações válidas → hitboxes de ataque → danos/resultado; em disputas no mesmo tick, adotar uma regra estável e testar casos-limite.
- Abismo fatal **não pode ser neutralizado** por invulnerabilidade ou golpe especial; teste de borda em salto com coyote time.
- Obstáculos telegráficos com antecedência mínima inicial: ~1,0 s para elemento simples e ~1,5 s para abismo (calibrar).
- Não escalar velocidade para além do teto. A dificuldade cresce por variedade e sequência, mas com teto de complexidade e trechos de respiro.
- Qualquer aumento de dificuldade preserva hitboxes, entradas e janela de corte de forma previsível.
- Congelar estado ao pausar, trocar de aba ou perder fullscreen; para ranqueadas, definir no backend política contra abuso de pausas (eventos e tempo de pausa, sem punir desconexões honestas).

## 11. Feedback visual, áudio e localização

- Movimento: antecipação, aterrissagem em respingo de tinta, tecido acompanhando a corrida, poeira aquarelada.
- Ataque: traço de nanquim rápido, efeito/áudio distintos em corte normal e perfeito; sem exibir sangue realista.
- Dano: breve tinta escura, coração removido, sem flashes excessivos; modo de redução de movimento/efeitos.
- Controles e instruções i18n: exemplos de chaves `controls.jump`, `controls.slide`, `controls.attack`, `combat.perfectSlash`, `combat.concentration`, `run.distance`, `run.gameOver`.
- Ex.: `pt-BR`: "Corte perfeito"; `en`: "Perfect Slash". Usar formatação local de números e unidades, sem texto gravado na arte.
- Evitar kanji de efeito gratuito que possa ter significado incorreto; se usado, tradução e revisão cultural.

## 12. Regras para ranking e replay

- Registro de eventos por tick (`jump`, `double_jump`, `slide`, `attack`, `pause`, dano, hit, kill), com `run_id`, seed, `rules_version` e modo.
- Servidor verifica entradas admissíveis, movimentação e colisão reconstruídas e score computado, sem confiar em `score`, distância ou kills enviados pelo cliente.
- Desempenho de renderização não deve acelerar/desacelerar a **simulação competitiva**; mudanças de foco/latência não devem produzir vantagem.
- Jornada Completa inicia no marco zero e compete no all-time/semanal principais; Expedição Regional inicia no ponto liberado e compete só no ranking próprio.
- Regras de física, timing de golpe, geração e score versionadas para não alterar retroativamente resultados anteriores sem política expressa.

## 13. Testes e aceitação

**Movimento**
1. Corrida automática não para na troca entre quatro regiões nem na virada de ciclo.
2. Mesmo comando/tick/seed gera o mesmo estado em backend e cliente (dentro de regra de quantização).
3. Salto simples, duplo, coyote time, jump buffer e aterrissagem respeitam limites.
4. Swipe para cima nunca dispara ataque; toque curto não gera salto; app perde foco e pausa sem morrer.
5. Deslize reduz hitbox pelo intervalo definido; não atravessa piso/obstáculo e retorna sem colisão injusta.

**Combate**
6. Um ataque tem uma só janela ativa; não há spam por repetição de tecla ou multi-touch.
7. Acerto normal versus perfeito determinado por tick/janela reproduzível; não depende do FPS gráfico.
8. Erro zera combo, mas não elimina concentração; especial não cura nem torna imune ao abismo.
9. Dano não fatal -1 vida com 900 ms de proteção; 3 → 2 → 1 → 0; **sem cura em qualquer estado**, inclusive reinício de região/ciclo.
10. Abismo termina imediatamente, mesmo dentro da invulnerabilidade e com especial pronto.

**Fairness e UX**
11. Gerar e testar milhares de seeds e transições para comprovar acessibilidade dos obstáculos a partir de estados possíveis.
12. Comparar mobile 30/60/120 Hz e desktop; latência/foco/pausa não criam pontuação indevida.
13. Testar campo de visão e legibilidade em telas 16:9, 19.5:9 e outras proporções.
14. PT-BR e EN completos em controles, tutorial, resultado, tela de conta e mensagens de combate; seletor salva preferência.
15. Testar replays alterados, score falsificado, golpe duplicado e comandos inválidos em ranking.

## 14. Decisões ainda sujeitas a validação em playtests

- Altura real do pulo e distância entre obstáculos com arte final.
- Alcance/hitbox da katana conforme frames e hitstop.
- Tempo de wind-up, active e recovery, janela de corte perfeito e latência touch.
- Se combo perfeito termina com corte comum ou apenas com erro.
- Frequência de inimigos e peso de score em sessões longas.
- Limites de pausa em runs ranqueadas, sem prejudicar acessibilidade.
- Chefe(s) no primeiro lançamento, localização textual final da narrativa.

> **Condição para desenvolvimento:** nenhuma das tabelas acima deve ser congelada sem teste empírico. O sistema de configurações de regras deve permitir ajuste **versionado**, com testes de regressão e rankings coerentes.
