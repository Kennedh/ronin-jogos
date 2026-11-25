# Ronin Runner — continuidade

## Estado atual — parte 6A, Criador de Ronin

No menu de Ronin Runner, abra **Criador de Ronin**. Há um segundo acesso no perfil Ronin ID. O visitante pode editar cabelo, rosto, pele, roupa, acessórios e katana, experimentar a Aurora e os emblemas de chefes e salvar o visual para a próxima corrida. O servidor reconhece apenas itens livres ou conquistas verificadas.

A branch `feat/runner-creator-6a` parte do PR #13. A migração 010 mantém os jogadores existentes com o visual padrão até a primeira edição. O [ADR 012](docs/adr/ADR-012-CRIADOR-DE-RONIN.md) descreve persistência, controle de concorrência, renderização compartilhada e testes. O próximo marco é a parte 6B, com arte, áudio e telas finais.

## Parte 5B — privacidade e moderação

O painel de privacidade do Ronin ID em PT-BR/EN oferece exportação dos dados de conta, sessões e progresso em JSON. O servidor valida autenticação recente e limita cada página a 200 partidas. O navegador monta o download. O pacote usa metadados e resultados próprios e deixa os segredos e dados técnicos antifraude no servidor.

A migração 009 adiciona exclusão reversível e revisão de apelido. O pedido oculta o perfil público, revoga sessões anteriores e suspende novas partidas. A sessão restrita permite exportar, reautenticar com o método cadastrado ou cancelar em até sete dias. Depois do prazo, a manutenção remove os dados de acesso, apelido, sessões, tokens e e-mails da fila. Os resultados e as evidências competitivas ficam com identidade pública oculta. O estado interno ANONYMIZED mantém IDs opacos para integridade, sem representar uma decisão jurídica sobre anonimização.

A moderação registra motivo e data. O jogador vê o estado e pode pedir revisão. A visão de identidade pública esconde apelidos moderados e perfis privados ou em exclusão. A fila e a resolução são operadas localmente com os comandos documentados no README.

A execução automática em produção, a política final de retenção de replays, logs, backups e a homologação de Google e SMTP pertencem à preparação operacional. A revisão de pontuações públicas e as projeções de ranking pertencem à parte de carreira e ranking.

## Parte 5B — fusão explícita de perfis

O Ronin ID permite transferir o progresso do visitante para uma conta existente após prova por senha ou Google. A prévia mostra apelidos, partidas, recorde elegível, regiões, selos e recompensas, com confirmação válida por cinco minutos. Partidas do visitante em andamento ou em verificação precisam terminar antes da fusão.

A migração 008 registra a operação e a origem das partidas. O banco move a propriedade de partidas encerradas e suas evidências sem reconstruir replays, mantém o mesmo ID e preserva a preferência e o apelido da conta de destino. Regiões, selos e recompensas são unidos sem duplicação. Quatro selos distribuídos entre os perfis liberam o Traço da Aurora. A fusão emite um único evento de outbox, encerra o visitante e revoga suas sessões dentro da transação. Uma repetição autenticada no destino reaproveita o resultado. Após perder a resposta da confirmação, o jogador pode recuperar o progresso por login na conta de destino.

Tabela de ranking, semanários, criador e inventário ainda pertencem às suas respectivas fases. Suas projeções devem usar as partidas verificadas da conta canônica e o evento de fusão. Exportação, exclusão e moderação foram implementadas na fatia subsequente, descrita acima.

## Parte 5B — Google e métodos vinculados

Implementação em `feat/runner-google-5b` sobre `fcbc214`/PR #10. O Ronin ID aceita login com Google, converte um visitante no mesmo jogador e associa Google a uma conta por e-mail autenticada. Uma conta criada pelo Google também pode adicionar e-mail e senha após reautenticação e confirmação do endereço. É possível desvincular o Google quando existe senha. A operação revoga sessões e entrega uma sessão nova.

A migração 007 adiciona identidades por `(provider, subject)` e uma prova de cinco minutos vinculada à sessão e à finalidade. O callback do Google Identity Services passa pelo POST de mesma origem com CSRF. O servidor verifica RS256, emissor, destinatário, validade, idade e nonce. Consome o nonce na transação de login, vínculo ou reautenticação. O e-mail e o nome recebidos do Google ficam fora do perfil. Progresso de visitante que entra em outro perfil precisa do fluxo explícito de fusão.

Consulte o README para a configuração do cliente Web. A QA usa chaves locais e JWTs assinados, com a interface exercitada em Chromium. A homologação com conta e cliente Google reais depende das origens autorizadas. A fusão explícita de perfis foi implementada na fatia subsequente, descrita acima.

## Parte 5B — perfil do jogador

A retomada parte da 5A (`5e7260f`) em `feat/runner-profile-5b`. O Ronin ID permite ao visitante ou à conta autenticada escolher o apelido e guardar sua preferência de visibilidade. Apelidos usam normalização NFKC e reserva única sem distinção de maiúsculas. A primeira escolha é imediata. A troca seguinte fica disponível após 30 dias, com a data exibida na tela de conta. O cadastro por e-mail conserva o apelido já escolhido e o mesmo jogador.

