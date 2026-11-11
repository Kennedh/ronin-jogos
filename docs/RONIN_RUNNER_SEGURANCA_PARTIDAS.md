# Ronin Runner — Integridade de partidas, segurança, replay e antifraude (Design técnico v0.16)

**Status:** especificação de controles e limites antes de programar. O servidor deve verificar resultados antes de liberar ranking, progressão e recompensas. **Nenhuma proteção client-side garante anticheat perfeito no navegador.**  
**Documentos relacionados:** [Principal](./RONIN_RUNNER_SPEC.md), [Contrato API e dados](./RONIN_RUNNER_CONTRATOS_API_PERSISTENCIA.md), [Movimentação](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md), [Chefes](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md), [Semanais](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md).

## 1. O que proteger e o que não prometer

**Ativos:** ranking global e regional, score, missões, selos de chefes, Traço da Aurora, selos Bronze/Prata/Ouro semanais, desbloqueios, identidades Ronin ID, perfis e infraestrutura da VPS.

**Ameaças:** alterar score via DevTools, enviar kills falsos, duplicar runs e recompensas, inventar eventos de chefe, trocar seed/região/mode, acelerar relógio/physics, usar bot que joga com inputs válidos, repetir logs legítimos de outra conta, criar milhares de visitantes para sobrecarregar API, força bruta, brute force de senha, enumeração de e-mail, roubo de cookie, CSRF, XSS em apelidos, BOLA/IDOR, custos ilimitados de validação, filas congestionadas, saturação do PostgreSQL, payloads enormes e abuso de recursos.

**Limite honesto:** refazer a simulação de um log determina se o **resultado é compatível com regras do jogo**, mas **não prova que os inputs vieram de um humano real**. Um bot sofisticado pode gerar inputs válidos. Além de replay, usar limites de submissão, análise estatística, monitoramento e moderação revisável para suspeitas; nunca declarar ranking "à prova de trapaças".

## 2. Fonte de verdade e contrato de simulação

- Core TypeScript puro, versionado por rules_version e replay_protocol_version; renderizador Phaser 4 e APIs não calculam score autoritativo.
- Preferir ticks inteiros (alvo 60/s), pseudo RNG determinístico com seed do servidor, fixed-point/quantização para física, colisões e timestamps de input, e desempate canônico de eventos no mesmo tick.
- Gravar input por tick, não estado final livre: JUMP, DOUBLE_JUMP, SLIDE, ATTACK, PAUSE/resume conforme política; estados não aplicáveis ignorados/rejeitados segundo regras.
- O verifier reexecuta a simulação do início do modo, gera obstáculos e ataques, computa hits e boss defeats, observa vidas 3→2→1→0, detecta abismo fatal, soma distância REAL, score e eventos de missão.
- **Aparência é não autoritativa:** cabelo, pele, rosto, roupa, acessório e katana não afetam physics, hitbox ou pontuação; mesmo replay deve produzir mesmo resultado com qualquer avatar permitido.
- Regras de golpes/perfect slash, chefes que recuam, salto duplo inicial e concentração congeladas por rules_version para replay.
- Ao mudar regra, guardar artefato verificável antigo durante o prazo de auditoria e definir se rankings são segmentados por versão ou preservam marcas antigas, sem mudar scores a posteriori.

## 3. Ciclo de vida da tentativa

| Estado | Origem | Efeito | Transições |
|---|---|---|---|
| CREATED | start aceito | cria run_id ligado a player_id/mode/seed/version | ACTIVE, CANCELLED, EXPIRED |
| ACTIVE | cliente recebeu regras | pode executar corrida local, sem progresso confirmado | PENDING, ABANDONED, EXPIRED |
| PENDING | replay recebido completo, dentro de limites | nenhum recorde/recompensa definitiva; cliente pode acompanhar status | VERIFYING, REJECTED |
| VERIFYING | worker com lease seguro | simular e validar; worker único ou claim atômico | VERIFIED, REJECTED, PENDING retry |
| VERIFIED | replay integral compatível | transação de score + progresso + selos + leaderboard | terminal; idempotente |
| REJECTED | fraude, inconsistência ou inválido | resultado não ranqueado, erro geral sem vazar heurísticas | terminal, revisão manual por suporte |
| ABANDONED/EXPIRED | run incompleta/expirada | nenhum evento não verificado é concedido | terminal, observabilidade |

**Nota:** completa por morte/abismo ou desistência explícita conforme política do jogo; regra de conceder estatísticas em abandono só após replay verificável e fechamento autorizado. Resultados pontuados **nunca** só por cliente abrir tela final.

## 4. Início de tentativa

- Autenticação: visitante válido tem player_id e sessão emitida pelo servidor, assim como conta e-mail/Google; mesmo direito ao ranking.
- API verifica rate limit, região desbloqueada para REGIONAL, uma quantidade limitada de runs ACTIVE por identidade, condição de rules_version ainda suportada e limite de tentativas recentes.
- Emite run_id aleatório não adivinhável, seed, version, started_at e limite de submissão/replay, associado ao player_id.
- FULL sempre começa em 0 m; REGIONAL começa no ponto desbloqueado, pontua só distância real, vai exclusivamente para ranking regional.
- Não tratar seed visível ao cliente como segredo de segurança; seed é necessária à simulação, por isso verificação não depende de escondê-la.

