# ADR-009 — Diretor, regiões, ciclos e arquétipos (parte 3)

Estado: implementado em `feat/runner-director-3`, base `3174bd7`/PR #6, em 18/11/2026. O proprietário aceitou a revisão funcional da parte 2, pediu apenas aumentar os abismos agora e autorizou a próxima etapa. A referência enviada orienta nanquim colorido, camadas de profundidade e silhuetas claras; não aprova o boneco como arte final nem autoriza copiar sprites. Hitbox do jogador e efeito de demolição/tropeço ficam fora desta rodada. Chefes pertencem à parte 4; arte/áudio finais à 6B. Não houve merge ou alteração na VPS/DNS/serviços existentes.

## Versão e distância

Major 3, physics rr-physics-0.3.0, generator rr-director-3, assets rr-four-biomes-study-3; codec rr-input-v1 e fórmula rr-score-1 preservados. Somente estados v3 recebem journey/damaged/tick de resolução. V1 e v2 mantêm formato e comportamento exatos; manifests append-only e despacho histórico continuam no cliente/worker. Não atualizar golden antigo para mascarar mudança.

Regiões baseline: Bambu 1500 m, Templo 2000 m, Montanhas 2500 m e Castelo 2000 m. Após 8000 m reinicia o Bambu, continuamente. Speed tiers de ciclos I/II/III/IV+: 360/440/520/600 u/s, teto estável no IV em diante. Corrupção fica entre 0 e 3. Troca de região/ciclo não recupera vidas, concentração, combos, distância ou cooldowns. Eventos REGION_ENTER/CYCLE_ENTER vêm do core.

Expedições começam com offset da região desbloqueada, 3 vidas e condições iniciais padronizadas; distance e score contam somente deslocamento real desde zero. O offset é usado na escolha da região/ciclo, não como metros gratuitos. Relógio tickAtDistance reproduz a integração inteira com resíduos, inclusive o excesso de posição ao cruzar um ciclo; não arredondar tempos por FPS. Journey usa divisão/mod de BigInt nos limites. Política de comparabilidade exige congelar o perfil antes do público e nova major para mudança competitiva; os números continuam baseline de playtest.

loadManifest aceita v3 somente com o perfil de movimento certificado; comprimentos das regiões são tunable antes da publicação. Não habilitar uma gravidade/hitbox/velocidade nova apenas trocando números sem recertificar o catálogo e registrar a versão. Regiões sintéticas curtas são usadas apenas na fixture de paridade, identificadas como tal; o replay de cinco ciclos usa os comprimentos padrão inteiros.

## Geração por janelas e segurança

Diretor puro por seed de servidor + índice de bloco; não depende de FPS, tamanho do lote, cache ou estado de renderização. Um contador de 128 bits alimenta xoshiro com quatro rodadas de mistura antes da seleção, incluindo as partes baixas da seed. Escolhas e entidades são idênticas em janelas sobrepostas. IDs vinculam bloco/slot/filho, sem duplicar inimigos em streaming.

Blocos de 6000 u/150 m, no máximo três perigos separados por 1500 u; primeira posição a 1250 u da entrada. Cada quatro blocos há respiro; intensidade alterna aprendizado/moderada/pico/respiro e cresce até um teto, sem comprimir avisos ou aumentar dano. Entrada/transição de regiões e faixa reservada para o chefe futuro possuem piso livre. Não há chefe falso nesta etapa. Arquetipos/ciclos/regiões filtram candidatos; inconsistência de admissibilidade produz REST determinístico, sem travar o gerador.

Catálogo: P01–P12 da especificação e P13–P16 para Sombra, Guardião, Espírito e combinação do Castelo. E02 só aparece no fim do primeiro Bambu; E03 no Bambu corrompido/Castelo; E09 somente ciclo III+. A seleção é de templates com entrada/saída neutras certificadas, em vez de mudar um padrão já visível ao reagir ao input do jogador. Uma escolha ruim do jogador ainda pode causar dano; não se promete resgatar qualquer estado arbitrário.

Abismos novos têm **190 u ou 280 u** de abertura real (fundação anterior: 90 u), com solo seguro entre ações e desenho correspondente até o fundo da viewport. Não aumentar apenas o sprite deixando colisão estreita. O longo admite duplo salto universal. Testes do core validam atravessamento em todas as velocidades e margens de input. A caixa 44×88 do personagem permanece inalterada.

A largura lógica horizontal continua 1280, personagem em 324, independente do dispositivo. Como o aviso precisa anteceder a decisão de salto, há também texto PT/EN discreto fora da cena: ativa ao aproximar a 1,5×speed +340 u da borda, cobrindo 1,5 s antes do comando mais antecipado da busca certificada, mesmo com a borda fora da tela. Pausa oculta esse aviso. Limiares/legibilidade humana ainda exigem aparelhos reais; o cálculo não prova reação universal.

## Comportamentos autoritativos

ActorScript possui cue/active/recover/exit e variante, em ticks absolutos. SPAWN/APPROACH/TELEGRAPH/ACTIVE/RECOVERY/EXIT são reconstruídos por worldAtTick, usado no core e renderer. Dados de posição/dano não vêm do replay do cliente. Animações e gráficos representam as mesmas caixas; não há segunda física no Phaser.