A migração 006 é aditiva. Perfis existentes começam privados. Para os apelidos de cadastro já registrados, usa a data do primeiro evento de cadastro quando disponível para manter o intervalo correto. A preferência será usada na futura apresentação dos perfis públicos.

A regressão de chefes passou a usar o relógio controlado do navegador nos dois idiomas. A suíte confere o tick exato de cada comando de teclado, verifica os pixels do canvas e mantém as checagens de três vidas, selo e hash do servidor. A API e o PostgreSQL usam tempo real durante o teste.

O perfil foi entregue antes da integração com Google documentada acima.

### Referência da parte 5A

Conta por e-mail implementada em `feat/runner-email-5a`, sobre `2cd2c79`/PR #8 (parte 4), em 18/11/2026. Autorização: “Iniciar 5A”. PRs anteriores empilhados, sem merge/fechar Issue #1. Sem SMTP externo, produção, VPS, DNS, Google ou mudanças em Ronin/Arquivos. Arte continua estudo original; direção final é nanquim colorido.

## Entregue

- Ronin ID em `/account/pt-br` e `/account/en`, ligado ao hub/jogo: cadastro, confirmação/reenvio, login, forgot/reset, reauth, lista/revogação de sessões e logout. UI/e-mails/erros PT-BR/EN; gerenciadores de senha, estados de carregamento/erro e navegação para corrida real. Jogar segue sem login.
- Identidade definitiva em Postgres: pending registration não ativa senha; prova válida cria conta e mantém player_id, runs, regiões, quatro selos e Aurora. E-mail verificado único; nenhuma união por endereço. Login bloqueia troca de visitante com runs para outra conta, preservando o progresso até o merge seguro da 5B.
- Argon2id assíncrono nativo Node 24.14.0, salt exclusivo, algoritmo versionado; 12–256 codepoints/1024 bytes, sem composição arbitrária. Fila limitada, hash dummy, limites por IP/jogador/e-mail e respostas genéricas. Lista de senhas triviais própria é limitada, não um corpus de vazamentos. Benchmark LOCAL de 12 hashes: mediana 42,59ms/p95 49,65ms; não mede a VPS.
- Tokens únicos com digest, propósito/contexto, confirmação 24h/reset 30min/reenvio 60s. Link no fragmento removido para memória, inclusive na mesma aba; GET não confirma. Prova exige a sessão de origem. Reset revoga todas as sessões/tokens e não autentica automaticamente. Origin/CSRF/custom header/DTO estrito e cap de 20 sessões com reauth de 10min.
- Migration 005 aditiva: candidatos, contas, credenciais, reservas de nickname, tokens, auditoria, cooldown e outbox. Migrations anteriores intactas. Outbox transacional AES-256-GCM, claim/lease/fence/retry e entrega idempotente local, privada. Chave/inbox ignoradas, ACL usuário/SYSTEM ou POSIX 0700/0600; nunca expor via HTTP, Git ou logs.
- Bootstrap da sessão bloqueia controles antes de liberar formulários; HTML usa POST, sem senha em query string. Falha transitória não oferece descarte do visitante; recuperação reusa seu cookie. Reload/feedback explícito, sem simular sucesso.
- Física, hitbox, regras e score não mudaram: continuam major 4 e replay v1–v4. Novo início de run revalida sessão sob bloqueio, evitando disputa com login/reset.

Leia [ADR011](docs/adr/ADR-011-CONTAS-EMAIL-E-SESSOES.md), ADR010 e contratos de identidade. ADR001–009/documentos de produto preservam decisões anteriores. Evidências da parte 4 continuam no histórico Git e em artifacts/phase-4-evidence.json local.

## Validação da 5A

Gate obrigatório: `npm ci` + `npm run verify`, Postgres e Chromium reais, contratos/geração/typecheck/lint/formato/build e suites completas. Consulte artifacts/phase-5a-verify-final.log e phase-5a-evidence.json para o resultado final/commit, hashes e CI. Não reconstruir após aprovação para chamar outro dist de testado. CI Windows/Linux precisa corresponder ao commit final, sem inferir sucesso do teste local.

