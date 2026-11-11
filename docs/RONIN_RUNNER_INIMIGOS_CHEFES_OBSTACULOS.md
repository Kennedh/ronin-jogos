# Ronin Runner — Inimigos, chefes, obstáculos e diretor procedural (Game Design v0.10, revisado após v0.11)

**Estado:** proposta de game design detalhada para revisão ANTES de programar.  
**Documento principal:** [Especificação geral](./RONIN_RUNNER_SPEC.md)
**Regras definitivas de retirada e recompensas:** [Game Design de chefes v0.11](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md). Este documento define os arquétipos e padrões; o v0.11 prevalece para o fluxo e as recompensas dos chefes.  
**Física e controles:** [Movimentação e combate v0.9](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md)

## 1. Decisões confirmadas e escopo final

- **Salto duplo como habilidade padrão disponível a TODOS desde a primeira partida**, sem desbloqueio e sem impacto de traje/conta. Duplo swipe para cima no mobile; segundo Space/↑ no desktop durante voo. No máximo um salto extra antes do próximo pouso em piso seguro.
- Salto simples, salto duplo, deslize e corte de precisão são as ações centrais. Não acrescentar botões complexos para chefes.
- **Três vidas iniciais, zero cura ou regeneração sob qualquer condição, abismo sempre fatal**, inclusive durante invulnerabilidade.
- Jornada contínua nas quatro regiões, novos ciclos com corrupção crescente, Expedição Regional desbloqueável com ranking separado.
- Primeiro lançamento público é **VERSÃO COMPLETA**: conteúdo das quatro regiões, chefes, variações de inimigos/obstáculos, sistemas de conta e validação, não apenas demonstração da floresta.
- Arte original 2D em linguagem de pintura japonesa (sumi-e, aquarela, papel), transições vivo/sombrio; **textos sempre localizados PT-BR/EN**.
- Física competitiva e geração procedural executáveis por simulador determinístico TypeScript compartilhado (cliente/servidor), seed e rules_version. Phaser 4 responsável pela representação e inputs.

## 2. Contrato comum para inimigos

**Máquina de estados base:** `SPAWN → APPROACH → TELEGRAPH → ACTIVE → RECOVERY → APPROACH/DEFEATED/EXIT`.

Cada arquétipo declara em dados versionados: região(s), ciclos habilitados, comportamento, distância e duração do aviso, hitbox corporal, hitbox do ataque, vulnerabilidade, deslocamento, altura/alcance, vida/quantidade de golpes aceitos, pontuação, eventos de áudio/animação e restrições de combinação.

- Dano comum ao ronin: **1 coração** por evento válido, respeitando 900 ms provisórios de invulnerabilidade pós-dano. Não permitir múltiplos danos pelo mesmo ataque enquanto sobreposto.
- Telegraph obrigatório e perceptível: **pose + movimento da arma + som característico**, não apenas mudança de cor; contraste em fundo claro/escuro e opção de redução de efeitos.
- A janela de golpe perfeito permanece baseada na simulação por tick (alvo ±100 ms, a ajustar por testes), e não encolhe indefinidamente com ciclos. Corte normal válido também derrota inimigo comum.
- Inimigos podem ser **combatidos ou evitados** quando o padrão permite, sem ataques obrigatoriamente perfeitos para continuar a corrida.
- Colisões seguem uma única autoridade no núcleo de simulação; um inimigo morto não pode causar dano ou pontuar novamente.
- O sistema não espera por animações longas: o mundo continua correndo; hitstop visual não congela o relógio competitivo de forma divergente do servidor.
- Reuso de entidades/partículas para limitar CPU e coleta de lixo em partidas longas.

## 3. Catálogo de inimigos da versão completa