## 5. Entrada, payload e transporte

- Replay compacto contém ticks monotônicos e comandos limitados aos reconhecidos; eventos deriváveis (kill, perfect, hit, score, boss defeated) são **calculados pelo verificador**, nunca aceitos como autoridade.
- Limites predefinidos antes de publicar: máximo de eventos por tick, eventos por segundo de run, eventos totais, compressed_size, decompressed_size (anti zip bomb), ticks/duração, número de conexões, timeout, permissões de pause e frequência de finish por identidade/IP.
- Fracionamento/chunked upload, se necessário para runs longas, deve usar hash de conteúdo e ordem imutável, armazenamento temporário com quotas e finalização atômica; evitar multipart genérico sem limites.
- Logs não incluem senhas, cookies, ID tokens Google, tokens de verificação e conteúdos privados indevidos.
- Uso de HTTPS e validação de host/origin; CSRF quando método com cookie altera estado; Fastify com schemas estritos para corpo/params/query.
- Idempotency-Key por solicitação + UNIQUE no banco para run_id, eventos únicos e recompensas, com resposta canônica em retry.
- Replay de um usuário NÃO pode ser transplantado para outro player_id ou run_id; o vínculo se verifica no servidor.

## 6. Validação por camadas e custo escalável

A validação completa para cada run **só ocorre após triagem barata**, impedindo gastos abusivos:

**Camada A — gateway:** sessão válida, rate limit, tamanho/encoding, schemas, host/origin, versão, idade da run, identidade.
**Camada B — verificações estruturais:** ticks não negativos e crescentes, eventos máximos, ações possíveis no formato, runs não duplicadas, referência a seed/version existente, plausibilidade grosseira da duração/posição.
**Camada C — replay determinístico completo:** simulação da física + geração + chefes/inimigos + colisões + score/distance + mortes.
**Camada D — decisão e monitoramento:** score verificado, flags de estatística anômala, limitação de entrada no ranking de suspeitos quando houver regra revisável, auditoria e eventual moderação com procedimento de recurso.

**Orçamento de recursos proposto para homologação:**
- worker pool com limite de concorrência configurável (por CPU/RAM da VPS), fila persistente em PostgreSQL ou solução local equivalente, reprocessamento com backoff e dead letter;
- maximizar throughput por replay com fast-forward de ticks inativos e estruturas de dados otimizadas, mas **sem pular colisões/ataques necessários para a prova**;
- congelar máximo permitido de uma run sob justificativa técnica e interface clara para jogadores de longa duração, ou optar por segmentação/checkpoints verificados, nunca interromper silenciosamente um recorde legítimo;
- medir custo de CPU por minuto de jogo e definir teto de runs/s que a VPS suporta, com degradação controlada e 202 PENDING se a fila encher;
- armazenar replay compacto em local protegido, com TTL e auditoria; limites de armazenamento por usuário e por run, impedir comprometimento por disco cheio;
- read replicas/escala vertical só quando métricas exigirem, sem infraestrutura paga desnecessária desde o início.

**Checkpoints** assinados apenas pelo próprio cliente não provam nada. Qualquer esquema de checkpoint confiável precisa de verificação ou estado autorizado por servidor, custeado e documentado. Não usá-los como atalho ingênuo para anticheat.

## 7. Proteção de ranking, estatísticas e cosméticos

- Pontuação canônica derivada de distância real + inimigos comuns + perfect slash + bônus fixo de chefe derrotado, por rules_version. Missões e semanários não multiplicam score.
- Se chefe recua: nenhum bônus de kill, sem penalidade pela retirada, corrida prossegue; golpes evitados não causam dano; boss_defeated falso é ignorado/rejeitado.
- Dados de corpo físico não variam com skin/acessórios; tentativa de equipar item bloqueado via request rejeitada na API. Acesso aos cosméticos requer posse ou marca is_basic_free autenticada no catálogo.
- Conquistas e selos: UNIQUE(player_id, boss_id), UNIQUE(player_id, item_id) e UNIQUE(player_id, edition_id, tier) para impedir duplicata em retries/concurrência. **Quatro selos dos chefes = Traço da Aurora**. Semanas: Bronze 2/5, Prata 4/5, Ouro 5/5.
- Ranking all-time e semanal FULL apenas início zero; regionais exclusivamente REGIONAL, nunca atribuir distância pulada.
- Para scores suspeitos, status auditável (provisório, revisão, validado/rejeitado), política de contestação e explicação genérica ao jogador; não apagar conquistas por falsa detecção automática sem revisão.

## 8. Ameaças de identidade e controles específicos