- API/DB/worker: visitante ganha Aurora antes do cadastro e mantém o progresso; contexto errado não consome token; reenvio invalida anterior; expiração/renovação/confirm simultâneo; endereço existente não permite takeover/merge/enumeração por status; reset único/expirado/propósito errado; todas as sessões revogadas; reauth/IDOR/cap 20 com timestamps empatados; Origin/CSRF/corpos estritos e rate limit; falha de enqueue faz rollback integral. Transporte local prova retry/idempotência e arquivos privados, sem inbox público.
- Browser PT desktop/EN retrato móvel: formulários reais, bootstrap atrasado, confirmação explícita na mesma aba, navegador incorreto, reset/relogin, revogação de outra sessão e partida/verificador usando a mesma conta. Falha transitória no bootstrap preserva o visitante e não oferece criar outro. Sem overflow/erros/CSP; cor do papel computada permanece rgb(242,231,206). Capturas account-pt-br.png/account-en.png inspecionadas.
- A primeira regressão detectou corrida no bootstrap em PT que o dirigido não expôs. Corrigida a liberação antecipada dos formulários e adicionado atraso controlado. Log de falha preservado como phase-5a-verify-bootstrap-failure.log; aprovação depende da execução completa posterior. Não ocultar falhas ou adicionar skips.
- Uma execução duplicada Windows de CI revelou flake no teste anterior de combate: a captura/HUD antes da pausa permitia avançar para outro perigo ou auto-pausar. A pausa foi antecipada para congelar o estado perfeito antes da captura, mantendo as asserções de HUD/congelamento/hash, sem retry/skip ou timeout ampliado. A mesma barreira foi aplicada à captura do chefe: ação consumida, pausa em intervalo seguro de comandos, inspeção com tick congelado e retomada pela UI. O teste mantém HP 3, vitória/selo e hash do servidor; o PNG live-canvas-pt-br mostra os pixels reais do chefe sob relógio nativo; paused-boss-pt-br mostra a UI de pausa que oculta o mundo por regra. A asserção de imagem nativa lê o PNG do canvas, não o diálogo que o cobre. A correção exige novo gate e CI no head atualizado.
- CI Linux também expôs teardown de QA: pg-pool pode resolver end() antes dos eventos end das conexões ociosas. O helper acompanha conexões desde sua criação e aguarda todas antes de parar o Postgres; regressão com ordem controlada e cluster nativo prova essa barreira, sem ignorar erros ou adicionar sleeps. No Windows, remoção do diretório próprio usa retry limitado de filesystem (até 5, backoff 100ms) para EBUSY transitório do log já parado; bloqueio persistente continua falhando. Nenhum cenário funcional recebe retry.
- Relógio virtual do browser agora aguarda HTTP real antes/depois de avançar; mantém prazo de rede de 15s reais. O teste EN atrasa a requisição real de finish em 3s (dentro do prazo) para provar que a aceleração de polling não inventa timeout enquanto Postgres/verificador trabalham. Resultado segue obrigatoriamente VERIFIED pelo servidor, sem retry do cenário.
- Regressão anterior mantém chefes, teclado/gestos, pausa, rede/retries, previews, solver/regiões e paridade de replay. PT de chefe usa relógio normal (~160s), EN virtual/canvas. Traces v1–v4 devem permanecer iguais aos da parte 4 (v4 19212 estados).
- Auditoria runtime: zero ocorrências em phase-5a-runtime-audit.json. Avisos herdados de dependências dev/size do chunk Phaser e 19 warnings do OpenAPI continuam explícitos (ADR004). Nenhum gate desta parte homologa capacidade pública, Safari/aparelhos físicos ou arte final.

## Próxima etapa e limites

**Parte 5B, após novo pedido:** Google, vinculação/merge com prova dupla, conflitos/concorrência e revogação; perfil/nickname/moderação, exportação/exclusão e retenção/privacidade. OAuth/SMTP/DNS/serviços externos exigem autorização própria; não presumir acesso das integrações SEO como credenciais de identidade do jogo.

SMTP/entregabilidade/SPF/DKIM/DMARC, quotas/FAILED/rotação da chave do outbox, custo Argon2 na VPS, corpus de senhas comprometidas e homologação operacional permanecem gates públicos. Creator/equipamento 6A, arte/áudio/telas finais 6B, carreira/ranking 7 e semanas/run longa/offline/retention 8 continuam separados. Não iniciar partes seguintes automaticamente. Replay íntegro não prova jogador humano.

## Comandos

Node 24.14.0/npm 11; `npm ci`; `npm run verify`. Em terminais separados: `npm run db:dev` (aguardar migration 005 e pronto), `npm run dev:api`, `npm run dev:verifier`, `npm run dev:mail`, `npm run dev`. Jogo http://127.0.0.1:5173/roninrunner/pt-br ou /roninrunner/en; conta /account/pt-br ou /account/en. Não alternar localhost. Banco sintético 15432/API 3001. Ctrl+C preserva dev; QA remove só clusters próprios.

E-mails NÃO são enviados externamente. Leia privadamente o link no arquivo de artifacts/dev-auth/inbox e abra na mesma sessão; não copie JSON/token para chat/log/PR. Chave em artifacts/dev-auth/mail.key, fora do banco/Git/dist; não apagar com entregas pendentes. `npm run dev:mail -- --once` consome uma tentativa.

Após OpenAPI: `npm run contracts:generate`. Dirigido: `node --test tests/accounts.test.ts tests/auth-mail.test.ts`; browser exige build antes de `node --test tests/browser/accounts.test.ts` (verify faz a ordem). Chromium ausente: `npx playwright install chromium`; Linux pode exigir --with-deps. Teste PT de chefe demora alguns minutos. Nenhum comando desta fase publica o jogo.