| ID / arquétipo | Regiões | Silhueta / papel | Sinal de ataque | Resposta principal |
|---|---|---|---|---|
| E01 Soldado Errante | Floresta; Templo | Humano baixo, espada curta; inimigo-escola | Ergue a espada por cima do ombro | Corte no alcance ou salto |
| E02 Lanceiro da Névoa | Floresta (fim); Templo | Alto, lança longa e postura linear | Recuo da ponta e avanço rápido | Salto antes da estocada + contra-ataque, ou evasão |
| E03 Espírito de Tinta | Floresta corrompida; Castelo | Corpo etéreo suspenso; muda altura previsivelmente | Forma círculo de tinta e concentra brilho | Saltar/atacar no ar ou contornar, conforme altura |
| E04 Arqueiro do Santuário | Templo; Castelo | Arco comprido, base fixa e silhueta arqueada | Arco tensionado + linha curta indicando trajetória | Salto/deslize conforme projétil e, se em alcance, corte |
| E05 Guardião de Pedra | Templo; Castelo | Figura pesada com maça; lentidão e área grande | Maça fica suspensa antes do golpe | Evasão e contra-ataque na recuperação |
| E06 Lobo da Tempestade | Montanhas | Quadrúpede veloz, baixa altura | Para por instante, abaixa corpo e salta | Salto preciso ou corte em tempo |
| E07 Andarilho de Gelo | Montanhas | Inimigo humano esguio, lâmina fria | Pisa forte e lança fragmentos à frente | Deslize/pulo conforme trajetória |
| E08 Espadachim do Eclipse | Castelo; ciclos avançados | Humano elegante, lâmina dupla e silhueta definida | Guarda alterna alta/baixa antes da investida | Leitura de pose, esquiva e contra-ataque |
| E09 Sombra Rasgante | Ciclo III+; regiões corrompidas | Massa escura de tinta com bordas rasgadas | Fragmentos se alinham mostrando altura fixa | Ataque em janela vulnerável ou salto |

**Observação:** a lista acima é o catálogo-alvo inicial de nove arquétipos com variantes visuais e de timing; não é uma promessa de que todos surgirão em toda corrida. Seus nomes, sprites, ataques e valores serão refinados, e cada um precisa de testes individuais antes do lançamento.

### 3.1 Diferenciar dificuldade SEM injustiça

- **Ciclo I:** padrão base e aviso mais longo; poucos encontros combinados.
- **Ciclo II:** novas ordens dos mesmos ataques e algumas variantes, preservando aviso mínimo.
- **Ciclo III:** alternância de posições/alturas e transições mais exigentes, com espaço de resposta garantido.
- **Ciclo IV+:** catálogo amplo e combinações variáveis com teto de densidade e velocidade; **nunca acelerar ou reduzir telegraph indefinidamente**.
- Dano por hit não aumenta: permanece 1 coração para ataques comuns. Abismos permanecem exclusivamente fatais, claramente sinalizados.
- Não dar vidas extras, escudos ou buffs por traje; purificação ambiental é cosmética.

## 4. Chefes: quatro encontros obrigatórios no escopo de lançamento

Chefes serão **encontros em movimento**, sem parar o runner nem exigir novas teclas. Ocorrerão nas proximidades do **fim de cada região** (marcos exatos calibráveis), inclusive em ciclos posteriores, com versões mais corrompidas.

**Modelo CONFIRMADO:** aviso de aproximação → entrada do chefe na cena → conjunto finito de ataques telegráficos e janelas de contra-ataque → derrota OU retirada do chefe → corrida segue para a região seguinte sem corte abrupto. **A retirada é regra definitiva, não uma opção futura.**

**Regras importantes:**
- Cada chefe possui hitbox grande, mas somente **zonas vulneráveis abertas por sinais claros** podem receber corte. Não exigir exclusivamente cortes perfeitos para vencer: corte normal válido também conta; corte perfeito recebe bônus.
- Nenhum chefe aplica dano automaticamente por estar visível na tela; só hitboxes de ataques com telegraph, colisão legível e duração definida causam dano.
- Os ataques não podem coincidir com abismo fatal e outro obstáculo impossível; diretor reserva a faixa da fase do chefe para padrões validados.
- **REGRA CONFIRMADA: derrotar o chefe NÃO é requisito para atravessar a região.** Se o encontro terminar sem derrota, o chefe recua e a corrida continua, sem penalidade de pontos, distância ou vida pela retirada. O personagem ainda pode receber dano dos ataques comuns caso não desvie. Derrota rende pontos, conquistas, selos e progresso de missão, nunca vida. O chefe também pode ser evitado sem atacar.
- Cada encontro tem sequência e quantidade máxima de oportunidades válidas, definidas pela seed; gerar dados idempotentes por instância do chefe para evitar matar/pontuar duas vezes.
- Tentativa sem acertos não provoca morte automática. O jogador ainda pode morrer normalmente por ataques não evitados ou por perder todas as vidas.
- Transições nunca restauram corações. A vitória **não** cura nem zera as vidas perdidas.
- Futuro ajuste de balanceamento pode modificar quantidades e durações somente com nova `rules_version`, preservando justiça dos rankings.

