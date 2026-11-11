# Ronin Runner — Contratos de API, dados e persistência (Design técnico v0.16)

**Estado:** especificação pré-implementação; endpoint paths, tipos e códigos são contratos **propostos para congelamento** antes de qualquer código. As decisões do produto prévias seguem confirmadas.  
**Fontes internas:** [Especificação principal](./RONIN_RUNNER_SPEC.md), [Ronin ID](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md), [Criador v0.15](./RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md), [Semanais](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md), [Segurança e partidas v0.16](./RONIN_RUNNER_SEGURANCA_PARTIDAS.md).

## 1. Arquitetura e contratos entre subsistemas

- **Frontend web**: menus acessíveis, i18n pt-BR/en, perfil, criador e sessões.
- **Cliente de jogo**: Phaser 4 + TypeScript + Vite, visual/animação/input. Joga com simulação determinística em passos fixos; envia comandos/logs de tentativa.
- **Pacote de regras compartilhado**: versão fixa e auditável para movimento, hitboxes, RNG/seed, catálogo de obstáculos/chefes, pontuação e formato de replay; sem dependência de renderização no núcleo.
- **API**: Node.js + Fastify + TypeScript; autentica sessão, aplica autorização, cria partidas, recebe replays, consulta e modifica dados de perfil/cosméticos via comandos autorizados.
- **Verificador worker**: processa replays de modo assíncrono e com limites, produz resultado confiável; começa dentro da mesma VPS se couber, sem exigir serviço externo pago. API não deve travar aguardando uma run longa.
- **PostgreSQL**: fonte de verdade para identidade, progresso, regras, runs, desafios semanais e rankings; migrations, integridade transacional, índices e backups.
- **Caddy/HTTPS**: entrada reversa, headers e TLS; nenhum endpoint interno do worker/banco exposto publicamente.

## 2. Convenções de API (versão proposta v1)

- Prefixo /api/v1; documentação OpenAPI 3.1 gerada e testada desde o início; interfaces DTO TypeScript compartilháveis.
- JSON UTF-8, ISO 8601 UTC em datas, nomes em snake_case no transporte, UUID/IDs opacos em strings; nunca usar apelido/e-mail para identificar dono de uma run.
- Montantes e distância como inteiros (milímetros/unidades ou metros inteiros conforme contrato) para evitar deriva de floats; distinguir total_elapsed_ticks, active_ticks e wall_time.
- Resposta de erro padronizada: {error:{code,message_key,request_id,details?}}; code estável, UI traduz message_key, details sem segredos; request_id para rastrear suporte.
- Paginação por cursor opaco em rankings, order estável por (score DESC, distance DESC, elapsed_ticks ASC, verified_at ASC, run_id ASC) conforme regra revisável; nunca offset ilimitado.
- Cookies HttpOnly, Secure, SameSite e CSRF conforme fluxo; origin checks e CORS allowlist de domínios próprios, sem '*' com credenciais.
- Operações que geram efeito aceitam chave Idempotency-Key por sessão/requisição quando apropriado; UNIQUE em banco garante proteção mesmo com retries.
- Todas as rotas têm limite de tamanho do corpo, validação estrita de esquema, timeout, rate limit e autorização por recurso, não só por login.
- Status aceitos típicos: 200 consulta; 201 criado; 202 pedido de verificação; 204 revogação; 400 inválido; 401 sem sessão; 403 sem posse; 404 não encontrado; 409 conflito; 413 oversized; 422 regra inválida; 429 limite; 503 indisponibilidade controlada. Mensagens genéricas em login/recovery evitam enumeração.

## 3. Identidade, conta e sessões

