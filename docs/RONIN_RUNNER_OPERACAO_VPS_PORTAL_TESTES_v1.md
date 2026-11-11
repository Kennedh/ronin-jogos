# Ronin Runner — VPS, integração Ronin Play, privacidade operacional, testes e lançamento (baseline v0.18)

**Objetivo:** fechar em nível de design G12, G13, G14 e G15. **Não alterar VPS, Caddy, DNS, SMTP, Google, GitHub Actions nem criar código neste estágio.**  
**Restrições confirmadas:** VPS próprio, reduzir custos e dependências externas pagas, portal de jogos do ecossistema Ronin, jogos PT-BR/EN, Ronin ID compartilhável, primeira versão pública completa.

## 1. Domínios e integração com o site

**BASELINE de destino:** hospedar portal `https://play.ronin.dev.br` e o jogo nas rotas `/pt-br/ronin-runner` e `/en/ronin-runner`. A página `/` detecta o idioma do navegador e oferece seletor; links internos, `hreflang`, canonical, sitemap e meta título/descrição próprios para ambos idiomas. A rota de login e API fica no MESMO ORIGIN `https://play.ronin.dev.br/api/v1` com Caddy reverse proxy. Domain/paths são **propostos**, a confirmar DNS e arquitetura existente sem alterar produção.

- Site `ronin.dev.br` linka para o portal, sem compartilhamento frágil de cookies entre todo `.ronin.dev.br`.
- `arquivos.dev.br` permanece aplicação independente, sem incorporar acesso a Ronin ID sem pedido explícito.
- Ronin ID compartilha identidade entre todos os jogos **dentro do portal/play origin**; jogos futuros em outros domínios exigirão federação/autorização formal, não cookie `Domain=.ronin.dev.br` por conveniência.
- Conta Google requer OAuth/Identity configuração de domínio e redirect/origin autorizados; e-mail precisa fluxo de verificação HTTPS nessa origem.
- SEO: páginas específicas por jogo e idioma, informações indexáveis de texto, previews OG originais, performance da homepage, sitemap e robots adequados. Scores/perfis privados não indexados; dados de ranking públicos com medidas contra scraping abusivo e exposição de perfis.
- Política mínima de analytics: page_view agregado, botão Jogar, game_started/completed, auth conversion, fail rates, sem coleta desnecessária de PII; opt-in/consent conforme cookies realmente usados e LGPD.

## 2. Topologia VPS — baseline para execução futura

```text
Internet HTTPS
   |
Caddy (TLS + static headers + reverse proxy)
   |--- frontend web/Vite build + Phaser assets (CDN não é exigência)
   |--- /api/v1 => Fastify API (localhost/private network)
   |                  |--- Postgres (local/private, sem porta pública)
   |                  |--- Worker de replay (fila durável)
   |                  |--- Agendador de semana (cron/worker + fallback on-demand)
   |                  \--- e-mail transacional SMTP (envio autenticado)
   \--- logs/métricas/health (internos)
```

**Princípios:**
- Frontend asset imutável com hash e cache; index HTML sem cache longo para atualizações seguras. Assets do próximo bioma carregados sob demanda e degradam qualidade sem mexer em telegraph/física.
- PostgreSQL e worker em rede local/privada, secrets em variáveis/secret manager fora do Git; nada de portas do banco expostas externamente.
- Conexões PostgreSQL limitadas; worker com concorrência fixa por CPU livre e quota de disco, API com rate limit por rota e métricas p95.
- Banco, replay segments e backups possuem diretórios/volumes diferenciados, permissões mínimas, criptografia no backup e restauração testada.
- Fila: PostgreSQL outbox + `FOR UPDATE SKIP LOCKED` ou equivalente para processar de modo durável com retry/backoff. Redis não obrigatório para a primeira arquitetura.
- Cron agendado cria edição semanal, com fallback idempotente na primeira requisição do período; `UNIQUE(week_id)` e `UNIQUE(player_id,week_id,tier)`.
- SMTP terceirizado ou relay confiável gratuito quando viável; exigir teste de envio/entregabilidade, SPF/DKIM/DMARC e bounce handling antes de registrar contas reais. Não prometer que Postfix puro na VPS chega ao inbox.
- Não vincular deployment a renderização pesada pelo servidor: simulação replay em processo worker; assets no cliente.