### 4.1 Chefe B01 — Raiz Negra (Floresta de Bambu)

- Visual: espírito ancestral de bambu e raízes, contornos de nanquim, folhas convertendo-se em tinta.
- Ataques: **varredura baixa de raízes** (pular), **galho alto horizontal** (deslizar), **abertura do núcleo** (janela de katana).
- Aprendizado: alternar pulo/deslize/ataque sem mudar controles.
- 3 acertos válidos propostos para derrotar; encontro com 4–5 oportunidades de corte.
- Ao morrer, dissipação de tinta escura revelando breve explosão de verde (efeito cosmético).

### 4.2 Chefe B02 — Guardião do Sino (Templo Esquecido)

- Visual: guardião cerimonial de pedra e bronze, sino nas costas e cordas ritualísticas; design original.
- Ataques: **onda de sino alta** (deslizar), **impacto no chão** (saltar), **braço estendido** (janela de corte após esquiva).
- Aprendizado: reconhecer sequência de telegraph sonoro/visual.
- 4 acertos válidos propostos, 5–6 oportunidades.
- Sua derrota apaga símbolos de corrupção do templo, sem restaurar vidas.

### 4.3 Chefe B03 — Espírito da Nevasca (Montanhas Geladas)

- Visual: forma gigantesca de vento, neve e pinceladas azul-escuras.
- Ataques: **rajada alta** (deslizar), **estilhaços baixos** (saltar), **aproximação aérea** (corte em salto, incluindo salto duplo).
- Aprendizado: precisão vertical, sem depender de adivinhar a direção.
- 5 acertos válidos propostos, 6–8 oportunidades.
- Vento muda aparência e áudio, **não altera a física do jogador sem aviso explícito e teste de alcançabilidade**.

### 4.4 Chefe B04 — Senhor do Eclipse (Castelo do Eclipse)

- Visual: antigo guerreiro corrompido com manto de tinta negra, katana de contraste avermelhado e armadura estilizada.
- Ataques: **corte baixo** (pular), **arco superior** (deslizar), **golpe frontal telegráfico** (esquiva + contra-ataque); fases exibem poses e ritmos diferentes.
- Aprendizado: domínio das três ações e leitura de padrões; não exigir botões adicionais.
- 6 acertos válidos propostos, 7–9 oportunidades.
- Derrota provoca grande purificação estética e retorno contínuo à Floresta do ciclo seguinte; **não** significa fim do jogo.

### 4.5 Ciclos repetidos de chefes

Cada chefe reaparece por ciclo com paleta/efeitos de corrupção e **nova ordem de padrões válidos**. Densidade e velocidade atingem um teto no Ciclo III/IV; dificuldade não pode crescer infinitamente. A quantidade de acertos por chefe **não aumenta sem teto**. Qualquer chefe pode recuar sem quebrar a jornada, deixando a classificação da corrida baseada em mérito e sobrevivência.

## 5. Obstáculos por região

| Região | Obstáculos principais | Ação esperada | Risco |
|---|---|---|---|
| Floresta de Bambu | Tronco baixo, galho suspenso, vala, raízes que surgem | Pular / deslizar / usar salto duplo no vão longo | Vala = morte; outros -1 vida |
| Templo Esquecido | Pilar caído, arco baixo, piso quebrado, projétil de sino/arqueiro | Pular / deslizar / atacar quando cabível | Abismo no piso = morte |
| Montanhas Geladas | Fissura de gelo, estalactite, bloco rolante, rajada/fragmento | Pular / deslizar / corte em ar | Fissura = morte |
| Castelo do Eclipse | Ponte quebrada, lâminas com telegraph, escombros, onda de tinta | Pular / deslizar / atacar conforme sequência | Ponte quebrada = morte |

**Regra de cor:** obstáculos sempre identificáveis sem depender exclusivamente de vermelho/verde; borda do abismo precisa manter contorno visível mesmo na maior corrupção. Sem "pegadinhas" que apareçam em cima do jogador.

## 6. Biblioteca inicial de padrões para o diretor procedural

Os padrões são **blocos de gameplay**, não posições fixas de sprites. Cada bloco carrega pré-condições e pós-condições de locomoção, grau de dificuldade, tempo total, duração do aviso, região e tolerância de input.

