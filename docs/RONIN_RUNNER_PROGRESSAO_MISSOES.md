# Ronin Runner — Missões, conquistas, cosméticos e progressão permanente (Game Design v0.12, atualizado em v0.13)

**Status:** design antes de implementar. Regras **CONFIRMADAS** permanecem obrigatórias; números e catálogos marcados **PROPOSTOS** precisam de aprovação e testes de balanceamento.  
**Documentos:** [Visão e regras](./RONIN_RUNNER_SPEC.md) · [Controles e combate](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md) · [Inimigos, chefes e obstáculos](./RONIN_RUNNER_INIMIGOS_CHEFES_OBSTACULOS.md) · [Chefes e recompensas](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md) · [Desafios Semanais Autogerados v0.13](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md).

## 1. Decisão definitiva desta revisão

**CONFIRMADO: reunir os quatro selos dos chefes desbloqueia permanentemente o efeito de katana `Traço da Aurora`** (EN: `Aurora Brushstroke`, nome final traduzível), no Ronin ID do jogador.

- Um selo por **primeira vitória válida** contra cada um dos quatro chefes: Raiz Negra, Guardião do Sino, Espírito da Nevasca, Senhor do Eclipse.
- Os selos podem vir de partidas distintas e de Expedições Regionais legitimamente desbloqueadas.
- Não há obrigação de derrotar chefe para continuar: chefe **pode recuar**, e a corrida segue normalmente; não dá selo nem bônus de vitória nesse caso.
- Traço da Aurora é **efeito cosmético da trilha do golpe**, equipável em qualquer traje; não altera dano, alcance, área de colisão, janela de corte perfeito, vida, velocidade, concentração, score ou chances de vencer.
- Equipável/desativável pelo jogador; efeitos reduzidos em acessibilidade ou desempenho sem perder o desbloqueio.
- Quatro selos e efeito são concedidos **uma vez por Ronin ID**, por transação idempotente após validação no servidor.
- **Nenhuma recompensa ou missão regenera vida.** São três vidas iniciais por partida, sem cura, e abismos fatais.
- Localização integral `pt-BR` e `en` de rótulos, descrições, objetivos, conquistas, avisos e efeitos, com detecção do navegador, seletor e preferência persistente.

## 2. Princípios da progressão completa

1. Cada partida válida contribui com **distância real percorrida e ações reais verificadas**, mesmo sem novo recorde. Não inflar estatísticas com quilômetros de regiões puladas.
2. Desbloqueios são cosméticos, narrativos ou de **ponto de partida**; não alterar força, vida ou movimento. **Salto duplo disponível a todos desde o início**.
3. Missões não fornecem bônus de **pontuação do ranking**. A classificação é calculada apenas pelas regras competitivas do replay; progressão é um sistema separado.
4. Jogadores visitantes com apelido e contas por e-mail/senha ou Google possuem **igual acesso a missões, trajes, conquistas, chefes e rankings**.
5. Progresso autorizado pelo backend, vinculado ao jogador; o navegador serve como cache e UI, não autoridade.
6. Progresso de longo prazo **não deve exigir login diário nem microtransações**.
7. Conquistas permanentes já liberadas nunca são revogadas simplesmente porque um novo balanceamento muda o alvo de uma missão, salvo revogação por fraude comprovada sob política transparente.
8. Condições precisam funcionar com partidas iniciadas no marco zero e nas Expedições Regionais, conforme o escopo explícito de cada missão.

## 3. Três caminhos que evoluem em paralelo

### 3.1 O Caminho — exploração e perseverança
- Distância **efetivamente percorrida** e validada, somada de todas as partidas.
- Maior distância de Jornada Completa, maior distância de Expedição Regional, regiões e ciclos alcançados.
- Pontos de partida são liberados quando uma nova região é **alcançada de forma legítima** na Jornada Completa. Derrotar o chefe anterior não é necessário.
- Distância para desbloqueio cosmético considera jogos válidos em ambos os modos, sem duplicar registros.

### 3.2 A Lâmina — habilidade
- Inimigos comuns derrotados, golpes normais/perfeitos, sequência máxima de cortes perfeitos, saltos duplos, deslizes válidos e trechos sem dano.
- Um `perfect slash` é validado por tick, no evento único do inimigo/chefe; um único overlap visual nunca gera várias contagens.
- A contagem cumulativa de cortes de precisão de missões não pode ser criada artificialmente por spam ou reinício de um mesmo boss.

