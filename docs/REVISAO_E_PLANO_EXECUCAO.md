# Ronin Runner — revisão e plano de execução

Data: 17/11/2026. Base analisada: main 103dd878b4881426bc62d3b7df4ac81e7e12ea11, AGENTS.md, README, todos os 19 documentos de docs/ (incluindo OpenAPI) e Issue #1. Estado observado: documentação e diretórios com .gitkeep, sem aplicação, package.json, lockfile, migrations, CI ou assets finais.

**Escopo desta entrega:** revisão documental e divisão do trabalho. Implementação aguarda aceite do proprietário conforme pedido atual. Autorizações antigas dentro da documentação/Issue #1 não substituem esse pedido. Não foi realizada operação na VPS, DNS, serviços existentes, credenciais ou integrações Google.

## 1. Conclusão de viabilidade

Viável tecnicamente como jogo 2D de navegador. A arquitetura Phaser/TypeScript/Vite + Fastify + PostgreSQL + core compartilhado e verificador separado é coerente. O maior esforço será combinar jogo justo, arte modular consistente, contas seguras e validação econômica de partidas longas. Especificação detalhada não equivale a conteúdo produzido ou qualidade homologada.

Manter quatro regiões/chefes, ciclos infinitos, três vidas sem cura, abismos fatais, salto duplo inicial, gestos, criador completo, visitante/e-mail/Google, progresso, rankings e semanais 2/4/5 na primeira versão pública. Etapas internas menores não são redução de lançamento. Nove inimigos, catálogo artístico e 30 templates permanecem baseline de trabalho; quantidades propostas não viram aprovação estética por esta revisão.

“Arquitetura definitiva” significa limites de domínio, contratos e dados persistentes corretos desde o início; não significa congelar implementações impossíveis de refinar. Não construir ranking local descartável nem autenticação fictícia de produção. Fixtures, relógio controlado e provedores de teste são necessários à QA, sem serem anunciados como integrações externas concluídas.

## 2. Portal e identidade

Recomendação para aceite: **play.ronin.dev.br**, marca Ronin Play, jogo em /pt-br/ronin-runner e /en/ronin-runner. Play comunica melhor um catálogo com gêneros variados e coincide com o baseline existente. Dojo é uma boa identidade temática para treinamento/conquistas, mas não exige segundo host nem uma nova funcionalidade nesta versão. Nome continua proposto até aceite; sem DNS nesta fase.

Portal com catálogo inicial de um jogo, páginas públicas HTML indexáveis, carregamento do Phaser só ao entrar no jogo, seletor PT/EN, links para Ronin e Arquivos. Sem cards falsos de jogos futuros. Identidade compartilhável pelos títulos dentro da mesma origem; cookies host-only. Não transformar a autenticação operacional de GSC/GA/AdSense em login dos jogadores. Google Identity e e-mail transacional terão configuração e testes próprios.

## 3. Ajustes encontrados e tratamento