| ID | Dificuldade | Sequência | Região / ciclagem | Condição de segurança |
|---|---|---|---|---|
| P01 | Introdução | Tronco → área livre | Floresta e variantes | Salto simples com pouso seguro |
| P02 | Introdução | Galho baixo → área livre | Floresta, templo | Deslize com folga para levantar |
| P03 | Introdução | Soldado → área livre | Todas com variante | Corte comum ou esquiva possível |
| P04 | Média | Tronco → Soldado | Floresta, templo | Recuperação de pulo e alcance de katana compatíveis |
| P05 | Média | Galho → vala | Floresta, templo | Folga após deslize, indicação antecipada de vala |
| P06 | Média | Vala curta → galho alto | Floresta | Pouso livre e espaço de mudança de estado |
| P07 | Média | Lanceiro → abertura de corte | Floresta corrompida, templo | Pulo + ataque em janela após alcance real |
| P08 | Avançada | Arqueiro alto → pilar | Templo | Deslize + salto separados por recovery suficiente |
| P09 | Avançada | Fissura → lobo | Montanhas | Aterrissagem previsível; salto duplo possível se necessário |
| P10 | Avançada | Estalactite → fragmentos baixos | Montanhas | Deslize e salto com espaços válidos |
| P11 | Avançada | Lâminas telegráficas → ponte rompida | Castelo | Abismo visível ≥ margem de segurança |
| P12 | Extrema justa | Espadachim → ponte → espírito aéreo | Castelo, ciclos avançados | Sequência solucionável sem input simultâneo incompatível |

**Padrões só entram em produção após validação automática e humana** com as regras de física finais, velocidades mín./máx., coyote time, janela de ataque e várias proporções de tela. Evitar projetar conteúdos que exijam `pixel-perfect` em touch.

### 6.1 Regras de composição e estados

- Antes de gerar bloco, consultar estado alcançável do jogador e intervalo de segurança desde bloco anterior.
- Nunca combinar ataque, deslize e pulo **no mesmo tick obrigatório**. Casos com pulo + golpe precisam de overlap temporal realista, não execução simultânea exata.
- Após salto duplo, exigir pouso seguro antes de próximo trecho que dependa de salto duplo; não presumir recarga no ar.
- Após deslize, respeitar duração de ~550 ms e recuperação proposta de ~100 ms; não forçar salto antes de liberar a postura.
- Após katana, respeitar `windup 70 ms + active 120 ms + recovery 180 ms`; padrões que exigem dois golpes precisam espaçamento compatível.
- Abismos devem ser telegráficos, ter plataforma aterrissável e distância vencível pelo **salto simples ou duplo anunciado**, sob pior velocidade permitida.
- Não posicionar inimigos em locais onde a arte obstrua o aviso de abismo.
- Se um candidato falhar às restrições, o gerador descarta e escolhe trecho seguro, sem travar nem gerar tela vazia infinita.
- Regra determinística: mesma seed, versão e histórico de comandos ⇒ mesmos blocos, inimigos e colisões.

### 6.2 Alternância de intensidade

Diretor alterna **aprendizado → intensidade moderada → pico de desafio → respiro**, sem ficar permanentemente extremo:
- início de cada região: poucos perigos para ler a paleta/terreno;
- meio: misturar obstáculos característicos e variações;
- fim: introduzir sequência temática e chefe;
- transição: corredores seguros e carregamento visual suave.
Ciclos IV+ ampliam o **catálogo de combinações**, não os limites físicos de reação. Evitar padrões inviáveis ao considerar HUD/gestos e campo de visão de mobile.

## 7. Eventos e pontuação de chefe

Manter proposta de pontuação base `10×metros + 30×inimigos comuns derrotados + 100×cortes perfeitos`; chefes concedem **bônus fixo por derrota, por encontro identificável**, com valores provisórios por tipo **+300, +450, +600 e +900 pontos** (ver v0.11), e sem contabilizar boss kill como inimigo comum. Uma instância de chefe gera no máximo uma recompensa de vitória e precisa ser validada no servidor.

- A derrota do chefe aumenta `bosses_defeated`, missão e eventual desbloqueio cosmético (jamais vida).
- Se o chefe recua, marca `boss_retreat`; não recebe bônus de derrota, não recebe penalidade, mantém pontos/distância/concentração e a corrida segue.
- A mesma seed/região/ciclo apresenta o mesmo encontro a todos em uma versão de regras.
- Jornadas e expedições usam rankings separados; comparar somente scores submetidos e verificados dentro das respectivas regras.
- O sistema não pode aceitar "matei chefe X" vindo do navegador sem conferir replay/eventos.
- Repetição do chefe em novos ciclos é permitida, uma recompensa por instância legítima, e deve exigir distância correspondente; sem farming parado.