### 3.3 O Espírito — chefes e feitos
- Primeiras vitórias em quatro chefes, selos, Traço da Aurora, feitos de uma corrida e ciclos avançados.
- Conquista de derrotar quatro chefes **numa única Jornada Completa** é distinta da conquista de reunir quatro selos em várias corridas.
- Chefes que recuam não contam como derrotados, mas os movimentos e a distância reais do encontro continuam válidos.

## 4. Categorias e regra de avaliação de missões (PROPOSTAS)

| Tipo | Escopo | Quando verifica | Recompensa |
|---|---|---|---|
| Missão de partida | Uma corrida individual | Finalização verificada da partida | Conquista/marca única do desafio |
| Missão de jornada | Cumulativa ao longo de múltiplas corridas | Atualização de totais verificados | Cosmético/conquista permanente |
| Missão regional | Região/ciclo/modo identificados | Eventos válidos daquela região | Emblema, acessório ou conquista |
| Desafio lendário | Condições difíceis e específicas | Verificação integral de replay | Cosmético raro, título ou emblema |
| Desafio periódico opcional | Janela global (se aprovado) | Runs verificadas no período | Distintivo não exclusivo ou reconhecimento, sem pressão diária |

**Recomendação:** no lançamento, todas as missões permanentes ficam disponíveis automaticamente; a UI exibe três objetivos de partida e três de jornada como destaques, mas não bloqueia progresso das outras. Um desafio concluído revela automaticamente o próximo destaque, sem depender de "ativar" missão antes da corrida.

**Sem moeda, shop, battle pass ou XP obrigatório na primeira versão pública.** Uma coleção de feitos cosméticos e marcos de jornada já oferece progressão sem burocracia.

## 5. Catálogo inicial detalhado de missões e conquistas (PROPOSTO)

### 5.1 Missões de uma partida

| ID | Nome PT-BR / EN | Condição verificável |
|---|---|---|
| M-R01 | Primeiros Passos / First Steps | Percorrer 500 m em uma Jornada Completa |
| M-R02 | Fio da Katana / Katana's Edge | Derrotar 5 inimigos comuns numa partida |
| M-R03 | Arte da Precisão / Art of Precision | Acertar 3 cortes perfeitos numa partida |
| M-R04 | Sobrevivente / Survivor | Percorrer 1.000 m sem perda de vida |
| M-R05 | Caminho Imaculado / Flawless Path | Percorrer 1.500 m sem sofrer dano naquela partida |
| M-R06 | Dança das Lâminas / Blade Dance | Fazer 8 cortes perfeitos numa partida |
| M-R07 | Pés Leves / Light Steps | Fazer 12 saltos duplos válidos na mesma partida |
| M-R08 | Percurso da Névoa / Mistbound Run | Iniciar no Templo desbloqueado e percorrer 1.000 m reais de Expedição Regional |
| M-R09 | Trilha da Tempestade / Storm Trail | Atravessar as Montanhas (entrada→saída) sem sofrer dano naquela seção |
| M-R10 | Quatro Horizontes / Four Horizons | Atravessar as quatro regiões numa Jornada Completa, com chefe derrotado ou recuado |

Essas missões são **feitos únicos de primeira conclusão**, não geradores repetíveis de pontuação infinita. A UI poderá mostrar versões de dificuldade crescente (bronze/prata/ouro) **somente se seus limiares forem formalizados e testados**, nunca com benefícios de gameplay.

### 5.2 Missões cumulativas de jornada

