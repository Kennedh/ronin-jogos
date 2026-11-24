# Ronin Jogos

Plataforma de jogos gratuitos para navegador, desenvolvida com tecnologias web.

## Ronin Runner — contas por e-mail da parte 5A em desenvolvimento

O Ronin Runner concluiu a fase de especificação de baseline (v0.18). **O proprietário autorizou em 11/11/2026 o início da implementação com Codex**. A primeira versão pública deverá ser **completa** (sem mini-MVP descartável), com desenvolvimento incremental sobre a arquitetura definitiva. As partes 1A–1D têm implementação e testes: a primeira corrida Bambu já liga Phaser, teclado/gestos e resultado à API e ao verificador reais. Isso é uma fundação interna, ainda sem o escopo completo nem homologação pública.

**Revisão de planejamento v0.18:** todas as 15 áreas G01–G15 têm um baseline documentado. Leia a [matriz final de aceite e execução](docs/RONIN_RUNNER_MATRIZ_ACEITE_E_EXECUCAO_v1.md). Os números TUNABLE ainda exigem testes; **programação em branch de desenvolvimento e testes estão autorizados**, mas deploy em produção/DNS/credenciais ainda precisam de aprovação separada.

### Contratos complementares v0.18

- [Simulação, runs longas, pausa e ranking](docs/RONIN_RUNNER_CONTRATO_SIMULACAO_PARTIDAS_RANKING_v1.md)
- [Conta, esquema lógico e privacidade](docs/RONIN_RUNNER_CONTRATO_IDENTIDADE_DADOS_PRIVACIDADE.md)
- [Catálogo visual, telas, chefes e 30 desafios semanais](docs/RONIN_RUNNER_ARTES_TELAS_CATALOGO_CONTEUDO_v1.md)
- [Operação da VPS, Ronin Play e QA](docs/RONIN_RUNNER_OPERACAO_VPS_PORTAL_TESTES_v1.md)
- [OpenAPI 3.1 preliminar](docs/openapi.ronin-runner.v1.yaml)
- [Matriz de testes, gates e roteiro para Codex](docs/RONIN_RUNNER_MATRIZ_ACEITE_E_EXECUCAO_v1.md)

### Por onde começar a leitura

1. [Especificação geral do Ronin Runner](docs/RONIN_RUNNER_SPEC.md)
2. [Auditoria v0.17: lacunas e plano de alinhamento para Codex](docs/RONIN_RUNNER_AUDITORIA_ALINHAMENTO_CODEX.md)
3. [Guia de preparação/handoff ao Codex](docs/RONIN_RUNNER_PREPARACAO_CODEX.md)
4. [Contratos de API, dados e persistência](docs/RONIN_RUNNER_CONTRATOS_API_PERSISTENCIA.md)
5. [Integridade de partidas e antifraude](docs/RONIN_RUNNER_SEGURANCA_PARTIDAS.md)
6. [Plano de testes e lançamento](docs/RONIN_RUNNER_TESTES_LANCAMENTO.md)
7. [Instruções para Codex](AGENTS.md)

As especificações de física, inimigos, chefes, missões, desafios semanais e Criador de Ronin estão vinculadas na [especificação geral](docs/RONIN_RUNNER_SPEC.md).

**Para uso com Codex:** ler `AGENTS.md` e as especificações antes de começar. **Está autorizado iniciar código, testes e migrations locais/de desenvolvimento**, seguindo as ADRs, arquitetura completa, branch própria e PRs. **Não fazer deploy em produção, alterar DNS/Caddy existentes ou executar ações irreversíveis sem aprovação separada.**

**Regras centrais já confirmadas:** quatro regiões e ciclos infinitos, três vidas sem cura, abismo fatal, salto duplo inicial, chefes que podem recuar, controles mobile por gestos, pt-BR/en, Ronin ID com visitante/e-mail/Google, Criador completo de aparência básica livre e cosméticos especiais desbloqueáveis, desafios semanais autogerados com selos 2/4/5, Traço da Aurora pelos quatro selos dos chefes, rankings validados no servidor.

## Revisão e execução por partes — 17/11/2026

[Análise, ajustes e plano para aceite](docs/REVISAO_E_PLANO_EXECUCAO.md). Plano aceito em17/11/2026, com início da parte1A. A Issue #1 será entregue pelas partes 1A–1D, com o escopo público completo preservado.

## Desenvolvimento local — fundação 1D