| Rota candidata | Método | Requisição resumida | Retorno público | Semântica |
|---|---|---|---|---|
| /auth/guest | POST | vazio/opções mínimas | player público + sessão cookie | cria/reusa visitante; não multiplica IDs por retry |
| /auth/register | POST | email, password, nickname? | status pending_verification | se visitante, fluxo de vincular respeita sua identidade |
| /auth/verify-email | POST | verification_token | status verified | token de uso único; sem expor segredo em log |
| /auth/login | POST | email, password | profile summary, cookie renovado | invalida fixação de sessão |
| /auth/google | POST | token/credential + defesa CSRF | profile summary, cookie | verificar assinatura, aud, iss, exp e sub no backend |
| /auth/logout | POST | atual session | 204 | revoga sessão |
| /auth/password/forgot | POST | email | 202 genérico | antienumeração; limitação de tentativas |
| /auth/password/reset | POST | reset_token, new_password | 204 | token único; rotação/revogação de sessões |
| /auth/link | POST | method, prova de posse | novo provider vinculado | exige reautenticação apropriada |
| /auth/merge/preview | POST | contexto de ambas sessões autenticadas | inventário comparativo | não transfere progresso |
| /auth/merge/confirm | POST | merge_nonce, confirmação | perfil canônico e auditoria | transação idempotente; deduplica runs |
| /me | GET | sessão | player_id, nickname, locale, linked_methods? | esconder e-mail em perfis públicos |
| /me/sessions | GET | sessão autenticada | sessões resumidas | não revelar identificadores secretos |
| /me/sessions/{id} | DELETE | reauth para ações sensíveis | 204 | revoga uma sessão autorizada |

**Decisões de segurança:** senhas com Argon2id + salt; custo testado na VPS seguindo mínimo OWASP vigente (19 MiB, t=2, p=1 como linha-base sujeita à atualização), sem logar senha ou token. Identidades Google vinculadas pelo sub após verificação. Contas com e-mail coincidente nunca mescladas automaticamente. Cookies/CSRF e rotatividade protegidos. E-mails transacionais monitorados e traduzidos em pt-BR/en.

## 4. Personagem, catálogo e perfil

| Rota | Método | Campos fundamentais / efeito |
|---|---|---|
| /character/catalog | GET | opções livres, opções bloqueadas, requisito, rig_version, animation_version, locale_key e compatibilidade |
| /me/character | GET | aparência canônica, appearance_version, slots equipados, fallback IDs |
| /me/character | PATCH | patch allowlist de slots, expected_appearance_version; 409 se concorrente |
| /cosmetics/catalog | GET | efeitos, trajes, head accessories, disponibilidade e critérios de desbloqueio |
| /me/cosmetics | GET | posse/equipado/pendente, datas de aquisição |
| /me/emblems | GET | emblemas semanais por week_id e chefes; maior tier equipável |
| /me/emblems/equip | PATCH | emblem_instance_id ou null; exige posse |
| /players/{id}/public | GET | nickname, avatar metadata segura, score público, títulos e conquistas selecionadas |
| /me/preferences | PATCH | locale pt-BR/en, redução de efeitos, configuração de controles, preferências de áudio/qualidade |

**Regra confirmada v0.16:** cabelos, estilos faciais, tons de pele, cores e combinações de aparência **básicas** ficam **livres desde a criação do personagem**, com variedade real; trajes raros, acessórios especiais, visuais especiais de katana e efeitos são desbloqueados por jogo verificado. Um traje padrão, acessórios neutros e katana comum disponíveis imediatamente. Criador completo (não apenas troca de traje) obrigatório no lançamento. Não bloquear escolhas de aparência fundamental por ranking/conta, não fazer venda de tons de pele/rostos, e não conceder vantagem via peças especiais.

Atributos de perfil persistidos por IDs de catálogo versionados, e nunca por upload de foto. O servidor valida compatibilidade e posse; o cliente oferece preview de peças bloqueadas, sem poder equipá-las.

## 5. Partidas, replay e pontuação — contratos API

### 5.1 Criar run

POST /runs/start
- Request: mode = FULL | REGIONAL; region_id? (REGIONAL apenas); locale e equipamento **não afetam regras** e não precisam ser declarados como atributos competitivos.
- Server auth pelo cookie; consulta regiões desbloqueadas; gera run_id, player_id, seed, rules_version, generator_version, start_tick=0, started_at UTC e event limits; estado CREATED/ACTIVE.
- Response: run_id, seed pública se necessária ao gerador local, rules_version, generator_version, starting_region, mode, expiry/limites, replay_protocol_version e server_time. Não aceitar seed escolhida pelo navegador em ranqueada.
- Criar run não gera score; rate limiting por jogador/sessão e limites de runs ativas.

