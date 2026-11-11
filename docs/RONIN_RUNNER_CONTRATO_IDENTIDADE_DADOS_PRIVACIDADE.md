# Ronin Runner — Contrato de identidade, dados, privacidade e API (v0.18)

**Finalidade:** fechar G04, G05 e G13. Documento de design, não código.  
**Precedência:** escolhas explícitas de produto no spec geral > este baseline técnico. As decisões de autenticação e retenção abaixo precisam ser verificadas contra legislação/políticas antes de produção.

## 1. Ronin ID e fluxos de conta

**Produto confirmado:** visitante com apelido; conta com e-mail e senha; Google; cadastro e vinculação no lançamento; todos participam do ranking nas modalidades corretas.

**Ponto único de identidade:** `player_id` UUID/ID opaco interno imutável. `auth_identities` contém prova Google `(provider='google',subject=sub)`, `password_credentials` contém senha local hash, e `sessions` guarda sessões. Nickname, endereço de e-mail e avatar **não são chaves de identidade**.

### 1.1 Visitante

- `POST /auth/guest` só cria perfil se cookie de sessão válido não existir. Gera `player_id`, sessão host-only e personagem padrão; e-mail e Google não obrigatórios.
- Jogar primeiro sem obrigar apelido; solicitação de nickname antes da primeira publicação pública de ranking. O jogador pode seguir em corrida enquanto nickname pendente, mas score não fica público até o nome ser aprovado.
- Nickname: 3–20 caracteres exibidos, trim Unicode NFKC, comparado case-insensitive, permitidos letras/números/espaço/hífen/underscore sob filtro; impedir nomes enganosos/reservados, PII óbvia e ofensas, escape em toda UI. Troca de apelido **a cada 30 dias** como baseline, salvo moderação/erro do sistema.
- Sessão guest: duração de referência **90 dias com renovação por atividade**; avisar que perda de cookie/armazenamento antes de vincular conta pode tornar progresso inacessível. Não prometer recuperar visitante por apelido.

### 1.2 E-mail/senha

- Cadastro aceita e-mail, senha e apelido válido se ainda não definido. Senha baseline mínimo **12 caracteres**, máximo >=128, permitir gerenciadores de senha, frases e Unicode; validar contra senhas conhecidas comprometidas quando houver mecanismo licenciado/viável, sem transmissão insegura.
- Senhas com Argon2id/salt exclusivo e custo calibrado por benchmark da VPS e recomendações atuais; nunca armazenar ou logar senha. Evitar requisitos arbitrários de símbolo/maiúscula.
- Status `EMAIL_PENDING` após registro, `VERIFIED` após token aleatório de uso único validado. Link de confirmação baseline **24h** de expiração, reenvio com cooldown **60s** e rate limit. Nunca confiar no clique para autenticar sessão sem revalidar contexto.
- Recurso `Esqueci a senha` com resposta anti-enumeração e token único baseline **30min** de validade; invalidar outros tokens e rotacionar sessões após reset. Enviar e-mails localizados PT-BR/EN.
- E-mail transacional via SMTP autenticado e confiável, SPF/DKIM/DMARC; credenciais ficam fora do repo. Se provedor gratuito/nativo de envio não garantir entregabilidade, decidir transporte de produção antes do deploy (dependência operacional real).
- Alteração de e-mail exige reautenticação recente e comprovação do novo e-mail, notificando endereço antigo quando apropriado.

### 1.3 Google

- Utilizar Google Identity Services, validar ID token server-side (assinatura e `aud`, `iss`, `exp`, `sub`) e mecanismos CSRF do fluxo de login.
- A chave de identidade é `google:sub`. Endereço de e-mail do Google pode ajudar na exibição/contato, **não** prova fusão com conta local já existente.
- Vincular e-mail/senha ou Google a `player_id` existente após prova de posse; desconectar método exige reautenticação e preservar outro meio válido de acesso.

### 1.4 Sessões e fusão

- Cookie de sessão opaco, `HttpOnly; Secure; SameSite=Lax`, **host-only** no domínio do portal, com rotação ao login/vínculo e proteção CSRF/origin nas mutações. Para autenticação que exija cross-site form ou popup, adaptar SameSite e fluxo de CSRF explicitamente, não remover proteção.
- Conta registrada: baseline **30 dias de sessão lembrada** por dispositivo, renovação por atividade em limites; ações críticas pedem autenticação recente em até **10 minutos** e podem revogar outras sessões. Servidor mostra lista de sessões recentes e botão encerrar.
- `POST /auth/merge/preview`: exige prova de acesso ao visitante atual E à conta destino; exibe resumo de progresso e ação que ocorrerá, sem alterar banco.
- `POST /auth/merge/confirm`: operação com `merge_id` idempotente e transação que migra **runs distintas por ID**, união de conquistas, progresso semanal por evento, selos e trajes, recorde como máximo válido; não somar contadores agregados duas vezes. Exibir conflito de aparência e preservar visual da conta de destino até escolha explícita.
- Após sucesso, revogar sessões de origem visitante migrado e emitir sessão nova no perfil destino; guardar auditoria sem senhas ou tokens. Em falha, perfis continuam recuperáveis e não apagar guest antes do commit.
- Se e-mail já pertence a outra conta e usuário não prova posse, **NÃO MESCLAR**; oferecer troca de método, login existente ou suporte sem exposição da existência da conta.