| ID | Nome PT-BR / EN | Objetivo | Recompensa proposta |
|---|---|---:|---|
| M-C01 | Peregrino do Vento / Wind Pilgrim | 3 km acumulados | Traje Peregrino do Vento |
| M-C02 | Sombra da Névoa / Shadow of the Mist | 10 km acumulados | Traje Sombra da Névoa (**já previsto**) |
| M-C03 | Corte Silencioso / Silent Slash | 50 cortes perfeitos válidos acumulados | Traje Corte Silencioso (**já previsto**) |
| M-C04 | Viajante Escarlate / Scarlet Traveler | 150 inimigos comuns derrotados acumulados | Traje Viajante Escarlate |
| M-C05 | Guardião do Vale / Valley Guardian | 50 km acumulados | Traje Guardião do Vale |
| M-C06 | Lenda Errante / Wandering Legend | 100 km acumulados | Traje Lenda Errante |
| M-C07 | Mil Cortes / A Thousand Slashes | 1.000 cortes perfeitos acumulados | Emblema de perfil Mestre da Lâmina |
| M-C08 | Passos Sem Fim / Endless Footsteps | 250 km acumulados | Título cosmético Caminhante Eterno |

A nomenclatura dos trajes adicionais e seus limites são **propostas**. O traje Ronin Errante e a habilidade de salto duplo permanecem disponíveis desde o começo. O progresso cumulativo não vence com o tempo.

### 5.3 Conquistas de chefes e ciclos

| ID | Nome PT-BR / EN | Condição | Recompensa |
|---|---|---|---|
| A-B01 | Raízes Rompidas / Severed Roots | Primeira derrota válida de Raiz Negra | Selo do Bambu |
| A-B02 | Sino Silenciado / Silenced Bell | Primeira derrota válida do Guardião do Sino | Selo do Templo |
| A-B03 | Vento Dominado / Master of the Gale | Primeira derrota válida do Espírito da Nevasca | Selo das Montanhas |
| A-B04 | Eclipse Dissipado / Eclipse Dispelled | Primeira derrota válida do Senhor do Eclipse | Selo do Eclipse |
| A-B05 | Guardião das Quatro Trilhas / Guardian of Four Paths | Reunir os quatro selos, mesmo em partidas diferentes | **Traço da Aurora — CONFIRMADO** |
| A-B06 | Lenda do Caminho / Legend of the Path | Derrotar os quatro chefes numa única Jornada Completa iniciada no marco zero | Emblema raro de perfil |
| A-W01 | O Primeiro Retorno / First Return | Entrar no Ciclo II numa Jornada Completa | Conquista |
| A-W02 | A Ruptura / The Rupture | Entrar no Ciclo III numa Jornada Completa | Emblema |
| A-W03 | Eclipse Eterno / Eternal Eclipse | Entrar no Ciclo IV numa Jornada Completa | Título de perfil |
| A-W04 | Caminho Ininterrupto / Unbroken Path | Completar um ciclo de 8 km sem perder nenhum coração | Conquista de habilidade |

A condição `A-B06` exige quatro chefes **derrotados em uma única corrida**, mas **não exige terminar a corrida voluntariamente** (o endless runner não possui final). Ao ocorrer a quarta derrota, a conquista fica apta à verificação quando a partida for finalizada. O requisito de "sem perder coração" é **apenas** para `A-W04`, não para `A-B06`. A retirada de um chefe não impede avanço do mundo nem desbloqueios de região.

## 6. Catálogo de trajes e itens cosméticos

**Conjunto inicial confirmado do plano anterior:**
1. `outfit.ronin_errante`: Ronin Errante — padrão, quimono desgastado e faixa carmesim.
2. `outfit.sombra_nevoa`: Sombra da Névoa — 10 km acumulados.
3. `outfit.corte_silencioso`: Corte Silencioso — 50 cortes perfeitos acumulados.

**Ampliação PROPOSTA para versão completa, sujeita a decisão e orçamento artístico:**
4. `outfit.peregrino_vento`: Peregrino do Vento — 3 km acumulados; manto claro com folhas estilizadas.
5. `outfit.viajante_escarlate`: Viajante Escarlate — 150 inimigos derrotados; faixa e padrões carmesins.
6. `outfit.guardiao_vale`: Guardião do Vale — 50 km acumulados; verde-musgo, adornos naturais.
7. `outfit.lenda_errante`: Lenda Errante — 100 km acumulados; tinta negra e detalhes dourados.

**Itens separados de trajes:**
- `effect.traco_aurora`: Traço da Aurora — quatro selos, **CONFIRMADO**; rastro de katana somente cosmético.
- `emblem.lenda_caminho`: emblema de quatro chefes na mesma Jornada Completa.
- Selos de região e títulos de perfil decorativos.