| Item | Evidência/risco | Tratamento / etapa |
|---|---|---|
| Autorização conflitante | AGENTS/Issue1 autorizam; spec/matriz antigos negam | Cabeçalhos de precedência e correções documentais nesta revisão; aguardar aceite atual |
| OpenAPI inválido | description inline com vírgula cria propriedade inesperada em password/reset | Corrigido com aspas; operationId estável adicionado às operações |
| OpenAPI incompleto | Faltam, por exemplo, edição de nickname/perfil, reenvio de confirmação, mudança de e-mail, gestão de métodos/reauth, inventário de emblemas, posição pessoal no ranking e health | Formalizar rotas/DTOs conforme funcionalidades existentes em 1A e respectivas fases, sem inventar produto |
| Prova de merge genérica | target_session_proof/proof string sem troca definida | Ticket curto de uso único, finalidade/contas vinculadas, posse dupla e reauth; nunca expor cookie HttpOnly ao JS; 1A/5 |
| RunTicket insuficiente | Não formaliza todos os hashes/versões, limites e prazos descritos em prosa | Ticket persistido e imutável com scoring/generator/replay/rules manifests, prazos e política; 1A |
| Replay binário não especificado | Não fixa codec, hash canônico, bytes cobertos nem fronteiras | Contrato de wire format com vetores conhecidos, limites antes/depois de decompress e intervalos [start,end); 1A/1C |
| Upload fora de ordem | Finish e conjunto incompleto têm semântica ambígua | Aceitar partes duráveis por índice, validar cadeia completa antes da conclusão; mesmo índice/hash repetido idempotente, divergente409; 1C |
| UNIQUE mal interpretado | UNIQUE(run,index,hash) permitiria dois hashes no mesmo índice | UNIQUE(run,index), hash como atributo comparado; alinhado ao contrato v0.18 de dados; 1B |
| Pausa com tick congelado | Vários pause/resume podem ter o mesmo active_tick | Separar active_tick da sequência ordenada do protocolo; pausa/countdown fora da evolução física, sem liberar comandos; 1A/2 |
| Abismo e coyote | “Abismo fatal imediato” sem geometria exata pode matar ao sair da borda e inutilizar salto/coyote | Definir queda fatal e contato seguro por geometria/tick no core; sem salto após DEAD e abismo prevalece sobre i-frame/ataque; fixture de bordas em 1A/1B |
| Inteiros e longo prazo | Milli-unidades e score grandes; bitwise só comporta32bits | Arredondamento/resíduos canônicos, PRNG32bits isolado das distâncias, serialização/hash estáveis e limites de segurança; bigint/decimal para valores agregados quando necessário; 1A/1B |
| Fila de verificação | Claim durável não evita worker antigo gravar após lease expirar | Lease + heartbeat + fencing e commit transacional; budget por job, checkpoint produzido pelo verifier, retry transitório/deadletter; 1C/8 |
| Semana e backlog | verified_at na graça pode punir usuário por atraso da VPS | Proposta para aceite: elegibilidade pelo fechamento completo aceito dentro da graça; verificação pode concluir depois. Não confiar no relógio cliente; 1A/8 |
| 72h e +24h | “finalizada” pode significar só evento local ou aceite servidor | Proposta: finish_intent recebido servidor até o prazo reserva fechamento imutável, uploads concluem na janela declarada; UX para offline sem promessa ilimitada. Congelar em ADR antes do DTO; 1A |
| Abandono vs VERIFIED | ABANDONED terminal conflita com cumulativos verificados | Separar resultado da verificação e motivo de encerramento/eligibilidade; QUIT pode verificar cumulativos permitidos, nunca ranking; nenhuma concessão parcial de run não verificada; 1A/7 |
| Chaves de ranking com Null | UNIQUE com region/period nulos pode não garantir uma melhor marca | board_id não nulo ou índices/NULLS NOT DISTINCT conforme versão escolhida; testar concorrência/desempates no Postgres; 1B/7 |
| Ranking móvel/paginado | Novos recordes durante paginação podem duplicar/omitir linhas | Cursor com filtros/versão e ordenação completa; declarar consistência da leitura, testar limites e posição própria; 7 |
| Seeds validadas | 10k seeds não prova universalmente ausência de impossibilidades | Solver de alcançabilidade por padrão/concatenação + margens humanas + invariantes + seeds/regressão/playtest; 3 |
| Arte e rig | Imensa combinação de peças/animações sem nenhum asset produzido | Aprovar silhueta/rig e amostra animada cedo, antes de produzir todo catálogo; pairwise e casos críticos; 2/4/6 |
| Autenticidade de inputs | Replay válido pode vir de bot/simulador acelerado | Checagem tempo ativo <= janela servidor com tolerância versionada, quotas e auditoria; não chamar isso prova de humano; 1C/9 |
| Infra desatualizada | Documento cita arquivos.dev.br e desconhece evolução do Arquivos | Domínio corrigido; levar à homologação os limites efetivos do Arquivos e não somar tetos como capacidade livre; 9/10 |