## 2. Política de privacidade e apresentação pública

- Público: nickname aprovado, avatar sintético de catálogo, título/emblema equipado, pontuação/ranking verificados e conquistas que o usuário optou por exibir.
- Privado: e-mail, provedores vinculados, tokens, sessões, IP, diagnósticos, detalhe de replays e identificadores antifraude.
- Configuração `public_profile=true/false`: se false, perfil detalhado não é aberto; **ranking exibe apelido genérico/oculto com score** conforme regra de competição explícita, evitando remoção arbitrária de marca válida.
- Exportação: `GET/POST /me/export` produz pacote controlado e temporário, protegido por reautenticação quando apropriado. Exclusão: `POST /me/delete-request` valida posse, explica repercussões em ranking e dados, cria workflow audível de anonimização/exclusão conforme legislação e retenção justificável.
- Em geral, dados de conta são mantidos enquanto conta existir; exclusão gera período de confirmação reversível **proposto 7 dias**, se permitido. A política final de retenção e bases legais deve ser revisada antes de publicar termos.
- Logs técnicos: baseline **30 dias**, sem conteúdo sensível. Replays compactos comuns **90 dias após validação**; top score/suspeitos podem ter retenção maior **até 12 meses** conforme proporcionalidade, privacidade e política divulgada. Preservar hash e sumário não sensível conforme necessidade auditável, sob restrições legais. Esses prazos são baseline para avaliação, **não parecer jurídico**.
- Moderação: motivo e data de ocultação de nickname, revisão de score, penalidade limitada, canal de contestação, nenhuma exposição de suspeita publicamente sem decisão.
- Backups cifrados e testados; dados anonimizados em ambientes de teste. Cumprir LGPD, termos de serviço e política de cookies/transparência.

## 3. Contratos de estado e regras transacionais

### 3.1 Estados

`Player`: GUEST → EMAIL_PENDING → REGISTERED_VERIFIED; GUEST → GOOGLE_LINKED; REGISTERED pode ter ambos métodos; ACCOUNT_DELETION_PENDING → ANONYMIZED/DELETED conforme política.

`Run`: CREATED → ACTIVE → PENDING → VERIFYING → VERIFIED/REJECTED; ACTIVE pode ir para ABANDONED/EXPIRED, sem prêmio competitivo não verificado. Worker reprocessa PENDING em caso de falha transitória.

`Achievement`: LOCKED → EARNED_VERIFIED, imutável salvo revogação auditada por fraude legítima. `WeeklyTier`: NONE → BRONZE após 2 → SILVER após 4 → GOLD após 5, guardando 3 registros e exibindo maior obtido.

`Character`: default e basic_free disponíveis para todos, especiais `LOCKED → UNLOCKED_VERIFIED → EQUIPPED`; equipar não faz unlock.

### 3.2 Tabelas e constraints mínimas

| Domínio | Tabelas / índices principais |
|---|---|
| Identidade | `players`, `auth_identities` UNIQUE(provider, sub), `password_credentials`, `sessions`, `nickname_reservations` UNIQUE(normalized_handle) |
| Segurança | `email_verification_tokens`, `password_reset_tokens`, `account_merge_transactions` UNIQUE(merge_id), `account_audit` |
| Regras | `rules_versions` UNIQUE(major,patch), `generation_manifests`, `score_manifests` |
| Partidas | `runs` PK, `run_segments` UNIQUE(run_id,index), `run_verification_jobs` UNIQUE(run_id), `run_outcomes` UNIQUE(run_id) |
| Ranking | `best_scores` UNIQUE(player_id, mode, region_id, period_id, rules_major), ordenação estável e FK para run VERIFIED |
| Carreira | `player_career_stats`, `player_regions`, `player_achievements` UNIQUE(player_id,ach_id), `player_boss_seals` UNIQUE(player_id,boss_id) |
| Cosméticos | `cosmetic_catalog`, `cosmetic_unlocks` UNIQUE(player_id,part_id), `player_character_profiles` UNIQUE(player_id), `player_emblems` |
| Semanas | `weekly_editions` UNIQUE(week_id), `weekly_edition_challenges` UNIQUE(week_id,slot), `weekly_run_applies` UNIQUE(run_id,challenge_id), `weekly_tier_rewards` UNIQUE(player_id,week_id,tier) |
| Auditoria | `outbox_events` UNIQUE(event_key), `audit_events`, `moderation_cases`, `deletion_requests` |