Todos utilizam colisão, velocidade, hitboxes, dano e alcance idênticos; sprites/efeitos não ocultam inimigos ou abismos. O usuário pode pré-visualizar item bloqueado e ver **exatamente** os critérios de desbloqueio.

## 7. Interface e feedback

**Menu principal > Pergaminho do Ronin**:
- abas `O Caminho`, `A Lâmina`, `O Espírito`, `Coleção`;
- objetivos em destaque, progresso em números e barras, origem do progresso (Jornada Completa ou Regional);
- catálogo de trajes com prévia, requisito, estado bloqueado/desbloqueado/equipado;
- Pergaminho dos Quatro Selos mostra cada chefe e como conquistá-lo;
- tela de resultados mostra `+ metros`, `+ derrotas`, `+ cortes perfeitos`, novas conquistas, novos trajes e selos (sempre distinguir **pendente de verificação** de **concedido**);
- mostrar progresso da carreira mesmo se não houve recorde, sem poluir HUD durante combate;
- troca de idioma PT-BR/EN atualiza toda a UI e descrições, não modifica requisitos nem dados de progresso.

**Ao completar quatro selos:** revelar `Traço da Aurora` em animação de pincelada; confirmar quando backend validar; mostrar botão para equipar ou ver na coleção. Pode ser equipado com qualquer traje e também desligado.

## 8. Rank mundial versus progressão

- Missões e conquistas **não dão bônus de score ou multiplicadores** no ranking.
- Pontuação competitiva segue fórmula versionada por distância real, inimigos, perfeitos e bônus fixos de chefes derrotados.
- `Jornada Completa` (inicia 0 m) compete no ranking global all-time/semanal; `Expedição Regional` compete apenas no ranking da região de início, sem contar metros pulados.
- Distância/cortes/inimigos cumulativos podem contar em ambos modos **se legítimos e verificados**; algumas conquistas exigem explicitamente Jornada Completa.
- Progressão não confere vantagens em speed, vida ou combate; pontos de partida alteram apenas o modo elegível para ranking.

## 9. Persistência e identidade (Ronin ID)

Tabelas lógicas adicionais propostas: `mission_definitions`, `achievement_definitions`, `cosmetic_definitions`, `player_mission_progress`, `player_achievements`, `player_cosmetics`, `player_cosmetic_equips`, `player_region_unlocks`, `player_career_stats`, `run_rewards`.

Cada definição de missão/recompensa registra:
- `id` estável, chave i18n, versão/estação se aplicável, `scope` (run/career/region/boss), modo elegível;
- métrica, comparador e alvo; dependências/desbloqueios; id do item prêmio e `repeatability`;
- data de início/fim **somente** para desafios temporários, se aprovados;
- regras de cálculo para alterações de metas sem revogação retroativa de prêmio legítimo.

**Algoritmo de concessão recomendado:** receber replay/partida → verificar seed, comandos, ticks, mortes, distância e score → gerar eventos confiáveis `run.completed`, `enemy.defeated`, `boss.defeated`, `perfect_slash`, `region.reached`, `cycle.entered` etc. → transação única: registrar run, atualizar totais, marcar missões e conquistas, registrar primeira vitória/selo, avaliar quatro selos, desbloquear Traço da Aurora, registrar cosméticos → publicar estado verificado.

- Unicidade por jogador + ID da conquista; cosmético não duplicado.
- Atualização de total/cosméticos **idempotente por `run_id`**, com concorrência/resubmissão protegida.
- `pending_verification` não deve criar recompensa definitiva.
- Visitante pode participar com apelido e progresso persistido no servidor até perder a identificação; vínculo seguro e-mail/Google preserva, com mesclagem por eventos únicos e sem duplicar vitórias.
- Não usar e-mail ou apelido público como chave de identidade de estatísticas.
- Dados pessoais e ferramentas de exclusão/exportação seguem política de privacidade e LGPD.

## 10. Desafios semanais — CONFIRMADOS, automáticos e escaláveis (v0.13)

**Decisão do produto:** desafios semanais opcionais fazem parte da **primeira versão pública completa**; um diretor automático seleciona, valida, publica, acompanha e encerra novos desafios **sem criação ou curadoria manual semanal**. Serão iguais para todos (visitantes, Google e e-mail), sem dias de login obrigatórios nem vantagens competitivas. O sistema usa templates versionados e faixas de metas, diversidade e proteção contra repetição, gerador determinístico, edição global imutável, PostgreSQL e eventos de runs verificados com atualização idempotente.

