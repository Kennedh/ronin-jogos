# ADR-010 — Quatro chefes e recompensas verificadas (parte 4)

Autorizada em 18/11/2026 pelo pedido “Iniciar parte 4”. Branch `feat/runner-bosses-4`, base `390dab9`/PR #7 aberto. Sem merge automático ou mudança de produção/VPS/DNS. Esta parte implementa os encontros e a concessão de selos; arte/áudio finais continuam na 6B, contas nas 5A/5B e catálogo/equipamento cosmético completo na 6A. O lançamento público continua exigindo todos os sistemas e os gates finais.

## Versão e contrato

Major 4, physics `rr-physics-0.4.0`, generator `rr-boss-director-4`, scoring `rr-score-boss-4`, assets `rr-boss-study-4`. Regras físicas permanecem iguais à major 3. A nova major separa as faixas reservadas, o algoritmo de chefes e os bônus. V1–V3 preservam seus manifests, estados e traces; somente v4 recebe `bosses`. `CURRENT_MANIFEST` inicia novas partidas locais na v4. Não atualizar golden antigo para esconder divergência.

Perfis de movimento e comprimentos v4 são fixados pelo loader ao conjunto certificado. Valores de chefes são baseline de playtest, versionados pelo algoritmo; mudar números de competição depois exige nova versão/recertificação. A aparência nunca muda hitbox, alcance ou velocidade. Não há comando BOSS_DEFEATED no replay: apenas JUMP/SLIDE/ATTACK e controles já existentes.

## Encontros em movimento

Um encontro por `(run_id,cycle,region,boss)`. O identificador local `b4:cycle:region:boss` é combinado com run_id na chave persistente. O calendário é calculado em distância real e offset regional, independente de FPS/janela do worker. Mantidos os parâmetros propostos da especificação:

| Chefe | Início global no ciclo I | Comprimento | Oportunidades | Acertos | Bônus |
|---|---:|---:|---:|---:|---:|
| B01 Raiz Negra | 1200 m | 240 m | 5 | 3 | 300 |
| B02 Guardião do Sino | 3140 m | 300 m | 6 | 4 | 450 |
| B03 Espírito da Nevasca | 5580 m | 360 m | 8 | 5 | 600 |
| B04 Senhor do Eclipse | 7520 m | 420 m | 9 | 6 | 900 |

Aviso 80 m antes; entrada nos últimos 20 m; encontro termina 60 m antes da borda regional, saída em até 40 m. O diretor v4 remove perigos das faixas de aviso/arena/saída com margem de composição; sem abismos na arena. O curso v3 não sofre essa mudança.

Fases derivadas: SCHEDULED → WARNING → ENTERING → ACTIVE → DEFEATED ou RETREATED → EXITING → COMPLETED. Cada oportunidade contém aviso de 1000 u (pelo menos 1,66 s no teto), ataque de 120 u e recuperação/vulnerabilidade. A sequência varia por seed/ciclo dentro de três famílias e não comprime o aviso nem aumenta dano/acertos indefinidamente. A velocidade mantém os quatro tiers anteriores e teto 600 u/s.

B01 alterna raízes baixas e galho alto; B02 onda alta/impacto baixo e contra-ataque; B03 rajada/fragmentos e aberturas aéreas; B04 cortes e investida frontal anunciada, seguida de recuperação. Um corpo decorativo nunca causa dano só por aparecer: somente a caixa anunciada do ataque atinge. Abertura real fica à frente do jogador, ligada visualmente ao corpo; B03 também apresenta alvo aéreo. Rendering usa os mesmos dados de fase/altura e alcance do core.

Um hit por oportunidade, inclusive vários frames do mesmo corte ou outro corte na mesma abertura. Corte normal conta; perfeito usa a tolerância de seis ticks convertida em deslocamento naquela velocidade. Concentração/combo/especial seguem a semântica anterior; especial não remove várias vidas do chefe numa única abertura. Chefe não é inimigo comum para o +30. Score: fórmula histórica + soma dos bônus únicos, quatro vitórias =2250 de bônus. Retirada não tira pontos, HP ou concentração; nenhuma transição/recompensa cura.

Prioridade: abismo fatal antes de ataques; acerto válido antes da retirada no mesmo tick-limite; dano comum após ataques segue a ordem histórica do core; retirada somente se o ronin permanece vivo. Resultado é terminal para a instância, não reabre após animação. Pausa congela o estado inteiro; retomar não cria novas oportunidades.