Domínio/caminho confirmados: **https://play.ronin.dev.br/roninrunner**. Portal em /; versões do jogo em /roninrunner/pt-br e /roninrunner/en. Nenhum DNS/deploy foi executado.

Node24LTS (versão de referência em .nvmrc), npm11. No checkout:

```sh
npm ci
npm run verify
# Mantenha o banco aberto; aguarde a mensagem de pronto:
npm run db:dev
# Em outros três terminais, no mesmo checkout:
npm run dev:api
npm run dev:verifier
npm run dev
```

Abra http://127.0.0.1:5173/roninrunner/pt-br ou /roninrunner/en; hub em /. Use **127.0.0.1**, sem alternar com localhost: o proxy /api preserva Host e a API valida a origem exata 127.0.0.1:5173. Porta da API: 3001; health em http://127.0.0.1:3001/api/v1/health só comprova processo respondendo. Jogar → morrer ou encerrar → resultado confirmado exige banco, API e worker disponíveis.

Teclado: Espaço/↑ salta, S/↓ desliza, J ataca, Esc pausa/retoma com contagem. No toque: deslizar para cima/baixo e tocar para atacar; botões alternativos nas preferências. Paisagem é recomendada; fullscreen recusado mantém fallback. Pausa oculta a cena e congela o core. Cada run começa com três vidas, sem cura. O resultado local só aparece como confirmado após VERIFIED no servidor; QUIT não ranqueia. Leia os limites e prazos em “Antes de começar”. Dados ainda não enviados vivem em memória: não fechar/recarregar a página durante a run ou envio. Retomada offline durável pertence à parte 8.

O build é requisito dos testes de navegador (`npm run build` antes de `npm run test:browser`); `npm run verify` já respeita essa ordem. `vite preview` usa 4173 e requer PORTAL_ORIGIN compatível na API; os comandos acima usam a origem padrão 5173.

Depois de editar OpenAPI: npm run contracts:generate e npm run verify. Tipos, schemas e validadores standalone gerados são versionados, e o gate recusa divergência. Postgres/core/codec estão disponíveis desde 1B; API de runs e worker persistente desde 1C; corrida Phaser/gestos/resultado desde 1D. Issue1 permanece aberta até revisar e integrar todas essas partes.

Decisões: [ADRs](docs/adr/ADR-001-WORKSPACE-E-ROTAS.md). Estado e comandos: [PROGRESS.md](PROGRESS.md). Há uma pendência de segurança em ferramenta de desenvolvimento registrada no ADR004; nenhuma aprovação de release pública decorre desta fundação.

## Parte1B — motor, replay e banco de desenvolvimento

`npm run verify` agora executa Postgres real efêmero, testes do motor/codec e Chromium real. Primeiro instale Node/npm e as dependências com `npm ci`; se não houver Chrome local, `npx playwright install chromium` (Linux pode precisar de `--with-deps`). Nenhum teste é omitido por falta de banco/browser.

Para banco local persistente: `npm run db:dev`. Apenas127.0.0.1:15432; credenciais fictícias em `.env.example`, dados em `artifacts/dev-postgres`. Ctrl+C encerra o processo e preserva os dados. Não usar esse launcher/credenciais para produção. `node scripts/dev-db.ts --check` inicia, migra e encerra para diagnóstico. Não requer Docker, serviço permanente nem acesso à VPS.

Implementação/limites e regras exatas: [ADR005](docs/adr/ADR-005-FUNDACAO-1B.md). Core e playback são puros; JSON/hash não são prova de humano, e ainda não existe servidor que aceite pontuações públicas. A integração de partidas por HTTP e verificação persistente está implementada na 1C.

## Parte 1C — sessões, API e verificador

A API e o worker usam o cluster sintético `ronin_dev` em `127.0.0.1:15432`, iniciado por `db:dev`; os comandos de desenvolvimento recusam outro DATABASE_URL. Não criam conexão externa nem iniciam o banco implicitamente. `dev:verifier -- --once` processa no máximo um job e encerra; sem `--once`, aguarda novos jobs e devolve o trabalho pendente ao receber Ctrl+C.

A API escuta `http://127.0.0.1:3001`; `PORTAL_ORIGIN` configura a origem exata do navegador (padrão `http://127.0.0.1:5173`, via proxy local implementado na 1D). Em HTTP, apenas loopback é aceito. A origem HTTPS exige chave de rate limit fornecida pelo integrador, fora do Git. Esses comandos não são configuração de produção.

