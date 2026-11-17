# Ronin Jogos

Plataforma de jogos gratuitos para navegador, desenvolvida com tecnologias web.

## Ronin Runner — fundação1B implementada em desenvolvimento

O Ronin Runner concluiu a fase de especificação de baseline (v0.18). **O proprietário autorizou em 11/11/2026 o início da implementação com Codex**. A primeira versão pública deverá ser **completa** (sem mini-MVP descartável), com desenvolvimento incremental sobre a arquitetura definitiva. Esta atualização não significa que o Codex já tenha executado tarefas ou que o jogo esteja implementado.

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

## Desenvolvimento local — fundação1A

Domínio/caminho confirmados: **https://play.ronin.dev.br/roninrunner**. Portal em /; versões do jogo em /roninrunner/pt-br e /roninrunner/en. Nenhum DNS/deploy foi executado.

Node24LTS (versão de referência em .nvmrc), npm11. No checkout:

```sh
npm ci
npm run verify
npm run dev
# Em outro terminal, se desejar testar a API de liveness:
npm run dev:api
```

Shell local: http://127.0.0.1:5173/roninrunner; API: http://127.0.0.1:3001/api/v1/health. O shell informa que o jogo ainda não está jogável. Health só comprova processo respondendo; não comprova banco, fila ou verificação. Não há backend falso de pontuação.

Depois de editar OpenAPI: npm run contracts:generate e npm run verify. Tipos e schemas gerados são versionados, e o gate recusa divergência. Postgres/core/codec estão disponíveis na1B; run/verifier em1C; corrida Phaser em1D. Issue1 permanece aberta até integrar todas essas partes.

Decisões: [ADRs](docs/adr/ADR-001-WORKSPACE-E-ROTAS.md). Estado e comandos: [PROGRESS.md](PROGRESS.md). Há uma pendência de segurança em ferramenta de desenvolvimento registrada no ADR004; nenhuma aprovação de release pública decorre desta fundação.

## Parte1B — motor, replay e banco de desenvolvimento

`npm run verify` agora executa Postgres real efêmero, testes do motor/codec e Chromium real. Primeiro instale Node/npm e as dependências com `npm ci`; se não houver Chrome local, `npx playwright install chromium` (Linux pode precisar de `--with-deps`). Nenhum teste é omitido por falta de banco/browser.

Para banco local persistente: `npm run db:dev`. Apenas127.0.0.1:15432; credenciais fictícias em `.env.example`, dados em `artifacts/dev-postgres`. Ctrl+C encerra o processo e preserva os dados. Não usar esse launcher/credenciais para produção. `node scripts/dev-db.ts --check` inicia, migra e encerra para diagnóstico. Não requer Docker, serviço permanente nem acesso à VPS.

Implementação/limites e regras exatas: [ADR005](docs/adr/ADR-005-FUNDACAO-1B.md). Core e playback são puros; JSON/hash não são prova de humano, e ainda não existe servidor que aceite pontuações públicas. A integração de partidas por HTTP e fila/verificação persistente é a próxima parte1C.
