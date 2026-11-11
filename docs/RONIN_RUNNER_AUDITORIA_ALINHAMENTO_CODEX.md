# Ronin Runner — Auditoria de lacunas e plano de alinhamento para Codex (v0.17)

**Estado:** auditoria de especificação, sem implementar código. Base: `main` do repositório `Kennedh/ronin-jogos`, com 12 documentos de design anteriores e somente pastas `src`/`public` com `.gitkeep` no momento da revisão.  
**Objetivo:** distinguir regras confirmadas de números provisórios, identificar contradições reais e deixar um pacote que o Codex execute **somente quando o usuário autorizar programar**, mirando a **primeira versão pública completa**.

## 1. Definição de "pronto para Codex"

**Não é "temos código".** O conjunto de especificações está pronto para autorizar implementação quando:
1. Todas as regras de produto confirmadas estão numa fonte canônica, sem contradições entre docs.
2. As políticas competitivas, autenticação, salvamento, ranqueamento e sessões têm **comportamento inequívoco**, incluindo falhas e bordas.
3. OpenAPI 3.1, modelos de eventos/estado da partida, IDs e ERD/migrations propostas estão formalizados em artefatos legíveis por máquina/validação; não basta uma tabela vaga de endpoints.
4. Catálogos de assets, animações, personagens e telas têm inventário e critérios de aceite objetivos, ainda que arte final seja produzida durante desenvolvimento.
5. As escolhas que exigem playtest/performance estão marcadas **TUNABLE**, com valor inicial, intervalo plausível, método de medição, controle de versão e regra de promoção para produção.
6. Os testes de cada requisito e as restrições de recursos da VPS estão ligados ao contrato correspondente.
7. Existe plano de staging, deploy, rollback, dados reais/sintéticos, moderação, privacidade e operação.
8. Codex recebe instruções claras de **não reduzir escopo de lançamento** e de implementar em etapas sobre arquitetura final, sem mini-MVP descartável.

## 2. Decisões de produto já FECHADAS — NÃO PERGUNTAR NOVAMENTE

- A primeira versão pública terá o jogo **completo**, mesmo que o desenvolvimento e testes sejam incrementais na arquitetura final.
- Mundo infinito com quatro regiões/ciclos e corrupção crescente; pontos de partida regionais desbloqueáveis, com ranking regional separado da Jornada Completa mundial.
- Três vidas por partida; **nunca recuperar vida**; abismo mata imediatamente; salto duplo disponível desde a primeira partida.
- Mobile por **gestos**, paisagem com fullscreen quando permitido e fallback; desktop teclado.
- Quatro chefes fazem parte do escopo e **podem recuar sem interromper a corrida**. Derrota opcional gera pontos e conquistas; quatro selos geram **Traço da Aurora** puramente cosmético.
- Missões permanentes e desafios semanais **autogerados** sem curadoria semanal manual; níveis **Bronze em 2/5, Prata em 4/5 e Ouro em 5/5**, sem buffs.
- Criador de Ronin completo/modular: cabelo, rosto, tom de pele, roupas, acessórios e katana; **aparência básica LIVRE desde o início**, cosméticos especiais conquistáveis, sem alteração de hitbox/atributos.
- Ronin ID: visitante com apelido, criação por e-mail/senha **e** Google desde lançamento, progressão persistente, fusão/vínculo seguro; visitantes elegíveis aos rankings conforme modo.
- Localização PT-BR/EN, acessibilidade, arte original em sumi-e/aquarela, deploy econômico em VPS, ausência de dependência de IA paga.
- O servidor só publica scores/itens após verificar resultados. **Replay físico não garante distinguir bot avançado de humano**; limites e revisão são necessários.

## 3. Matriz de lacunas por prioridade

**Estado:** FECHADO = decisão confirmada; DOCUMENTADO = contrato de intenção existente mas falta congelamento; PROPOSTO = default recomendado; DEPENDE DE TESTE = não fixar cegamente; PENDENTE = decisão/contrato ainda exigido.

