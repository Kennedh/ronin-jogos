# ADR-007 — Primeira corrida integrada da 1D

Estado: implementado em branch de desenvolvimento `feat/runner-foundation-1d`, base `bd24224`/PR #4 (1C). Pedido expresso do proprietário: “Iniciar 1D”. Complementa ADR001–006; não altera regras de produto, migrations 001–003, VPS, DNS ou os sites existentes. O jogo completo e a publicação continuam nas etapas seguintes.

## Fronteiras e execução

`runner-core` continua a única física, a 60 Hz. `runner-client` separa API, recorder, sessão, gestos, envio e cena. O entrypoint puro não importa Phaser; o subpath `/scene` importa Phaser 4.2.1 dinamicamente, apenas na página do jogo. Hub em /; entrada neutra /roninrunner; idiomas /roninrunner/pt-br e /roninrunner/en. Seleção de idioma durante a pausa preserva a mesma partida. LocalStorage contém apenas preferências/idioma, nunca tokens, scores ou payload de replay.

RunSession obtém seed/manifest histórico pelo ticket da API. `GET /runs/{id}/manifest` exige sessão/dono e devolve o manifest append-only vinculado; cliente confere schema, hash e todas as versões antes de começar. A UI nunca envia score. Há FULL e REGIONAL_BAMBOO, mantendo o gerador primitivo autoritativo da 1C. O diretor, regiões e chefes completos continuam nas partes 3/4; não fingir que FULL já contém esse conteúdo.

Cena Canvas2D original com bambus, relevo, sol, silhueta animada, obstáculos, inimigos comuns e vãos. Posicionamento/hitbox vêm do core e escala do manifest, sem uma física Arcade paralela. O enquadramento preserva 1280 unidades horizontais e adapta somente altura lógica entre 360 e 720, sem modificar o estado competitivo. Isso evita reduzir a cena a uma faixa minúscula em celulares largos; a baseline de salto fica visível nessa faixa. FOV/hitbox/telegraph definitivos ainda exigem validação com regiões e arte finais.

## Inputs, tempo e pausa

Teclado: Espaço/↑, S/↓, J e Esc. Repetição de tecla, atalhos de sistema, edição de campos e ativação nativa de botões não viram salto duplicado. Comandos são deduplicados por tick e ordenados JUMP/SLIDE/ATTACK, no máximo dois conforme codec. Inputs coletados durante pausa/countdown são descartados. Botões alternativos aceitam ponteiro e teclado sem duplicar o click de ponteiro.

Gestos usam CSS px: toque <18 px e <230 ms; swipe vertical >=35 px com predominância 1,3, disparado assim que reconhecido. Swipe não vira tap; arrastar e voltar não ataca. Cancelamento/perda de captura/multitouch invalidam o gesto, com bloqueio da sequência ambígua até todos os dedos saírem. Lostpointercapture de um ID já encerrado não limpa os outros dedos; perda inesperada invalida a sequência até releaseAll. Touch-action restrito à superfície, sem bloquear toda a página.

Relógio inteiro em micros e FixedClock já testado em 30/60/120 cadências. Delta negativo ou acima de 250 ms provoca pausa protetora; não recuperar frames matando o jogador. Pausa limpa inputs, congela toda a física, registra PAUSE e sela o trecho; retomada mostra 3–2–1 sem ticks e registra RESUME no mesmo active_tick. Focus/visibility/orientação/saída de fullscreen pausam. Camada opaca esconde a cena durante pausa/countdown; diálogo tem foco e teclado, header/footer ficam inert. QUIT pede confirmação, gera controle real e nunca ranqueia.

Fullscreen é solicitado diretamente no gesto de iniciar, com orientação paisagem quando disponível. Recusa/ausência não impede jogar. Retrato pausa no tick zero, oferece orientação recomendada ou continuação explícita. Resize muda câmera, não física. pagehide persistido pausa e conserva renderer; pageshow persistido redimensiona. Unload final destrói recursos; beforeunload protege run/envio em memória. Histórico/BFCache não pode restaurar um motor já destruído.

## Transporte, memória e resultado

Fetch mesma origem, credenciais same-origin, cache no-store e timeout 15 s. Fetch nativo vinculado a globalThis (chamada como método de classe sem bind falha no browser real). CSRF/identidade ficam em memória; cookie continua HttpOnly. Idempotency-Key e modo ficam estáveis em retry de start, inclusive resposta perdida após commit. Uma sessão trocada não cria silenciosamente outro dono. ACK só libera payload após conferir run/index/hash.