Estado competitivo guarda somente encontro atual, quatro contadores de vitória/retirada, máscara de selos e bônus decimal, com tamanho constante no número de encontros. O worker coleta eventos reconstruídos durante o replay sujeito à janela/quotas da partida; não guarda um histórico crescente dentro de cada state_hash de tick. Partidas longas e stream continuam nos mesmos limites de transporte.

## Persistência e privacidade

Migration nova `004_bosses`, anteriores intactas. `run_boss_outcomes` tem PK(run_id,instance_id), tipo/ciclo/região/tick/acertos/resultado/bônus. `player_boss_seals` tem PK(player,boss), source_run/instance e FK para outcome verificado do mesmo dono. `player_rewards` tem PK(player,reward), source_run verificado e timestamp. Não existe endpoint público para mintar selo/item.

Worker emite evidência somente reexecutando o core. A transação de `VerificationQueue.complete` valida o domínio, grava ledger, selos, conquistas iniciais, Aurora, outcome, regiões e outbox. Falha em qualquer escrita faz rollback de tudo. Lock do player serializa as concessões de partidas concorrentes, impedindo perder a última recompensa ao receber os dois selos finais juntos; restrições únicas impedem duplicação no retry.

Quatro selos podem vir de runs diferentes e expedições legitimamente desbloqueadas. Aurora e Guardião das Quatro Trilhas são permanentes e únicos por identidade interna, inclusive visitante; não dependem de localStorage. Lenda do Caminho exige os quatro tipos vencidos na mesma FULL; regional não satisfaz essa condição. QUIT verificado conserva esses cumulativos e continua sem ranking. Merge guest→conta será tratado na 5B respeitando estas FKs e unicidades.

GET /me/bosses expõe somente selos/recompensas do titular. RunStatus expõe `boss_results` agregado por quatro chefes somente em VERIFIED: derrotados, retirados e bônus decimal. PENDING/REJECTED não anunciam recompensa confirmada. Missões gerais/ranking/Creator/equipar rastro continuam em suas partes; não há loja, moeda nem vantagem física adicionada.

## Interface e assets

HUD PT-BR/EN mostra nome, energia, oportunidades restantes e instrução de altura/abertura. Avisos discretos e resultado diferenciam vitória/retirada/morte, com confirmação do servidor. Controles continuam teclado/gestos/toque; nenhum botão novo para atacar chefe. Sons suplementares originais são sintetizados por Web Audio, desbloqueados pelo gesto inicial e opcionais; cues visuais não dependem de áudio. Preferências podem ser locais, progresso não.

Quatro estudos vetoriais originais em boss-render.ts, com corrupção/purificação cosmética. A direção continua nanquim colorido sem copiar referência; não são assets finais nem homologação artística. Áudio/texturas/animações definitivos e efeitos de Aurora equipados permanecem na 6B/6A.

## Validação e limites

A QA encontrou capturas pretas do compositor sob relógio virtual, apesar de pixels corretos no canvas. A corrida PT usa agora relógio normal (cerca de 160 s reais), captura de página e teste de variedade dos pixels da área do canvas no PNG; EN mobile usa relógio virtual, captura direta toDataURL dos pixels e validação da paleta com o wash existente. A captura de página virtual é apenas diagnóstico, não evidência de aprovação visual. A paleta do papel é rgb(242,231,206); no rodapé do canvas mobile o wash resulta em rgb(236,226,201). O teste antigo supunha papel sem wash em toda tela e foi corrigido contra o desenho observado, sem alterar as cores do produto. Evidências finais no PR/PROGRESS após o gate. Fixtures de estudo reexecutam prefixos reais do core, são privadas e não entram no dist ou criam score. Testes de domínio também usam estados neutros analíticos identificados; o teste HTTP de replay completo comprova a trajetória desde zero.

Cobertura: esquiva sem atacar nos quatro chefes, duas classes de seed, velocidades/ciclos 1/2/3/4/5/6/50, margem ±3 ticks; vitórias únicas, janelas fechadas, empate no limite, zero cura e três danos fatais. Duas jornadas completas de vitória e cinco ciclos mistos (10 vitórias/10 retiradas) contínuos. API/PG/worker reais, rollback/retry, concessão cumulativa regional e concorrente, fraude de finish, progresso privado e hashes. Paridade Node/Chromium em 30/60/120 com os quatro chefes e vitória/retirada. Regressão integral das partes anteriores exigida.

Aparelhos físicos, Safari, reação humana, áudio/arte finais, merge de contas e lançamento público seguem pendentes. Este gate reduz regressões; não prova ausência universal de defeitos, origem humana do replay ou capacidade da VPS. Próxima parte 5A somente por novo pedido, com transporte local de e-mail de teste; não criar SMTP/Google/DNS externos sem autorização específica.