## 8. UX de chefes e controles

- Em mobile, **somente toque para katana + swipes de salto e deslize**; não adicionar botão de chefe.
- Em desktop, mesmas teclas de jogo: Space/↑, S/↓, J; Esc para pausar.
- Aviso de chefe breve (nome localizado, som e sombra) acontece em movimento sem atrapalhar telegraph de obstáculos; evitar cutscene que interrompa corrida.
- Em encontros de chefe, UI secundária mostra energia do chefe, permanecendo legíveis três corações do ronin e abismos.
- Se a tela perder foco/forçar rotação, pausar de forma consistente; fullscreen é pedido apenas quando o navegador permite.
- Vencedores podem ver um efeito visual marcante de tinta se purificando, reduzido em dispositivos modestos e em modo de movimento reduzido.
- Quedas de FPS não podem alterar janela de acerto, frequência de spawn, vidas ou score.

## 9. Localização e identidade artística

- Textos de nomes, avisos de ataques, missões, resultados, tutorial de chefes e acessibilidade vêm de chaves `pt-BR`/`en`; sem strings embutidas em sprites.
- Exemplo de chave: `enemies.soldier.name`, `bosses.eclipseLord.name`, `warnings.abyss`, `combat.perfectSlash`.
- Contornos e poses são produzidos como assets originais; não copiar materiais de Ōkami ou quaisquer jogos de referência.
- Personagens usam silhuetas distinguíveis com e sem cor; animações e sons diferenciados por função, não apenas por região.
- Textura visual forte não pode sacrificar contraste de colisões, hitbox, telegraph e estado de invulnerabilidade.
- Observar licença de fontes, músicas, SFX e assets criados ou adquiridos, com rastreabilidade no repositório.

## 10. Testes exigidos ANTES do lançamento completo

1. **Testes de unidade por arquétipo:** máquina de estados, antecipação, golpe, hitbox, invulnerabilidade, derrota e pontuação idempotente.
2. **Replay de chefes:** mesmas seed/ticks produzem mesmas fases, oportunidades e resultado em cliente e validador.
3. **Contraexemplos de vida:** chefes, inimigos, região e ciclo nunca recuperam vida; 3→2→1→0 e abismo mata com 3/2/1 e durante i-frames.
4. **Propriedades de geração:** milhares de seeds com modelos de jogador; todos os P01–P12 e transições têm ao menos uma rota válida; não bastam verificações locais — testar também sequências concatenadas.
5. **Fairness de input:** validar tempo de reação em Android/iOS/desktop e gestos de pulo duplo, salto/deslize, toque/corte; não aceitar sequências impossíveis para humanos.
6. **Compatibilidade:** proporções variadas, acesso a fullscreen negado, pausas, troca de aba, 30/60/120 Hz, alto e baixo desempenho.
7. **Rankings:** abates de chefe falsificados, replay truncado, seed modificada, uso de ataques múltiplos por tick e `run_id` duplicado rejeitados.
8. **Longa duração:** pelo menos 4 regiões, 4 chefes e 3+ ciclos em replay automatizado de referência; estabilidade de memória e velocidade-teto.
9. **Localização:** PT-BR/EN em todas as telas de chefes, avisos, nomes e conquistas; fallback inglês; diacríticos renderizados.
10. **Arte e legibilidade:** abismos e ataques reconhecíveis nos estados de corrupção máxima, sem flash excessivo.

## 11. Questões restantes (não são bloqueio para documentar, mas requerem decisão antes do código)

- **Decisão já confirmada:** chefes recuam sem derrota após o encontro, sem bloquear a corrida, conforme documento v0.11.
- Validar duração/quantidade de janelas por chefe e bônus propostos (+300/+450/+600/+900), com testes de sessões longas. Ajustar apenas mediante regras versionadas.
- Refinar alcance da katana aérea, áreas de colisão de chefes e condições de corte perfeito.
- Definir política de atualização de `rules_version` e preservação de rankings após balanceamento.
- Fechar arte final, paleta e animações com protótipos visuais originais, mas sem substituir sistemas de gameplay.
- Definir limites de pausa e eventos de desconexão em partidas ranqueadas sem punir jogadores de rede móvel.