As escolhas de política de prazo/semana/QUIT acima são **propostas para o aceite do plano**, não decisões de produto já aprovadas. Não afetam três vidas, cura, ranking regional ou demais invariantes. Números de retenção, catálogo e física continuam BASELINE/TUNABLE até medição e revisão correspondente. Não converter recomendações legais em parecer de conformidade.

## 4. Arquitetura de referência a consolidar na 1A

- Workspace TypeScript com um gerenciador/lockfile. Runtime Node LTS e versões compatíveis fixados na fundação após conferir documentação oficial; Phaser4 mantido.
- apps/portal: páginas e menus HTML acessíveis, i18n e integração do jogo.
- apps/api: Fastify, autorização/CSRF, DTOs, sessões e comandos; sem simular partidas longas inline.
- apps/verifier: processo independente, concorrência limitada, leases, replay e publicação transacional.
- packages/runner-core: step(state,input,rules), PRNG versionado, geração, colisão, score e eventos; sem DOM, Phaser, banco, relógio real ou rede.
- packages/runner-client: adaptador Phaser, inputs, áudio, rendering, interpolação e ciclo de vida do canvas.
- packages/contracts: schemas de runtime e DTOs derivados, codec/canonicalização do replay; evitar três definições manuais de cada contrato.
- packages/data: migrations e repositórios; fila/outbox em Postgres, sem Redis obrigatório.
- packages/content: manifests de regras, catálogos, i18n, assets/licenças. Fronteira de jogo explícita para não acoplar títulos futuros ao core Runner.
- tests/fixtures: replays com resultado esperado independente, seeds de regressão e testes de paridade navegador/Node. Golden fixtures não geradas e aprovadas automaticamente pelo mesmo código sob teste.

Não manter transação aberta durante simulação. Checkpoint incremental limita custo/RAM, mas não concede score antes de finalizar integralmente a run. Rules antigos devem ficar executáveis pelo prazo de submissão/auditoria. Arte altera apresentação; mudanças de telegraph que afetem competição requerem análise de versão.

Banco local/CI real, ligado a loopback e dados fictícios. Migrations aplicadas uma vez, com ledger/checksum/lock, e segunda execução sem trabalho; não usar IF NOT EXISTS indiscriminado para esconder divergência de schema. Testar banco vazio, upgrade, concorrência e falha/retomada.

## 5. Produção por partes — uma autorização e uma entrega por vez

A Issue #1 é um épico inicial: só estará concluída após 1A–1D integradas e PR executável. Subetapas anteriores não devem fechá-la prematuramente.