### 5.2 Finalizar run

POST /runs/{run_id}/finish
- Request: replay_protocol_version, compact_input_events[{tick,action,value?}], total_ticks, client_hash opcional diagnóstico, client_summary somente para UX. Limites de tamanho, duração máxima/fragmentação de transferência por política de recursos.
- Server: verificar posse do run_id e estado ACTIVE, limites, versão, esquema, tick ascendente/sem duplicidade impossível, integridade da sequência; arquivar replay com identificador e marcar PENDING_VERIFICATION; retornar 202 com verification_id e status. **Não confiar em distância, vida, score, kills ou boss_defeated do cliente**.
- Proibir envio de vidas/bonus por meio de chamadas que alteram score. Reenvio do mesmo run_id e payload recebe mesma resposta; payload divergente após aceite gera 409 e auditoria.
- GET /runs/{run_id}: somente dono/admin; status CREATED/ACTIVE/PENDING/VERIFIED/REJECTED/EXPIRED, resumo validado quando pronto, erro genérico quando rejeitado.
- Se navegador sair/rede cair durante run: permitir envio após reconectar **dentro de janela de retry limitada** se replay preservado e run ainda válida; não publicar score sem validação. Sem comprovação suficiente, marcar unranked/expired e explicar ao usuário.
- Finalização por morte normal ou abandono explícito: regras de atribuição de progresso para corridas abortadas serão fixadas antes do código, com preferência por nunca premiar eventos não verificados.

### 5.3 Consultas

- GET /leaderboards/global?period=all_time | weekly (somente FULL começando do marco zero).
- GET /leaderboards/regions/{region_id}?period=all_time | weekly (somente REGIONAL daquela região; modo coerente).
- GET /leaderboards/me?mode=... retorna posição e melhor run verificada do jogador, mesmo se fora da primeira página.
- GET /me/progress, /me/missions, /me/achievements, /me/regions.
- GET /weekly/current, /weekly/me, /weekly/archive, /weekly/{week_id}/me.
- Status PENDING não entra em rankings nem concede recompensas; VERIFIED entra via atualização idempotente.

## 6. Modelo relacional — chaves, índices e proteção

**Autenticação:** players(id, created_at, status), auth_identities(id, player_id, provider, external_subject, email_verified?), password_credentials(player_id, password_hash, updated_at), verification_tokens(token_digest, player_id, purpose, expires_at, used_at), sessions(id, player_id, verifier_digest, expires_at, revoked_at, last_seen_at), nicknames(normalized_handle UNIQUE). Restrição UNIQUE(provider, external_subject) quando aplicável. Nunca usar e-mail público como identificador principal.

**Visual:** player_character_profiles(player_id PK, skin_tone_id, hair_style_id, hair_color_id, eye_style_id, face_detail_id, outfit_id, head_accessory_id, katana_visual_id, slash_effect_id, emblem_id, appearance_version); catalog_visual_parts(id, slot, version, is_basic_free, enabled, rig_version), player_cosmetic_unlocks UNIQUE(player_id, part_id).

**Competição:** rules_versions(id, physics_manifest_hash, generator_manifest_hash, scoring_manifest_hash, active), runs(id PK, player_id FK, mode, start_region, started_at, submitted_at, status, seed, rules_version FK, replay_version, verified_score?, verified_distance?, verified_ticks?, verified_at?), replay_blobs(run_id UNIQUE, content_ref, content_hash, size_bytes), run_verification_jobs(run_id UNIQUE, state, attempts, next_attempt_at, last_error_code), run_boss_events UNIQUE(run_id, cycle, region, boss_id).

**Progressão:** player_career_stats(player_id PK, verified_distance, verified_perfects, verified_kills,...), player_region_unlocks UNIQUE(player_id, region_id), player_achievements UNIQUE(player_id, achievement_id), player_mission_progress UNIQUE(player_id, mission_id), player_boss_seals UNIQUE(player_id, boss_id), player_rewards UNIQUE(player_id, reward_id, source_id), processed_run_events UNIQUE(run_id, effect_type, effect_id) para idempotência.