**Parâmetros propostos:** cinco desafios por semana (dois acessíveis, dois intermediários, um avançado); virada segunda 00:00 UTC; selo cosmético comemorativo da edição por conclusão total, gerado por combinação de assets reutilizáveis. Não criar itens manuais a cada semana. Detalhes, fallback, escalabilidade, segurança, UX e testes: [v0.13](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md).

## 11. Balanceamento por metas humanas

Distância de mundo e velocidade ainda são **parâmetros de teste**, não tempos garantidos; o catálogo deve ser avaliado com observações de partidas reais:
- 500 m e 3 perfeitos devem ser acessíveis a iniciantes após aprender controles;
- 3 km acumulados devem chegar cedo, 10 km em algumas sessões, 50/100/250 km como metas prolongadas;
- 50 cortes perfeitos devem ser desafiadores, mas não exigir precisão sobre-humana;
- quatro chefes na mesma partida deve ser conquista rara porém alcançável;
- evitar exigir que usuários joguem horas numa única sessão; metas de carreira são cumulativas;
- comparar tempo de desbloqueio em desktop versus touch e em dispositivos 30/60/120 Hz;
- não deixar jogadores sem novas metas imediatamente após ganhar os quatro selos.

## 12. Testes obrigatórios da versão completa

1. Replays legítimos em quatro regiões e múltiplos ciclos atualizam apenas distância **real** e ações válidas.
2. Recuperar três vidas a cada nova partida, **nunca durante** partida, mesmo em chefe, região ou ciclo.
3. Um chefe que recua não concede selo nem bônus, mas não bloqueia progresso de mundo; ataques evitados deixam vida intacta.
4. Primeira vitória concede selo uma vez, mesmo se o chefe reaparece em ciclos futuros.
5. Quatro selos adquiridos em corridas diferentes concedem **exatamente um Traço da Aurora**, equipado com qualquer traje, sem alterar hitboxes ou pontuação.
6. A conquista de quatro chefes em uma única Jornada Completa não é satisfeita pelo somatório de partidas.
7. Expedição Regional não concede progresso falso de regiões puladas nem entra no ranking mundial principal.
8. Reenvio do mesmo `run_id`, crash ou corrida duplicada não duplica totais, selos, conquistas ou itens.
9. Uma partida pendente/rejeitada não credita desbloqueios; UX informa claramente estado e razão geral.
10. Visitante, login e-mail e Google conservam progresso após vinculação e não perdem conquistas quando muda idioma; não mesclar identidades por simples igualdade de e-mail.
11. Conquistas/itens localizados `pt-BR/en` e equivalência exata de objetivos nos dois idiomas.
12. Testes de carga e índice do banco com milhares de runs e progressão cumulativa, mais testes de privacidade, transações e backup.
13. Mudança de `rules_version` não corrompe recordes históricos ou desbloqueios; documentação explicita política de migração.
14. Comparar desbloqueios e possibilidade de conquista em mobile horizontal com gestos e desktop.
15. Verificação de metas de longa duração (e.g. 100–250 km) com armazenamento de inteiros seguros e ausência de overflow.

## 13. Decisões ainda abertas (não implementar por suposição)

- Aprovar ou ajustar os **quatro trajes adicionais propostos**; três trajes anteriores e Traço da Aurora já fazem parte do planejamento.
- Aprovar seleção exata e metas dos 10 desafios de partida, 8 de carreira e 10 conquistas listadas (valores alvo são provisórios).
- **Resolvido:** desafios semanais entram desde a versão completa e serão autogerados, sem intervenção manual rotineira nem login diário. **Pendente:** confirmar o modelo de Selo da Semana (recompensa somente cosmética), os cinco slots/tiers e ajustar metas por playtest.
- Confirmar se o jogador pode escolher somente um efeito de katana por vez; recomendação: um efeito equipável e um traje, ambos independentes.
- Política final de contagem quando uma run é interrompida por rede, morte, refresh ou timeout da verificação.
- Definir tempo de feedback dos desbloqueios quando servidor estiver ocupado.