| Risco | Contenção obrigatória |
|---|---|
| IDOR/BOLA | autorização por player_id do cookie em **toda** rota de runs, catálogo, conta, progresso e mudança de avatar |
| Mass assignment | schemas allowlist, não aceitar is_admin, unlocks, score ou player_id do corpo |
| Sessão roubada/fixação | cookie Secure, HttpOnly, SameSite, rotação ao autenticar/vincular, revogação e CSRF |
| Recuperação de senha | token de uso único com digest no banco, expiração e rate limit, respostas antienumeração |
| Google OAuth/ID token | verificar assinatura, aud, iss, exp e sub, CSRF e fluxo de vinculação explícita |
| Brute force/cred stuffing | Argon2id com custo benchmarked, backoff/rate limit por identidade e IP, controle de abuso |
| Nickname malicioso | normalização e moderação, escapar na UI, proibir HTML/script, URLs de perfil controladas |
| Upload arbitrário | nenhum avatar/foto livre no lançamento; IDs de catálogo versionados |
| Visitas/bots em massa | criar guest com quotas, barrar enumeração de IDs, limites de e-mail e de início/final de runs |
| XSS/CSRF | escaping, CSP compatível, cookies, defesa de CSRF nas mutações e third-party login |
| Replays gigantescos | tamanho comprimido e descomprimido, límites de tick/duração, timeout, fila e quotas |
| Volumes de leitura leaderboard | paginação por cursor, índices e cache, sem consulta geral por usuário a cada frame |
| Inundação de desafios semanais | edição global imutável com UNIQUE(week_id), progresso incremental por run verificada |
| Uso indevido de múltiplas contas | limites e análise de padrões, nunca correlacionar arbitrariamente pessoas reais por IP único |

## 9. Pausa, desconexão e runs longas

- Pausa por menu, mudança de aba/orientação/focus protege o usuário, mas **a contagem competitiva não pode ser manipulada** para ganhar tempo extra em eventos telegráficos. Inputs fora da sequência ativa devem ter rejeição/regras determinísticas; pausa interrompe ticks autoritativos.
- Definir antes do código limites justos de pausa (quantidade/tempo) para runs ranqueadas e semanários. Esses números são **pendentes**, não inventados aqui. Não forçar derrota porque o usuário recebeu chamada.
- Quando a rede cai durante a run, continuar localmente enquanto houver replay íntegro e sessão autorizável; se não houver, apresentar estado não ranqueado. Nenhuma promessa de submissão futura ilimitada.
- Se travar/fechar browser: recuperação só de replay previamente persistido e íntegro, dentro de expiração definida; não confiar cegamente no armazenamento local para provar validade competitiva.
- Semana global é ancorada no horário do servidor UTC. Atribuição de runs que cruzem a virada será revisada e testada, com grace window definida. Sem dar crédito por alterar relógio do aparelho.

## 10. Operação, logs e resposta a incidentes

- Observabilidade sem PII: filas, tempo/CPU por replay, rejeições por motivo técnico, score validado por minuto de jogo, p95 de endpoints, taxa de novos guest IDs, e-mail/reset e distribuição de runs por modo/dispositivo.
- Logs com request_id/run_id e códigos, sem emails completos, tokens, cookies ou passwords; acessos restritos.
- Backups criptografados e restauração testada; audit logs de alterações de account link, regras, edições semanais e moderação de ranking.
- Painel administrativo protegido por forte autenticação e autorização independente para moderar apelido, flags e runs; ferramentas de suporte nunca alteram replay original.
- Atualização de rules_version: promover somente com testes/benchmark, preservar compatibilidade histórica ou criar quadro separado se mudança produzir competição incomparável.
- Privacy by design: coletar mínimo necessário; finalidade, retenção, exclusão/anonimização e informações ao usuário conforme LGPD.

## 11. Testes e ameaça residual

- Mutação de input: score forjado, perfect_slash sem golpe, 4 chefes fictícios, warp para Castelo, salto no ar múltiplo, colisão ignorada, invulnerabilidade contra abismo.
- Reenvio concorrente de finish, replay com hash alterado, run associada a player_id alheio, boss/reward duplicado, semanas 2/4/5 concedidas em um único commit.
- Replays válidos adversariais: milhões de ticks (conforme limite definido), alta densidade de inputs, cliente lento, 30/60/120 Hz, FPS oscilando, pausas, perda de rede, bot que escolhe inputs perfeitos, seeds repetidas.
- Prova de que otimizar replay com lotes não muda score nem colisões; múltiplas versões antigas verificadas.
- Validar que o sistema **detecta eventos impossíveis**, **não** alegar que detecta todo bot que joga validamente.
- Security test de login, sessão, CSRF, IDOR/BOLA, schema mass assignment, nickname e rate limit; pentest/ revisão conforme alcance público.

## 12. Referências

- OWASP API Security: https://api-security.owasp.org/
- OWASP API1 Broken Object Level Authorization: https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/
- OWASP API3 Broken Object Property Level Authorization: https://api-security.owasp.org/editions/2023/en/0xa3-broken-object-property-level-authorization/
- OWASP Authentication: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- Google Identity: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

**Condição de lançamento:** rankings somente com runs VERIFIED, desempenho medido com carga realista, abuso controlado e restrições de segurança avaliadas. Não programar enquanto contratos e limiares fundamentais estiverem sujeitos a escolha do produto.