Fluxo executável: `POST /api/v1/auth/guest` com `{}` → cookie HttpOnly e header `X-CSRF-Token` → `POST /api/v1/runs/start` com `Idempotency-Key` → `GET /api/v1/runs/{id}/manifest` → `PUT /api/v1/runs/{id}/segments/{index}` em identity/gzip → `POST /api/v1/runs/{id}/finish` → consultar `GET /api/v1/runs/{id}`. Mutações exigem `Origin` exata e token CSRF sincronizado à sessão. O upload usa o codec e headers do OpenAPI; ACK significa persistido, e não pontuação aceita.

O verificador reexecuta comandos e comprova HP_ZERO, ABYSS ou QUIT no core. Somente VERIFIED expõe score ao dono da run; QUIT não ranqueia. Outcome/outbox são transacionais, com lease/heartbeat/generation para concorrência e retry. Este trecho descreve a fundação 1C; selos/recompensas iniciais e conta por e-mail estão implementados nas partes 4/5A abaixo. Ranking público e Google seguem pendentes. O curso primitivo versionado permite integração real da fundação, mas não substitui o diretor completo/quatro regiões/chefes das partes 3/4.

Detalhes, limites, testes e operação: [ADR006](docs/adr/ADR-006-FUNDACAO-1C.md). O gate de fundação continua `npm run verify`; o gate de lançamento público completo pertence às etapas finais.

## Parte 1D — primeira corrida integrada

Cena Bambu em Canvas2D/Phaser 4 com arte vetorial original, adaptador do mesmo core do verificador, manifest histórico validado pelo hash do ticket, inputs segmentados e envio com ACK. UI PT-BR/EN inclui menu, controles, preferências, pausa opaca, contagem, confirmação de saída e estados de envio/verificação/recusa/rede. O hub carrega Phaser somente ao entrar no jogo. Contratos usam validadores standalone; o build funciona com CSP sem unsafe-eval.

A regressão usa bundle de produção, Chromium desktop/mobile emulado, PostgreSQL real e API/worker reais. Não substitui aparelhos físicos nem aprova a arte final. Veja decisões, evidências, orçamento do bundle e pendências no [ADR007](docs/adr/ADR-007-FUNDACAO-1D.md) e [PROGRESS.md](PROGRESS.md). As próximas partes preservam combate completo, quatro regiões/chefes, criador/identidade, ranking e semanais antes de qualquer lançamento.

## Parte 2 — combate e estudo do personagem

Novas partidas usam regras major 2: concentração (perfeito +12/comum +3, máximo 100), sequência perfeita, golpe vazio e especial automático no próximo acerto quando carregado. O especial tem alcance frontal curto, não cura e não protege de abismos. O círculo sobre o inimigo indica a janela de precisão. Replay/servidor continuam autoritativos e a major 1 permanece executável.

A faixa sob a cena mostra concentração/combo/feedback PT-BR/EN. Antes de jogar, é possível remapear teclas e abrir **Estudo de animação do personagem** para animar/congelar poses, conferir ataque aéreo, deslize, dano, especial e pivôs. A prévia usa o mesmo rig da corrida. É uma amostra para revisão visual; criador/inventário/arte final são etapas posteriores. Implementação e decisões: [ADR008](docs/adr/ADR-008-COMBATE-E-RIG.md). Próxima parte: diretor/quatro regiões/ciclos (3), após pedido do proprietário.

## Parte 3 — regiões, ciclos e abismos maiores

Novas partidas usam major 3: Bambu → Templo → Montanhas → Castelo, repetindo com corrupção e dificuldade limitadas. O gerador escolhe padrões determinísticos e nove comportamentos de inimigo; abismos têm 190/280 unidades, com aviso antecipado. Transições não restauram vidas nem concentração. O visual continua estudo original; a arte final será nanquim colorido conforme referência aceita, na parte 6B.

Ao alcançar uma região e concluir o envio/verificação, ela fica disponível em Expedição Regional. O servidor confere o desbloqueio; a expedição começa em zero metros reais. Perfil de movimento, segurança do gerador, provas e limites: [ADR009](docs/adr/ADR-009-DIRETOR-E-REGIOES.md). Próxima parte 4: chefes, após novo pedido. Nenhum deploy decorre desta entrega.

