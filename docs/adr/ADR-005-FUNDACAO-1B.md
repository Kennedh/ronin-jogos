# ADR-005 — Física, codec e PostgreSQL da1B

Estado: implementado em branch de desenvolvimento em17/11/2026. Complementa ADR002/003 sem mudar invariantes de produto. Esta parte não publica o jogo nem implementa a fila/API da1C.

## Motor

Core puro,60ticks/s; cálculo em milli-unidades. Divisão com resíduos usa BigInt internamente e volta a inteiros seguros para impedir arredondamento perto de MAX_SAFE_INTEGER; score é string decimal desde a origem. Integração semi-implícita: atualiza vy pela gravidade e depois y, com truncamento para zero e resíduos preservados. Zero negativo é normalizado. Uma fixture independente fixa primeiro salto: primeiro tick y=-11916,vy=-715000,resto=-40; segundo y=-23250,resto0; ápice na amostra21 y=-127750; pouso na42 em chão plano. Essa discretização é baseline de playtest, não simulação contínua aproximada promovida sem teste.

Manifest inicial rr-physics-0.1.0 com parâmetros v0.18; compileRules valida/congela manifests candidatos, e o estado liga versão e descritor canônico de todos os parâmetros. Step recusa troca de configuração mesmo que alguém reutilize a string de versão. O descritor não é hash criptográfico nem prova de cliente honesto; Ticket/registro persistido deverão ligar hashes/versões na1C. Manifests/implementações antigas precisam ser preservados ao mudar regras competitivas.

World é um contrato imutável de geometrias/entidades autoritativas, não dado recebido do replay. Nesta etapa há primitivas de piso plano, vãos, obstáculo e inimigo comum; diretor procedural, quatro regiões, arquétipos avançados e chefes chegam nas partes3/4. Nenhum mock de chefe é anunciado como pronto. PRNGxoshiro128** v1 separado em world/enemies/cosmetic, seed128bits hexadecimal; render não consome RNG competitivo.

Coordenada y=0 no piso e positiva para baixo. Apoio usa centro do pé; um salto sobre a projeção horizontal de um vão não é morte. y>=120unidades abaixo do plano define a fronteira fatal, antes de prêmio de ataque/dano comum; coyote5ticks e salto duplo só antes de DEAD. Imutável após morte/QUIT; pausa não muda tick, cooldown ou score. Em voo sem primeiro salto e fora de coyote resta somente o impulso aéreo de duplo salto. Buffer vale6ticks com fim exclusivo; ao pousar no intervalo consome o buffer para o próximo impulso, sem cura.

JUMP vence SLIDE simultâneo; slide não começa durante ciclo de ataque e não inicia outro ataque. Slide33ticks+recuperação6, prolongando postura baixa somente se o personagem ainda não tem espaço para levantar sob teto. Ataque windup4/active7/recovery11, perfect±6 inclusivo. Ataque ativo resolve inimigo antes do dano de contato, uma derrota por entidade; dano comum-iFrame54ticks, abismo ignora iFrame. Resolved IDs são retirados quando a entidade fica seguramente atrás do personagem. Concentração/especial, bosses e múltiplos ciclos completos não são parte desta entrega.

Clock usa microssegundos inteiros e acumulação racional; frames não eliminam ticks silenciosamente. Intervalo superior a1segundo exige pausa/rebase explícito na futura integração1D, em vez de executar trabalho ilimitado ou fingir tempo competitivo. Paridade em30/60/120 é teste das cadências alimentadas ao clock em navegador real; não é medição de FPS/GPU nem homologação de celular.

## Replay

Implementados canonical/parseJson/encode/decode/hash/cursor e playback puro. JSON é o subconjunto JCS de números inteiros seguros e strings Unicode válidas: chaves ordenadas por UTF-16, arrays na ordem; rejeição de chaves duplicadas após escapes, UTF-8 inválido, surrogates isolados, excesso de profundidade/tamanho, números inseguros e arrays esparsos. Vetor SHA256 em tests/fixtures/replay-v1.json calculado independentemente em Python, não gerado pelo módulo sob teste.

Cada envelope contém comandos; nunca vida, score, posição, dano ou kills livres. Intervalo[start,end), até3600ticks, até2ações distintas por tick com prioridade JUMP/SLIDE/ATTACK. Controls têm sequência global, podem ocupar fronteira end e segmentos sem avanço de tick; pausa exige RESUME no mesmo tick congelado antes de voltar a avançar. QUIT encerra a cadeia. assertFinish confere compromisso estrutural; replay físico ainda precisa comprovar HP_ZERO/ABYSS/QUIT no worker da1C. ACK/hashes não são VERIFIED.