| Parte | Entrega concreta | Validação para encerrar | Gaps |
|---|---|---|---|
| **1A** | Workspace/lockfile, ADRs dos pontos acima, contrato validado, schemas iniciais, CI básica e comandos reproduzíveis | typecheck/lint/contrato sem erro/ref quebrada; nenhum fake de produção | G01–05,13–14 |
| **1B** | Postgres dev/migrations e core60Hz, PRNG, replay codec,3HP/salto duplo/slide/attack/abismo | DB real e upgrade; golden replays, fronteiras,30/60/120FPS e paridade browser/Node | G01,04,14 |
| **1C** | Guest real, start/segments/finish/status, jobs/verifier/outcome transacionais | run PENDING→VERIFIED; inválida REJECTED; retries, lease expirado, quotas, autorização e crash | G02,04–05,13 |
| **1D** | Primeira corrida Phaser/Bambu ligada aos módulos reais, teclado/gestos, resultado e i18n | E2E jogar→morrer→verificar, pausa, recusa fullscreen, sem score local aceito; instruções e PR da Issue1 | G01–02,08,14 |
| **2** | Combate completo, concentração/especial, HUD/pausa, controles alternativos; prova de rig/animação original | fronteiras de combate, inputs/gestos, amostra visual aprovada, física independente de cosméticos | G01,06–09 |
| **3** | Diretor procedural, quatro regiões/ciclos, transições e9arquétipos baseline | solver, concatenações,10kseeds, cinco ciclos, campo de visão mobile e teto de dificuldade | G07,09,14 |
| **4** | Quatro chefes, janelas, retirada e selos emitidos pelo domínio verificado | evasão sem ataque por chefe, empate derrota/retirada, instância única, zero cura | G09,11 |
| **5A** | Conta e-mail, confirmação/reset/sessões e reauth com transporte local de teste | tokens únicos, enumeração/CSRF, PT/EN, integração DB/outbox | G05,13 |
| **5B** | Google, vínculo/merge, privacidade/export/delete, perfil/nickname | assinaturas/claims/prova dupla, colisão de contas, revogação e merge concorrente | G05,13 |
| **6A** | Criador modular completo, catálogo/compatibilidade e persistência | seis categorias, básico livre, item raro recusado, versionamento concorrente e paridade core | G06,08 |
| **6B** | Arte final dos biomas/chefes/personagem, áudio e telas S00–S13 | slots/poses/pairwise, corrupção legível, licenças e cache limitado; sem placeholders na release | G06–08 |
| **7** | Carreira/missões, Aurora, ranking FULL/REGIONAL, melhor marca/hall | transação idempotente, QUIT elegível só cumulativos aprovados, desempates e merges | G03,11 |
| **8** |30templates,geração semanal/autofallback,histórico,2/4/5 e runs longas completas |3+anosISO,concorrência100gerações,virada/backlog,100+chunks,retry/offline,grande replay limitado | G02,10 |
| **9A** | Portal completo/SEO, integração transversal, segurança/acessibilidade e aparelhos reais | catálogo de1jogo real, PT/EN, páginas públicas, E2E completas, dispositivos e regressão | G08,13–15 |
| **9B** | Capacidade/carga/soak/restore/abuso e plano de homologação isolada | budgets medidos, qualidade de saídas, recuperação e rollback, sem impacto no Arquivos | G12–14 |
| **10** | Candidato completo + go/no-go; integrações externas e publicação separadamente autorizadas | G0–G4 e escopo público inteiro; pacote selado/hash, backup/restore e rollback antes da troca | G01–15 |

Amostras artísticas/rig começam na2, não ficam para depois de todo o backend. Trabalho de streaming começa na1C e é endurecido na8. Telas/traduções/testes nascem em cada parte;6B/9A são integração/polimento, não início tardio dessas disciplinas.

Se uma parte crescer, dividi-la pelo próximo comportamento testável (por exemplo um endpoint/estado completo), mantendo contratos e PR vinculados. Não prometer número fixo de tokens ou duração: orçamento depende dos defeitos encontrados e do material visual.

## 6. Como economizar contexto sem enfraquecer validação

- Uma parte por sessão/comando, por exemplo “Iniciar 1A”; não seguir automaticamente para todas as demais.
- Em cada início: branch/commit/status, AGENTS e índice atualizado; ler o documento de progresso e os contratos afetados. Na primeira implementação ler todo o baseline como exigido; não repetir o corpus inteiro a cada ajuste menor sem mudança de requisitos.
- Manter Progress.md com último commit, parte atual, decisões, requisitos/testes, comandos/resultados, limitações, arquivos relevantes e próximo comando. Criar na1A. Isso não substitui specs, registra execução.
- Cada PR: objetivo pequeno, critérios RR-*, teste executado, evidência, diferenças visuais e passos reproduzíveis. Desenvolvimento em branch; preservar trabalho do proprietário.
- Testes dirigidos durante edição, regressão integrada exigida ao concluir feature/contrato; gate completo da release antes de qualquer publicação. Não repetir carga/seeds massivas após alteração exclusivamente documental.
- Não usar subagentes ou sessões paralelas por padrão; decisão separada se houver benefício concreto. O modelo solicitado será usado pela configuração do proprietário; este plano não altera configuração do aplicativo.