| ID | Domínio | Estado | O que falta fechar | Documento/artefato de saída |
|---|---|---|---|---|
| G01 | Regras exatas do motor de simulação | DOCUMENTADO / DEPENDE DE TESTE | modelo fixed-point/quantização, prioridade de eventos no mesmo tick, equações de salto/colisão, duração por tick, efeito real de pause; checksum de replay | `CONTRATO_SIMULACAO_v1.md` + fixtures determinísticas |
| G02 | Corridas infinitas e replay longo | PENDENTE | compressão/streaming de input, pausas e abandono, expiração, reconexão, run cruzando semana, disco/CPU, política de checkpoint não confiável no cliente | `POLITICA_PARTIDAS_LONGAS.md` |
| G03 | Pontuação e histórico de ranking | DOCUMENTADO / PENDENTE | fórmula final, exploits de farm, bônus boss, empate, melhor score por período, regras de patch e compatibilidade de `rules_version`, ban/revisão | `CONTRATO_PONTUACAO_RANKING.md` |
| G04 | Contratos REST e dados formais | DOCUMENTADO | OpenAPI 3.1 de requests/responses/errors, estados e limites de payload; DDL/migrations/índices; transações/idempotência | `openapi.yaml` + ERD + migrations design |
| G05 | Identidade, e-mail, Google e contas | DOCUMENTADO / PENDENTE | política de sessões e merge, fluxo exato de verificação/recuperação, servidor SMTP e autenticação Google por domínio, consentimento/exclusão | `CONTRATO_IDENTIDADE.md` + diagramas de estado |
| G06 | Criador e pipeline de arte | FECHADO escopo / PENDENTE catálogo | número mínimo de peças básicas livres, regras de visual e clips, peças especiais/unlocks, tabela de poses e rig, paleta e inventário de assets | `CATALOGO_VISUAL_ASSETS.md` |
| G07 | Direção de arte e som | DOCUMENTADO / PENDENTE | paletas/camadas vivo-corrompido por bioma, especificação de sprites e atlases, personagens/chefes/anim, SFX/música, licenças, sistema de LOD | `ART_BIBLE_AUDIO.md` + asset manifest |
| G08 | Telas, responsividade e UX | DOCUMENTADO / PENDENTE | wireframes/flows de todas S00–S13, comportamento em erro/pending, safe-area e orientações, navegabilidade/acessibilidade, design tokens, i18n strings | `WIREFRAMES_DESIGN_SYSTEM.md` |
| G09 | Conteúdo de jogo e balanceamento | FECHADO escopo / DEPENDE DE TESTE | números finais de inimigos, bosses, tempos de telegraph, distância por região, hitboxes, padrões, densidade, efeitos e testes de alcançabilidade | `BALANCEAMENTO_v1.md` + fixtures de seed |
| G10 | Semanais autogerados | FECHADO mecânica / PENDENTE números | 30+ templates curados, metas por tier, filtros de repetição, 2/2/1, semana UTC, corte/grace, reprocessamento/failover, emblema composto | `CATALOGO_DESAFIOS_SEMANAIS.md` |
| G11 | Progresso e cosméticos | DOCUMENTADO / PENDENTE catálogo | trajes extras finais, categorias, condições de desbloqueio, missões e mensagens, políticas de evento VERIFIED/abandoned | `CATALOGO_MISSOES_COSMETICOS.md` |
| G12 | Infraestrutura / VPS | DOCUMENTADO / PENDENTE medidas | topologia do deploy, recursos da VPS, portas e Caddy, backups/restauração, SMTP, workers/filas, cache, limites de carga, staging/rollbacks | `TOPOLOGIA_OPERACAO_VPS.md` |
| G13 | Segurança / privacidade | DOCUMENTADO / PENDENTE políticas | retenção de eventos, perfis públicos, moderação de apelido, contestação de ranking, exportação/exclusão, política LGPD, segredo/rotação | `SEGURANCA_PRIVACIDADE_OPERACAO.md` |
| G14 | CI, testes e critérios de release | DOCUMENTADO / DEPENDE DE TESTE | ligar cada requisito a teste, thresholds por dispositivo, seeds massivas, E2E identity, revisão de licenças, staging/production Go/No-Go | `MATRIZ_REQUISITOS_TESTES.md` e CI checks |
| G15 | Integração Ronin Play/site | PENDENTE | endereços/routes definitivos (ex. `play.ronin.dev.br` apenas proposta), menu portal, SEO páginas PT/EN, analytics mínimo e ligação com identidade compartilhada | `INTEGRACAO_PORTAL_RONIN.md` |