Recorder sela a cada 3600 ticks ou estimativa de 180000 bytes; controles também têm corte de segurança. Hashes são serializados e encadeados, com sequence global e bytes canônicos. Partes confirmadas são liberadas; mantém-se apenas o commitment necessário. Buffer pendente limitado a 8 MiB; reserva 8192 bytes e dois índices para pausa/QUIT antes dos tetos do ticket (128 MiB e 10000 partes na baseline). Limite técnico pausa com explicação, sem matar o personagem. Isso não implementa retomada durável: payload não enviado é perdido ao fechar/recarregar; a UI explica e protege navegação. IndexedDB/checkpoints/retention completos pertencem à parte 8.

Uploads sequenciais em background, finalização com commitment imutável antes de completar partes faltantes para reservar a janela 72h/+24h da API, retry explícito/reconexão com mesma identidade. Retry-After bloqueia repetição antecipada. Status pendente consultado a cada 1 s; sem polling após terminal/dispose. UI diferencia estimativa local, envio, pendente, VERIFIED, REJECTED, expiração e falha de rede. Nova corrida só libera após finish recebido e payload pendente zerado; confirmação depende exclusivamente do status autorizado da API. QUIT mostra resultado validado sem ranking. Não há leaderboard/recompensa falsa nem projeção de carreira nesta etapa.

## Contratos, CSP e origem

OpenAPI passa a 0.21 com PhysicsRules/RunnerManifest/RunManifest e rota histórica. Tipos/schemas/validators são gerados juntos, nunca editados manualmente. Ajv 8.20.0/ajv-formats 3.0.1 são ferramentas dev; standaloneCode + Rolldown 1.2.19 geram ESM autocontido, sem compilação dinâmica no runtime. O gate confere bytes reproduzíveis e teste Node proíbe geração de código por strings. Contratos herdados da 1A–1C continuam testados.

Build injeta CSP por meta e preview envia header: script-src self, sem unsafe-eval ou script inline, connect-src self, object-src none, base-uri self e form-action none. A única permissão inline de estilo é style-src-attr para o tamanho aplicado pelo Phaser. Não adicionar essa permissão a scripts. Dev permite websocket local do HMR; não é configuração de produção. API local default PORTAL_ORIGIN=127.0.0.1:5173; proxy /api preserva Host (changeOrigin false). Abrir localhost em vez de 127.0.0.1 muda a origem e deve ser corrigido no ambiente, não relaxar CSRF/CORS.

## Validação e limites

Gate: npm ci e npm run verify. O build ocorre antes dos testes browser; helper serve exatamente dist com CSP, proxy para Fastify real, PostgreSQL efêmero real/migrations e worker real. Sem fake score/DB, skips ou conexões a serviços de produção. As credenciais sintéticas do worker são transmitidas por IPC, não argv/logs. Clusters/processos de QA são encerrados no fim.

Testes novos cobrem paridade de sessão/replay, pausa/countdown/frame longo, inputs/gestos/cancelamento, divisão longa/densa, ACK inválido, finish perdido, validação sem eval, manifest histórico/autorização e fluxo completo de navegador. Browser cobre morte ABYSS com estado final igual ao outcome, QUIT/pausa/idioma/contagem, worker atrasado, rede offline/retry, finish/start com resposta perdida após commit, finish adulterado recusado, controles alternativos por teclado, gestos reais CDP/multitouch, fullscreen recusado, retrato/rotação, retorno ao histórico e perda de foco. Há inspeção de pixels do canvas, cores computadas, overflow, largura de cena, CSP e erros JS. Capturas revisadas em artifacts/phase-1d. A paridade anterior de 600 estados/cadências continua preservada.

Evidência consolidada e contagens finais ficam em PROGRESS.md e no PR. Chromium mobile é emulação; fullscreen/orientação física/Safari/iPhone/Android reais e FPS de aparelho ainda não foram homologados. O teste de foco emite blur controlado, não mede todas as políticas do SO. CSS/capturas locais não aprovam arte final.

Phaser gera chunk lazy de aproximadamente 1,37 MB (359 kB gzip); Vite mantém aviso de chunk grande. Shell ~21 kB, CSS ~14 kB e controlador/contratos ~231 kB, antes de gzip. Não esconder o aviso com limite artificial: orçamento/carregamento/caching e aparelhos serão medidos nas partes 9/10. Não afirmar alto FPS universal ou escalabilidade da VPS com estes testes locais. Aviso dev picomatch (ADR004) continua pendente; auditoria de runtime foi salva sem ocorrências, como foto temporal.

Arte/atribuições: [FOUNDATION_ASSETS](../FOUNDATION_ASSETS.md). Referências primárias: [Phaser ScaleManager](https://docs.phaser.io/api-documentation/class/scale-scalemanager), [Ajv standalone](https://ajv.js.org/standalone.html), [Rolldown output](https://rolldown.rs/reference/OutputOptions). Nenhuma chamada GA/AdSense/Google Identity foi acrescentada. Próxima parte 2: combate completo/concentração/especial e prova de rig/animação, só após novo pedido. Issue #1 depende da revisão/integração de 1A–1D; não fechar pelo simples término desta branch.