## 7. Validação de mudanças e relação com os sites existentes

Aplicar os princípios da skill ronin-seo-intelligence/CHANGE_VALIDATION: reproduzir erro, observar resultado real, preservar funcionalidade anterior, revisar capturas/estilos e publicar exatamente o artefato testado. O runner ainda não possui npm run verify:release; criá-lo no novo workspace, com checks reais do jogo. O comando do Arquivos não testa o jogo por existir com o mesmo nome.

Mudanças só em docs requerem links/diff/contrato validado, não deploy nem reconstrução do Arquivos. A partir de código: typecheck/lint, unidade, integração PostgreSQL, contrato e E2E afetadas por PR; gate completo antes de release com ausência de falhas/flaky/skip inesperado. Playwright mobile não substitui Safari/iPhone físico.

Cenários críticos de regressão: 3HP/zero cura/abismo, gestos sem disparos duplos, pausa/FPS, previews animados reais do creator, salvar/reabrir visual, backend recusando score/posse forjados, vinculação sem perda, progresso e semana sem duplicata, idiomas, contraste e telegraph com corrupção máxima. Preservar evidências por commit, ambiente/rules e artefato.

Antes de deploy autorizado: homologação com rede/processos/DB separados, dados sintéticos, limites medidos para API/DB/verifier e coexistência com Arquivos; nada de copiar seus dois slots como padrão do jogo. Novos serviços não herdam o isolamento sem rede do worker Arquivos indiscriminadamente: verifier precisa acessar Postgres por canal autorizado, sem saída externa desnecessária. DNS/Caddy/SMTP/Google/produção exigem autorização separada. Sem GA/AdSense adicionado automaticamente por esta ideia de hub.

## 8. O que necessita do proprietário

Agora: aceitar o plano e escolher/reafirmar play ou dojo. O aceite pode adotar as políticas propostas de prazo/semana/abandono da seção3 como baseline a formalizar na1A; qualquer ressalva será registrada antes de implementar DTOs afetados.

Durante o projeto: aprovar amostras estéticas/catálogos propostos, fornecer acesso de teste a integrações quando necessário e participar do playtest/dispositivos. Antes de publicar: transporte de e-mail, origens Google, políticas/retenção, capacidade e autorização específica de infra. Não pedir senhas/tokens em chat.

## 9. Referências primárias e limites da revisão

- [Issue1](https://github.com/Kennedh/ronin-jogos/issues/1): épico de fundação, sem autorização de deploy.
- [Phaser4 releases](https://phaser.io/download/phaser4): versão estável4 disponível; fixar versão compatível no lockfile e testar, sem trocar stack por conveniência.
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html): NULLS NOT DISTINCT/constraints; unicidade composta precisa considerar nulos.
- [Simulação](./RONIN_RUNNER_CONTRATO_SIMULACAO_PARTIDAS_RANKING_v1.md), [aceite](./RONIN_RUNNER_MATRIZ_ACEITE_E_EXECUCAO_v1.md) e [testes](./RONIN_RUNNER_TESTES_LANCAMENTO.md) permanecem fontes do produto.

Revisão de viabilidade e contrato não executa física, Postgres ou teste de jogo inexistente. Não anunciar G01–G15 como homologados. Resultado do lint e links será registrado ao concluir esta branch documental.

### Verificações executadas nesta revisão

Redocly CLI (configuração recommended padrão): antes1erro/57avisos; depois0erros/21avisos, exit0. Corrigida descrição malformada e adicionados operationIds únicos. Avisos remanescentes: metadados de licença ainda não escolhida, descrições de tags e respostas4xx ausentes. Não foram ocultados por ignore/config relaxada. O lint não comprova completude dos fluxos ou segurança dos DTOs; lacunas da seção3 permanecem. Links relativos Markdown conferidos em AGENTS/README/docs sem destino ausente; git diff --check aprovado. Sem testes de jogo porque ainda não existe aplicação executável nesta base.