**Leitura correta:** escopo fechado não significa arquivo final da feature congelado; por exemplo, **criador completo e básico livre** é requisito, mas catálogo de arte ainda é uma escolha/produção. Física em 60 ticks é um baseline recomendado, mas tempos e frames só ficarão definitivos após playtest sobre a arquitetura final.

## 4. Ordem de fechamento — evitar retrabalho

### Fase A: contratos que mudam arquitetura, **antes de qualquer programação**
1. **G02 + G03 + G01**: decisão de corridas longas, pausa, reconexão, protocolo de replay, clock/seed, física por tick e score/versões. Determina o formato de dados e do verificador.
2. **G04 + G05 + G13**: OpenAPI, schema, identidade/merge, idempotência e privacidade. Determina API e migrations.
3. **G12**: medições da VPS, ambiente de staging, worker limit, armazenamento, SMTP/Google e processo de rollback.
4. **G15**: onde jogo e portal vivem, origem do Ronin ID, cookies cross-subdomínios e isolamento de contas.

### Fase B: conteúdo e arte **antes de congelar o catálogo**, executáveis em paralelo com G01/G04 no planejamento
5. **G06 + G07**: inventário visual, rig e animações, opções básicas de aparência livres, especiais por conquistas, arte e som por região.
6. **G08**: design tokens, telas e wireframes PT-BR/EN, estados de erro, mobile safe-area e acessibilidade.
7. **G09 + G10 + G11**: balanceamento e catálogos de inimigos/obstáculos/chefes, desafios semanais, progressão e itens.

### Fase C: aceitação técnica
8. **G14**: rastreabilidade de requisitos e testes; métricas/limites; checklist de homologação e release G0–G4.
9. **Revisão transversal:** identificar regras conflitantes entre documentos, marcar canonicidade e freezes por versão.
10. **Handoff único ao Codex:** arquivo de entrada com ordem de leitura, ADRs, escopo total, arquitetura e tarefas, anexando referência aos contratos.

## 5. Políticas recomendadas como BASE para a próxima especificação (AINDA NÃO CONFIRMADAS)

### 5.1 Corridas sem fim e limite de validação (G02)

Recomendação: **não impor um timer invisível de morte/encerramento em corridas longas**. Replays compactos por input (não vídeo/frames), com possibilidade de envio por partes e verificação incremental/reprodução por segmento **desde que autoridade do servidor não seja perdida**. Limitar tamanho, ritmo e retenção; se a VPS não aguentar runs muito longas, comunicar política explícita e avaliar checkpoints VERIFICADOS pelo servidor, não "assinatura" de checkpoint gerado apenas pelo cliente. Pausas de foco devem congelar simulação com regras antiabuso publicadas.

Aguardando definição concreta: máxima idade de run, tolerância de desconexão, tempo de pausa em ranqueadas, como tratar abandono, quando reabrir run e se haverá limite técnico anunciado.

### 5.2 Score ao mudar as regras (G03)

Recomendação: armazenar **cada run com sua rules_version/scoring_version** imutável. Mudança que afete física/score/gerador deve ter política clara de quadros: temporada atual comparável pela mesma major de regra, histórico/recordes antigos arquivados e mostrados com versão; não misturar pontuações incompatíveis. Decidir visual de "all-time" após patches grandes sem apagar conquistas legítimas.