**Transação verificada:** run VERIFIED e seu score → contadores por **event IDs** únicos → conquistas/selos (Traço da Aurora ao 4/4) → semanas Bronze/Prata/Ouro conforme metas → melhor recorde/ranking → outbox → commit. Retry após falha não concede nada duas vezes; se qualquer etapa falhar, rollback e reexecução segura.

**Migração:** migrations versionadas e revisadas; reversão de schema só quando compatível, e backup prévio para irreversíveis. Não editar tabelas de produção manualmente.

## 4. API OpenAPI — matriz final de contratos v1, a formalizar em YAML

> Não implementar endpoints antes de gerar e validar documento `openapi.yaml` e testes correspondentes. Os campos abaixo formam a base funcional proposta.

| Recurso | Verbo/URI | DTO mínimo | Resposta | Autorização |
|---|---|---|---|---|
| Sessão guest | POST /api/v1/auth/guest | {} | player_public, cookie | público com rate limit |
| Cadastro | POST /api/v1/auth/register | email,password,nickname? | verification_pending | guest logado ou nova |
| Login local | POST /api/v1/auth/login | email,password | profile, cookie | público com limite/CSRF |
| Google | POST /api/v1/auth/google | id_token,csrf_proof | profile, cookie | público com validação token |
| Confirmação | POST /api/v1/auth/verify-email | token | verified | token válido |
| Esqueci | POST /api/v1/auth/password/forgot | email | accepted genérico | público com limite |
| Reset | POST /api/v1/auth/password/reset | token,new_password | success | token válido |
| Link | POST /api/v1/auth/link | provider, proof | linked | sessão+reauth |
| Merge preview | POST /api/v1/auth/merge/preview | session proof | preview+merge_nonce | ambos perfis autenticados |
| Merge confirm | POST /api/v1/auth/merge/confirm | merge_nonce,confirm | canonical_player | prova dupla |
| Perfil | GET /api/v1/me | - | profile+progress summary | sessão |
| Aparência | GET/PATCH /api/v1/me/character | option_ids,appearance_version | canonical_character | sessão e posse |
| Catálogo | GET /api/v1/character/catalog | locale? | parts+unlock requirements | público |
| Início run | POST /api/v1/runs/start | mode,region_id? | run_id,seed,rule_versions | sessão/guest |
| Chunk replay | PUT /api/v1/runs/{id}/segments/{index} | event chunk metadata | ack index/hash | dono da run |
| Finalizar | POST /api/v1/runs/{id}/finish | final_index,final_hash,final_tick | PENDING verification_id | dono da run |
| Status | GET /api/v1/runs/{id} | - | status + verified outcome? | dono da run |
| Ranking | GET /api/v1/leaderboards/{kind} | region?,period?,cursor? | page+position+rules_major | público |
| Semana atual | GET /api/v1/weekly/current | - | edition/challenges, UTC deadline | público |
| Semana pessoal | GET /api/v1/weekly/me | - | progress+tiers | sessão |
| Inventário | GET /api/v1/me/cosmetics | - | unlocked+locked+equipped | sessão |
| Emblema | PATCH /api/v1/me/emblems/equip | emblem_instance_id? | equipped | posse e sessão |
| Contas | GET /api/v1/me/sessions | - | sanitized sessions | sessão/reauth |
| Privacidade | POST /api/v1/me/export; /me/delete-request | confirm+reauth | request status | sessão/reauth |

**JSON de contratos:** timestamps UTC ISO8601; campos `score` inteiros seguros ou strings decimais quando grandes; `distance_m` inteiro para exibição, precisão interna em unidades fixas; IDs opacos; resposta de erro com `error.code`, `message_key`, `request_id`. `PENDING` não implica score aceito. Paginação cursor e ordenação por score/distance/ticks.

**Notificar com `429`** limites de abuso, `409` atualização concorrente/idempotency conflict, `422` regra ou estado inválido, `202` replay aguardando worker, `503` degradação controlada. Respostas de recuperação de e-mail/credenciais não podem informar existência de conta.

## 5. Notas de verificação e referência

- Validar diretrizes recentes de OWASP para Password Storage, Session Management e API Security no momento da implementação; números de password são baseline, não substituem benchmark e threat modeling.
- Documentar CORS e CSRF para a origem escolhida no portal, sem wildcard de sessão.
- Mesmo login Google e e-mail de usuário legítimo precisam de fluxo de vínculo autenticado, não de associação automática.
- Histórico de scores antigo precisa preservar identidade/anonimização da conta com política clara sem afetar integridade da classificação.

**Ainda faltam artefatos mecânicos gerados após confirmar baseline**: OpenAPI YAML completo, diagramas ERD de migração e schemas versionados. Eles serão tarefas de especificação, não de programação, e não devem impedir revisão dos fluxos do usuário.