**Semana:** weekly_challenge_templates(version), weekly_editions UNIQUE(week_id), weekly_edition_challenges UNIQUE(edition_id,slot), player_weekly_progress UNIQUE(player_id, edition_id, challenge_id), weekly_run_applications UNIQUE(run_id, edition_id, challenge_id), player_weekly_rewards UNIQUE(player_id, edition_id, tier) com BRONZE 2/5, SILVER 4/5 e GOLD 5/5.

**Rankings:** consultas/projeções indexadas por mode, region_id, period_id, score DESC, distance DESC, elapsed_ticks ASC, verified_at e run_id. Uma única melhor marca verificável por jogador por quadro, com concorrência e desempate estáveis. Não salvar em ranking global um resultado REGIONAL ou RUN REJECTED.

**Notas de modelagem:** confirmar enumerações SQL versus tabelas de referência, escopo de CYCLE por evento, serialização de desempate, estratégia de agregação (views/materialized/counters), armazenamento de blobs/replays em filesystem local com backup ou PostgreSQL conforme benchmarks; definir TTL, compressão e política de privacidade antes do deploy. IDs e chaves normalizadas. Backups obrigatórios e restauração testada.

## 7. Transações e fluxo de publicação

Run VERIFIED -> **transação** registra resultado verificado e score -> aplica eventos autoritativos à carreira e regiões -> atualiza selos de chefes e Traço da Aurora -> aplica progresso de missões e desafios semanais -> emite selos Bronze/Prata/Ouro da semana conforme 2/4/5, cada tier no máximo uma vez -> atualiza projeção de ranking -> commit -> notificações eventuais por outbox idempotente.

Se qualquer etapa falhar, retry idempotente não soma novamente distância nem duplica cosméticos ou selos. Jobs operam com lease, transação e restrição única; uma falha parcial nunca deixa score confirmado sem progresso correspondente por tempo indefinido (reconciliação).

## 8. Retenção, privacidade e operação

- Perfis públicos só recebem dados permitidos. E-mail, provas de vinculação, tokens, IPs, replays privados e ids de sessão jamais vazam via endpoint público.
- Registrar consentimentos relevantes, políticas de privacidade e fluxo de exportar/excluir dados conforme LGPD e integridade antifraude; preservar dados mínimos e prever anonimização/remoção de aparições públicas.
- Definir retenção de replay (original + summary + auditoria) após consulta jurídica/operacional; não alegar que replays devem ser retidos eternamente.
- Backup cifrado, verificação de restauração, restrição de acesso DB e de credenciais no servidor. Não guardar segredo no GitHub.
- Consumir recursos da VPS de forma previsível: fila durável, limite de workers, timeout, quotas por sessão, compressão e métricas de capacidade.

## 9. Entregáveis exigidos antes de implementar

1. Definir contratos OpenAPI 3.1 para todos os endpoints, com casos de autorização, erro, DTO e limites; gerar testes de contrato.
2. ERD definitivo com DDL de migration revisada, índices, constraints, rollback/migração e política de anonimização.
3. Política de replay, relógios, run expiration, metas de carga e retenção homologadas; ver [Segurança v0.16](./RONIN_RUNNER_SEGURANCA_PARTIDAS.md).
4. Nomear proprietário da decisão de cada campo/tabela; API e worker não duplicam cálculo de score.
5. Mapear requisitos em IDs de teste e casos E2E e congelar o baseline de rules_version antes dos benchmarks finais.
6. Ver [Plano de lançamento e testes v0.16](./RONIN_RUNNER_TESTES_LANCAMENTO.md).

## 10. Referências externas de boas práticas

- OWASP API Security Top 10: https://owasp.org/API-Security/
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- Google Identity token verification: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

**Princípio:** API v1 e schema são contratados para a versão completa desde o começo. Propostas numéricas permanecem ajustáveis por rules_version e testes; implementar não foi autorizado neste estágio.