- E01: soldado com antecipação e corte baixo.
- E02: lanceiro alto, estocada com avanço e abertura de contra-ataque na recuperação.
- E03: espírito suspenso que desce e retorna previsivelmente.
- E04: arqueiro, trajetória alta/baixa anunciada e flecha móvel.
- E05: guardião largo, maça com área frontal e vulnerabilidade na recuperação.
- E06: lobo baixo com avanço e salto curto.
- E07: andarilho, sequência de três fragmentos da mesma altura, com intervalo compatível.
- E08: guarda alta/baixa e investida, com recuperação vulnerável.
- E09: sombra em altura fixa anunciada, perigosa/vulnerável em fases explícitas, ciclo III+.

Corpo e ataques possuem IDs/damageOwner. Um golpe do mesmo dono não retira várias vidas durante a sobreposição; i-frames e abismo continuam distintos. Posições de projéteis usam inteiros por tick. Inimigo eliminado antes de disparar cancela o projétil; disparo já ocorrido persiste. Corte de projétil gera DEFLECT sem kill, perfect ou concentração. Ataque/especial não duplicam prêmios e respeitam vulnerabilidade. Marcas resolvidas v3 guardam tick e uma margem temporal de streaming, com poda; não cresce um histórico por quilômetro.

Todos podem ser eliminados por inputs legais ou evitados conforme padrão; perfect não é obrigatório. Representações vetoriais, poses e armas são funcionais/provisórias. Ilustrações/silhuetas finais e sinais sonoros completos permanecem na 6B; não anunciar arte/áudio homologados com esses desenhos. Duplo salto, ataque aéreo, slide, controles e regras da parte 2 permanecem.

## Persistência e UI

O worker verifica o replay inteiro e calcula o outcome. Na mesma transação de VERIFIED/outcome/outbox, deriva as regiões alcançadas do manifest, região inicial e distância verificada, e insere player_regions idempotentemente. ACTIVE/PENDING/REJECTED não concedem desbloqueios; crash na outbox faz rollback de score e regiões. QUIT íntegro pode confirmar chegada a regiões, como progresso cumulativo, mas permanece sem ranking. Missões, cosméticos e projeção pública de ranking ainda são parte 7.

GET /me/regions autenticado/mesma origem expõe somente IDs próprios. Bootstrap já fornece region_unlocks; o seletor usa esses dados, bloqueia opções fechadas e a API confere novamente. Chave idempotente fixa modo/região no retry. Não há modo público de conceder unlocks. As permissões pré-gravadas no teste de UI são somente fixtures do Postgres efêmero.

HUD mostra região/ciclo reais em PT-BR/EN, distância sem offset e aviso de abismo. Quatro estudos vetoriais têm paletas/props/céu/fundo/meio/solo, transição cosmética por distância e corrupção com alterações de ambiente; nenhum filtro modifica colisão/visão física. Movimento reduzido mantém os sinais de perigo. A arte final seguirá a referência de nanquim colorido, sem copiar os materiais fornecidos.

## Comprovação

Instalação limpa e npm run verify: **90 unitários/integração +28 browser**, zero falhas/skips, contratos/tipos/lint/formato/build. Inclui toda a regressão 1A–2. OpenAPI 0.23, validadores standalone e CSP mantidos; nenhum script de release falso.

Certificação por busca limitada de respostas em macros, executadas no core verdadeiro: 16 padrões ×2 variantes ×4 velocidades ×3 deslocamentos de timing, com confirmação adicional de cada candidato em ±3 ticks. Certificado positivo é uma rota concreta sem dano e saída neutra; falha da busca é descarte, não prova de impossibilidade. Não é solver exaustivo de todo input humano. Arquivo privado pattern-witnesses.json registra comandos/nós.

10 mil seeds ×quatro regiões ×cinco ciclos ×três posições amostradas =600 mil decisões, verificando gates, intensidade, repouso, diversidade e janelas estáveis. Isso complementa as provas dos templates; não simula todas as runs de todas essas seeds. Um percurso padrão completo de cinco ciclos/40 km concatena 267 blocos, 197893 ticks, 55 segmentos no transporte e preserva HP; o worker com janelas de outro tamanho chega ao mesmo hash. Testes também cobrem 100 eliminações com IDs podados, nove arquétipos/duas variantes, acerto único, parry sem score, falha real de transação/retentativa e recusa de start bloqueado/replay falso.

Paridade V3: 3600 estados/cenário entre Chromium/Node em 30/60/120; trace f2eb7c113e7d876b63a049628f54b0dc48d755fb2e41c9d5b4f670121dcd613f. Traces v1/v2 preservados. UI usa dist real, API/Postgres/worker reais; quatro regiões autorizadas começam em zero, hashes conferem, PT/EN/mobile/CSP sem erro. Fixture separada de renderização deriva prefixo alcançável do core para conferir pixels/profundidade do abismo e corrupção máxima; não é uma pontuação submetida nem uma página pública. Capturas revisadas em artifacts/phase-3. CI final deve ser consultada por commit.

Aparelhos físicos/Safari, percepção de tempo humano, áudio/arte finais, carga/soak/restore, nove arquétipos com assets definitivos e quatro chefes completos ainda precisam de gates posteriores. Replay íntegro não prova jogador humano. Auditoria runtime sem ocorrências; aviso dev picomatch (ADR004), 19 avisos OpenAPI e chunk Phaser grande permanecem documentados. Nenhum deploy, DNS, VPS, GA, AdSense ou outro site foi modificado. Próxima parte 4 depende de novo pedido.