## Parte 4 — quatro guardiões e selos

Novas partidas usam major 4: Raiz Negra, Guardião do Sino, Espírito da Nevasca e Senhor do Eclipse têm avisos, ataques, janelas de katana e retirada em movimento. É possível só esquivar e continuar. Não há cura; vencer os quatro concede 2250 de bônus por ciclo, sem contar chefe como inimigo comum. Selos, conquistas iniciais e Traço da Aurora são persistidos somente após o replay verificado; quatro selos podem vir de sessões diferentes. O rastro é cosmético e seu equipamento no Creator chega na 6A.

HUD e resultados PT/EN mostram energia, aberturas e bônus confirmados; “Atualizar selos” consulta o progresso privado. Avisos sonoros opcionais acompanham sinais visuais. Regras anteriores seguem executáveis. Banco dev recebe migration 004 ao iniciar db:dev. Ver [ADR010](docs/adr/ADR-010-CHEFES-E-SELOS.md) e [PROGRESS](PROGRESS.md) para evidências/limites. Arte atual continua estudo; conta e-mail da parte 5A está descrita abaixo.


## Parte 5A — Ronin ID por e-mail

Conta real em `/account/pt-br` e `/account/en`, pelo link Ronin ID no portal/jogo. Cadastro, confirmação, login, recuperação/reset de senha, reautenticação e lista/revogação de sessões. O visitante conserva player_id e progresso ao confirmar o cadastro; jogar continua sem login. Não há merge automático por e-mail. Login em outra conta é bloqueado se descartaria acesso a progresso de visitante: vínculo/merge seguro é parte 5B.

Inicie, em terminais separados:

```powershell
npm run db:dev
npm run dev:api
npm run dev:verifier
npm run dev:mail
npm run dev
```

Aguarde a migração mais recente e o banco pronto antes de iniciar os consumidores. Use `http://127.0.0.1:5173/account/pt-br` ou `/account/en`; não alterne com localhost (cookie/contexto de confirmação). `dev:mail` NÃO envia para endereços reais: entrega arquivos privados em `artifacts/dev-auth/inbox`. Abra o JSON localmente, copie apenas o link para a mesma sessão de navegador e confirme explicitamente. Links são do ambiente local e o token fica no fragmento, limpo da URL pela aplicação. Reenvio tem cooldown 60s. `npm run dev:mail -- --once` consome no máximo uma tentativa.

Mensagens e chave `artifacts/dev-auth/mail.key` ficam ignoradas, fora do dist/Git, com permissões privadas. Não publicar, colar ou anexar esses arquivos/tokens; perder a chave impede processar entregas pendentes. Senhas são Argon2id; reset vence em 30min e encerra sessões anteriores. Lista/revogação exige senha recente (10min). Não recuperar visitante por nickname.

Testes dirigidos: `node --test tests/accounts.test.ts tests/auth-mail.test.ts`; UI exige build antes de `node --test tests/browser/accounts.test.ts`. Gate completo continua `npm ci` e `npm run verify`. Ver [ADR011](docs/adr/ADR-011-CONTAS-EMAIL-E-SESSOES.md) e [PROGRESS](PROGRESS.md). SMTP/entregabilidade, Google/vínculo/merge, moderação pública, privacidade/retention completas e homologação pública continuam pendentes; nenhuma mudança em VPS/DNS nesta etapa.

### Google no Ronin ID

Para habilitar no ambiente escolhido, crie um cliente OAuth do tipo **Aplicativo da Web** para o Ronin Play e cadastre a origem JavaScript usada pelo portal. Defina `RONIN_GOOGLE_CLIENT_ID` no processo da API com o ID público `*.apps.googleusercontent.com`. O popup retorna a credencial para a página, que a envia por POST à API. A configuração usa Google Identity Services em botão, sem client secret ou URL de callback. [Configuração oficial do Google](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)

No ambiente local, mantenha a origem da API e a URL do navegador iguais ao endereço autorizado no cliente Web. Em staging, confira CSP e, se o popup legado exigir, `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Com o ID ausente, o portal mantém os fluxos de visitante e e-mail. A suíte usa chaves locais e pode ser executada sem cliente Google.

Antes de usar a integração com contas reais, valide o popup, a política de divulgação de dados e as origens do cliente Web no ambiente autorizado. O cronograma de fusão de perfis, exclusão e exportação está no [PROGRESS.md](PROGRESS.md).