### 5.3 Semanas e escala (G10)

Recomendação: cinco desafios globais por semana, dois acessíveis/dois intermediários/um avançado, ISO segunda 00:00 UTC, biblioteca inicial de no mínimo 30 templates com faixa de metas, rotação de padrões e fallback. **Marcos confirmados** Bronze 2/5, Prata 4/5, Ouro 5/5 não estão em discussão. Garantir que os objetivos sejam completáveis em uma sessão sem forçar login diário.

### 5.4 Conteúdo final de arte (G06–G09)

Recomendação: catálogo de peças básicas gratuitas substancial (p.ex. 5 cabelos, 6 cores, 8 tons de pele, 4 rostos, detalhes faciais), além de traje e katana inicial. Quantidades são **propostas** e dependem de estimativa artística; não restringir aparência pessoal para monetizar ou premiar. Cada peça precisa de `slot`, compatibilidade de rig, asset e ID versionado, animações obrigatórias, variante mobile e teste de clipping.

### 5.5 Rank/antibot (G03/G13)

Não prometer antifraude infalível: verificador de replay distingue ações fisicamente impossíveis, mas um script pode enviar ações fisicamente possíveis. Política de rate limit, detecção de anomalias, recurso e audit log, sem exigir dados pessoais extras ou bloquear convidado por padrão. Regras de ranking precisam ser públicas e estáveis.

## 6. Pontos de conflito/ambiguidade que merecem correção na revisão final

- **"Infinito" versus payload/timeout:** sem limite técnico explícito, uma corrida válida pode exceder tamanho máximo de upload ou tempo de análise. Precisa política de chunks ou checkpoints confiáveis.
- **"100% automático" versus operacional:** o gerador semanal tem fallback, mas necessita monitoramento, alertas e recuperação após falhas. Autonomia não elimina operação.
- **"Reproduzir run" versus humano real:** replay físico é boa proteção de integridade, porém não impede todos os bots. Descrever defesa em camadas, não perfeição.
- **"All-time" versus mudanças de versão:** evitar comparar scores de versões incompatíveis sem dizer qual regra se aplica.
- **"Aparência básica livre" versus desbloqueios de cabelo especial:** deixar claro que somente variantes excepcionais são desbloqueáveis, e nunca bloquear opções básicas de cabelo/rosto/tom de pele.
- **"Versão completa" versus desenvolvimento em etapas:** implementação por fatias sobre módulos finais **não** significa lançamento público antecipado ou testes iniciais automaticamente suficientes.
- **"Jogo só no navegador" versus recuperação de guest:** visitante participa do ranking, mas pode perder sessão quando apaga cookies; informar antes e oferecer vinculação voluntária após progresso.
- **"PT-BR/EN" versus e-mails/erros:** enviar traduções inclusive em verificação, reset de senha, páginas legais, estados de erro, ranking e semana.
- **"Partida longa" versus regras de semana:** qual período recebe runs iniciadas numa semana e finalizadas noutra; servidor determina, nunca o relógio do celular.
- **"Sem vantagem cosmética" versus visual de katana:** efeito não pode alterar leitura de ataque/telegraph ou obscurecer golpes adversários.

## 7. Regra de precedência documental

1. **Decisão explícita mais recente do usuário confirmada neste chat ou registrada em documento de decisão** prevalece.
2. [Especificação geral](./RONIN_RUNNER_SPEC.md) é o índice de produto; [v0.16 handoff](./RONIN_RUNNER_PREPARACAO_CODEX.md) fornece instruções, não modifica decisões.
3. Documento de subsistema mais recente detalha uma regra geral, sem poder contradizer decisão explícita.
4. Parâmetro marcado PROPOSTO/TUNABLE não vira definitivo por ter sido escrito em tabela.
5. Em conflito não resolvido, registrar ADR/pendência ao invés de Codex decidir silenciosamente regras de produto ou cortar escopo.

**Não houve programação, migration, mock, deploy, alteração de segredos nem execução de testes nesta auditoria.**