Transporte identity implementado com limite256KiB. Parse JSON estrito tem teto1MiB descomprimido para reutilização; gzip e sua proteção contra expansão em streaming ficam na ingestão1C. Não anunciar gzip como ativo nesta etapa. Cursor verifica partes em ordem com memória limitada; API1C poderá recebê-las fora de ordem e persistir antes de validar cadeia. Cache dos validadores Ajv por ref evita recompilar o schema a cada parte; mesma fonte OpenAPI/DTO.

Playback opera no mesmo core, sem relógio/rede/DB; não é job worker. Schema/controle/encadeamento e física são camadas diferentes de validação. Nenhuma comparação aqui prova origem humana dos comandos. Antes do cliente público1D/release, geração standalone dos validadores ou arquitetura equivalente deve preservar CSP sem adicionar unsafe-eval só para Ajv.

## Banco

Driver pg8.23.1, PostgreSQL nativo18.6 via launcher embedded-postgres18.6.0-beta.19 para desenvolvimento/QA. Wrapper beta não indica servidor PostgreSQL beta. Ausência de Docker/psql local não levou a um banco fake. Loopback127.0.0.1, SCRAM,12conexões/16MiB shared_buffers, sem criar serviço ou usuário do sistema.

Dev persistente: npm run db:dev, porta15432, artifacts/dev-postgres, credenciais fictícias em.env.example. Ctrl+C para só o processo iniciado; dados são preservados. --check valida startup/migrations e encerra. QA usa mkdtemp e porta livre, credencial aleatória não logada, para/limpa apenas diretório próprio após verificar caminho absoluto. CI executa o mesmo servidor real nos dois SOs. Native18.6 é versão de teste, não escolha de runtime de produção: patch/licenças/budgets serão revistos antes da operação pública.

Migrations001identidade/rules/runs/segments e002jobs/outcomes/outbox/boards. LedgerSHA256 UTF-8 com finaisLF canônicos (CRLF não é mudança de schema), prefixo ordenado, detecção de arquivo removido/alterado, lock transacional advisory, timeout10slock/30sstatement. Lote pendente inteiro numa transação. IF NOT EXISTS somente para bootstrap do ledger; domínio não oculta drift. Falha nova preserva schema/dados anteriores e libera lock por rollback. Não há down destrutivo automático.

UNIQUE(run,index), FKs de dono/status/motivo, limites de partes, score numeric inteiro finito, QUIT nunca ranked, chaves de board semNULL. Jobs incluem generation/lease, mas claim/heartbeat/fencing e commit de progresso ainda serão implementados/testados na1C/7. Constraints são defesa adicional; não substituem autorização de API nem prova de gameplay.

## Evidências e limites

npm run verify aprovado localmente:33testes unitários/integração (incluem9originais),2testes navegador, contrato/geração/types/lint/formato/build. Casos: fixture aritmética, coyote/buffer/slides/ataque,3→2→1→0, abismo3/2/1+iFrame, simultaneidade,32bits/MAX_SAFE, manifests e RNG; JSON hostil, sequência/pausa/100partes, playback;300inimigos/12000ticks com IDs resolvidos limitados; DB vazio/upgrade/concorrência/drift/rollback/constraints e números além de JS. Curso300inimigos é fixture sintética, não validação do diretor procedural.

Chromium local157.0.8103.78:600estados competitivos, score e trace SHA idênticos a Node24.14.0 nas três cadências. Trace final0481dd7bcf1f468aca5e64a1013903cc631e4a3aad91377fbc7016a8d47733cc. Estado termina RUNNING/3HP/1kill/600ticks. Sem captura visual de jogo inexistente, sem alegação de arte/mobile concluídos. Teste de DB mostra server_version18.6 e listen_addresses127.0.0.1; cluster QA é removido após execução.

Continuidade em PROGRESS.md; evidências privadas artifacts/phase-1b-*. Nenhuma migração, coleta, DNS ou serviço de produção foi alterado. Aviso picomatch de desenvolvimento da1A permanece pendente de revisão. Runtime npm audit --omit=dev reportou zero nesta execução; isso não substitui revisão de PostgreSQL/OS/arte antes de release.