## 3. Planejamento de capacidade sem inventar specs da VPS

A configuração real de CPU, memória, SSD, throughput e limite de banda **não foi fornecida nesta especificação**. Portanto, **não é honesto fixar simultâneos máximos** antes de medir a máquina. Codex deve criar medição (quando autorizado), não assumir quantidades. Usar perfis em relação a medições:

| Indicador | Meta baseline, a homologar | Alerta/ação |
|---|---|---|
| CPU da VPS | preservar folga ≥25% em carga-alvo | limitar workers, priorizar API |
| RAM | sem swap constante/OOM; folga ≥20% | reduzir cache/worker, investigar leaks |
| Disco | alerta em 70%, crítico em 85% | expurgar replays pela política, estender storage |
| API p95 leitura de perfil/ranking | objetivo <500ms em carga planejada | índices/cache/limites |
| API p95 `runs/start` | objetivo <800ms | pool, concorrência e rate limit |
| API finish/segment ACK | objetivo <1s para payloads dentro do limite | fila durável, não simular inline |
| Backlog replay | tempo de verificação p95 sob carga **definido por benchmark**, comunicar PENDING | ajustar workers e quotas |
| FPS visual | 60 quando suportado; 30 degradado, **motor de 60 ticks inalterado** | assets/partículas/LOD, nunca afrouxar score |
| Tamanho inicial do portal+jogo | target de orçamento a medir por dispositivos e rede | lazy loading; não carregar todas quatro regiões no menu |
| Erros 5xx | baseline <1% dos pedidos legítimos | alerta e rollback quando sustained |
| Cron semanários | uma única edição por semana | fallback e auditoria |

Esses números são **metas iniciais, não SLAs contratados**. Definir usuários simultâneos-alvo com teste incremental de 10/50/100 players de simulação sintética, sem fingir que todos os clientes produzem replay ao mesmo tempo, até o ponto de saturação medido. Registrar limite seguro e plano de crescimento (CPU/RAM/volume/worker separado) sem pagar serviços adicionais prematuramente.

## 4. Ambientes e deploy

- `local/dev` somente dados fictícios.
- `staging` isolado (DB separado, origem/segredos separados, nenhuma pontuação ligada ao ranking público, Google/email em sandbox), com simulação de tempo UTC acelerada e infraestrutura equivalente dentro da capacidade disponível.
- `production` com DNS/HTTPS e backups; config validada, restore ensaiado e alertas.
- CI antes de merge: TS typecheck, lint, unit, core determinístico e seeds subset, migrations no Postgres de teste, contrato de API, testes de segurança e acessibilidade essenciais. E2E dispositivos/staging e soak de 5+ ciclos no gate release.
- Deploy: snapshot/version assets e rules_version, migrations **expand-and-contract** sempre que mudança quebrar schema, health checks e rollback de app sem perder DB. Manifests de versões antigas devem sobreviver enquanto runs antigas continuarem válidas.
- Caddy redireciona HTTP→HTTPS, ativa compressão apropriada, CSP testada, headers de segurança e cache imutável para assets com hash; não usar cache público de resposta privada.
- Observabilidade: request_id/run_id sem token/email em logs, métricas 5xx/p95, fila de replay, login SMTP, slots de semana, rejeição/score, disco, CPU, banco e jobs órfãos.
- Backup: baseline **diário** de Postgres e semanal de assets/manifest (ou em toda mudança), retenção a definir conforme volume/privacidade; **restauração ensaiada mensalmente** em ambiente isolado. Objetivos iniciais de recuperação RPO 24h/RTO 4h **sujeitos a capacidade/custo**. Não chamar de "garantido" antes de testar.
- Incidentes: modo leitura, pausar novas runs ranqueadas se verifier/DB indisponível, preservar dados já aceitos, não admitir score local sem verificação; status visível ao jogador e procedimento de recuperação.

## 5. Privacidade, moderação e suporte

- Privacidade/LGPD e retenção definidos em [contrato identidade](./RONIN_RUNNER_CONTRATO_IDENTIDADE_DADOS_PRIVACIDADE.md). Revisão de termos e política de dados antes de lançamento.
- Perfis públicos exibem nickname e avatares sintéticos; e-mails e provedores privados; perfil pode ter modo restrito.
- Moderação: ocultar apelidos abusivos, suspender rankings sob investigação, registrar motivo e possibilidade de recurso; não apagar imediatamente recordes válidos por anomalia estatística.
- E-mail de suporte/formulário protegido contra spam; versão do cliente, rules_version e request_id para suporte sem pedir dados sensíveis ao usuário.
- Conexões Google e e-mail são integrações externas reais; política de falha e rate-limit tratada na interface em PT/EN.
- Consentimentos de analytics/termos separados de autenticação necessária; ao usar cookies de sessão funcionais, informar claramente finalidade.

## 6. Matriz de dispositivos/experiência a homologar

**Device profiles (testes em hardware real):**
1. Desktop Windows/Linux 1920×1080 com Chrome/Firefox/Edge, teclado.
2. Android básico e intermediário, paisagem 16:9 e 19.5:9, Chrome, DPR variado, WebGL e fallback de baixo custo.
3. Android alto/90–120Hz para validar render independente do motor.
4. iPhone Safari recente: bloqueio de orientação/fullscreen pode não funcionar; fallback de orientação e pausa.
5. Touch com acessibilidade/gestos alternativos, leitor de tela nos menus e alto contraste/redução de movimento.

**Matriz de rede:** online rápido, alto RTT, interrupção de 10s/2min/30min, sessão expirada, API PENDING por fila, upload de chunks fora de ordem, download de próximo bioma atrasado, navegador em segundo plano.

**Matriz de arte:** personagem modular e pairwise, quatro biomas em corrupção máxima, bosses com e sem efeitos, pausa/foco, baixa qualidade sem ocultar telegraph.

## 7. Releases, versões e integridade do ranking

- Fazer primeira publicação **apenas após G0–G4**: requisitos e contratos congelados, 4 regiões/chefes, creator, identity, semanais e ranking integrados e testados.
- `rules_major` muda quando física/score/gerador competitivo mudam de forma incompatível; ranking atual e hall da fama separados conforme [contrato simulação](./RONIN_RUNNER_CONTRATO_SIMULACAO_PARTIDAS_RANKING_v1.md).
- Monitorar métricas sem alterar score silenciosamente; atualização de assets isolada pode não exigir rules_major se não mudar telegraph/hitbox/tempo.
- Backlog de erros P0 (crash, vida indevida, score fraudulento, perda de conta, senha exposta, weekly duplicada, DB inconsistente) impede publicação.

## 8. Portão final de pré-programação (artefatos a aprovar)

- DNS/rotas de portal confirmados com arquitetura da VPS (sem operação nesta etapa).
- Backend schemas, OpenAPI 3.1 e DB migrations com constraints revisados; conteúdo visual completo manifestado e versionado.
- Parâmetros TUNABLE com fixture de teste e critérios de sucesso.
- Política de sessões e dados, replays longos, score/season, rankings, weekly UTC, catalog e licenças publicados.
- Scripts de teste/CI só depois de usuário autorizar programação; esta especificação não habilita ações na VPS ou produção.

**Este documento especifica procedimentos e metas; não representa medição, deploy, backup efetuado, CDN configurada nem teste executado.**
