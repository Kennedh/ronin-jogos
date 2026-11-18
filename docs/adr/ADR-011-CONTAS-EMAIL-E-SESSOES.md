# ADR011 — Conta por e-mail, comprovação e sessões

Autorização de 18/11/2026: “Iniciar 5A”. Branch `feat/runner-email-5a`, sobre `2cd2c79`/PR #8 (parte 4, aberto). Escopo: cadastro, confirmação, entrada, recuperação de senha, reautenticação e gestão de sessões, com e-mail local privado de teste e interface PT-BR/EN. Sem SMTP externo, OAuth, merge, deploy, VPS ou DNS. O produto público completo continua obrigatório; 5A é uma entrega integrada de desenvolvimento.

## Identidade e comprovação

O `player_id` interno permanece imutável. Cadastro cria um candidato em `email_registrations`, não uma credencial ativa. Só o POST de confirmação com token e sessão do visitante que iniciou o cadastro transfere o hash para `password_credentials`, cria `email_accounts`, muda status para REGISTERED e rotaciona/revoga sessões. Progresso, runs, selos e Aurora conservam seu dono. GET do link nunca confirma nada.

Pendências de e-mail não são únicas entre visitantes: revelar conflito antes da prova permitiria enumerar contas pelo status do próprio visitante. Cadastro e recuperação respondem 202 genericamente; apenas a identidade que comprova posse recebe conflito se o e-mail já está vinculado. A unicidade definitiva está em `email_accounts.email`, com serialização por endereço e transação. Nunca unir pelo e-mail. E-mail é normalizado ASCII/lowercase; não aplicar regras particulares de pontos/aliases do Gmail. Expansão para endereços internacionais exige contrato explícito posterior.

Confirmação: 32 bytes aleatórios, SHA-256 no banco, propósito/contexto/request_id, uso único e 24h. Reenvio com cooldown global de 60s por HMAC do endereço; invalida token anterior ao emitir outro e permite renovar pendência expirada. Reset: token independente de 30min, uso único, senha nova e revogação de todas as sessões/tokens na mesma transação, sem login automático. Tokens de propósitos distintos não são intercambiáveis.

Links carregam token no fragmento, removido imediatamente para memória pelo shell, inclusive na navegação que só muda o fragmento da mesma aba. Sem localStorage de senha/token/progresso. O usuário confirma explicitamente. Uma aba de navegador diferente não pode ativar cadastro iniciado por outra identidade, evitando pré-cadastro com senha controlada por terceiro. Recuperação de senha, por sua natureza, depende da posse do token de reset.

Login troca identidade somente após senha válida. Se o visitante atual tem runs e a conta é outra, rejeita com GUEST_PROGRESS_REQUIRES_LINK; nenhum progresso é descartado ou mesclado. Vinculação/merge, Google, troca/desconexão de provedores e privacidade completa são 5B. Logout explícito da conta não apaga o perfil; visitante com progresso não recebe botão para descartá-lo silenciosamente.

## Senhas, sessões e limites

Hash nativo assíncrono Argon2id no Node 24.14.0 fixado: 19456 KiB, duas passagens, paralelismo 1, salt aleatório de 16 bytes e digest de 32. Algoritmo versionado `argon2id-19m-t2-p1-v1`; nenhuma dependência criptográfica nova. A API nativa é release candidate no Node usado; o adaptador e os testes Windows/Linux são obrigatórios ao atualizar runtime. Benchmark sequencial sintético local (Windows/Node 24.14.0, 12 amostras): mediana 42,59ms/p95 49,65ms, sem medir saturação. O custo segue a referência OWASP, mas NÃO é uma calibração da VPS: benchmark de produção continua pendente e requer autorização.

Senhas de 12–256 codepoints/até 1024 bytes UTF-8, preservando espaços/Unicode; sem exigência arbitrária de símbolo/maiúscula. Pequena lista própria de senhas triviais, sem afirmar cobertura de vazamentos. Um corpus licenciado e mecanismo de atualização permanecem pendentes para a homologação pública. Dois hashes ativos e fila de 16 por processo; excesso retorna 503. Usuário ausente executa hash dummy. Login/forgot/register têm piso de resposta de 100ms como mitigação, sem prometer tempo constante completo do serviço.

Cookies opacos HttpOnly/Secure/SameSite=Lax/host-only continuam; 90 dias renováveis para visitante/pendência, 30 para registrado. Reautenticação de até 10 minutos para listar/revogar sessões. Lista só contém IDs opacos, datas e indicação de sessão atual; sem IP, user-agent ou segredo. Máximo 20 sessões ativas preserva explicitamente a nova, mesmo com timestamps empatados. `last_seen_at` é atualizado no máximo uma vez por minuto.

Mutações autenticadas exigem Origin e CSRF. Login, forgot, reset e limpeza de cookie vencido exigem Origin exata, application/json e X-Ronin-Auth: 1, sem CORS; logout com cookie válido exige CSRF também. DTOs estritos e corpos limitados a 8 KiB. Rate limits de autenticação: IP 30/min, jogador 20/min, login por HMAC de e-mail 10/min, envio 60s; limites de jogo anteriores preservados. Não logar credenciais, tokens, corpos de conta nem destinatários.

Bloqueios por jogador, ordenados ao trocar identidades, e revalidação de credenciais/sessão dentro da transação evitam aceitar provas antigas após reset/revogação. `runs.start` também revalida a sessão após adquirir o bloqueio do jogador. Nenhuma regra física, hash de replay, hitbox ou pontuação mudou.

## Transporte local e persistência

Migration 005 adiciona contas verificadas, candidatos de cadastro, reservas de nickname, tokens, metadados de sessão, cooldowns, auditoria mínima e outbox. Migrations 001–004 permanecem intactas. Reservas aplicam NFKC/limites/caracteres/nome reservado e unicidade case-insensitive; não são ainda um sistema completo de moderação. Nickname não publica score automaticamente. Moderação, troca de nome, retenção/expurgo e exportação/exclusão continuam gates posteriores.

Cadastro/reset/reenvio gravam token + outbox na mesma transação. Payload de entrega usa AES-256-GCM, nonce aleatório, AAD por UUID; chave fora do banco e do Git. Outbox usa claim/lease de 30s, generation de fencing, até 8 tentativas e backoff. Transporte deve ser idempotente pelo UUID; após crash/retry não duplica a entrega local. Criptografia da outbox não substitui criptografia/controle de acesso de todo o banco.

`npm run dev:mail` consome com transporte local, salvando mensagens em `artifacts/dev-auth/inbox`; `-- --once` executa uma tentativa. Chave em `artifacts/dev-auth/mail.key`, gerada uma vez e nunca substituída silenciosamente. Diretórios privados: ACL usuário/SYSTEM no Windows e 0700/arquivos 0600 no POSIX. Pasta ignorada e fora do dist, sem inbox HTTP. Em desenvolvimento as mensagens entregues contêm o link, acessível somente ao operador local. Não anexar esses arquivos a PR/log. A perda da chave impede descriptografar mensagens pendentes.

SMTP, entregabilidade/SPF/DKIM/DMARC, quotas globais, recuperação operacional de FAILED, rotação de chave e expurgo precisam de homologação própria antes da publicação. O runner de desenvolvimento não se conecta à VPS. API sem chave configurada continua servindo jogo/visitantes e responde 503 nos fluxos de conta; não simula confirmação.

## Interface e validação

Conta acessível em `/account/pt-br` e `/account/en`, ligada ao hub/jogo, sem exigir login para jogar. Formulários acessíveis, autocomplete de gerenciador de senhas, mensagens/localização de e-mails e limpeza dos campos de senha inclusive em falhas. Controles começam desativados no HTML e aguardam o bootstrap da sessão; fallback nativo usa POST, evitando senha em query string. A regressão reproduziu disputa de criação de visitante quando o formulário era liberado antes da sessão, corrigida e coberta por interceptação de rede atrasada. Tokens só em memória; meta noindex/nofollow na tela de conta. CSS restrito à conta e ajuste de wrap do cabeçalho móvel; paleta do papel preservada.

`tests/accounts.test.ts` usa Postgres, API e verificador reais: visitante ganha Aurora antes do cadastro; prova preserva identidade/progresso; tokens, expiração/reenvio, disputa de confirmação, colisão de conta, antienumeração, CSRF/Origin, reset, reauth, IDOR, revogação, cap de sessões, cooldown, rate limit e rollback de outbox. Transporte local tem teste de entrega idempotente/privada. Browser testa os fluxos completos PT desktop/EN retrato móvel, link na mesma aba, navegador incorreto, e-mail efetivamente entregue, screenshot/paleta/overflow/CSP, reset/relogin e corrida verificada com a mesma conta. Regressão anterior de chefes/controles/rede/replay permanece no gate completo.

Gate: `npm ci` e `npm run verify`, Chromium/Postgres reais, sem skips. Ver PROGRESS e evidência privada da 5A para números e CI do commit final. Hashes do dist exercitado ficam fora do Git; não reconstruir após o gate para chamar outro artefato de testado. Testes reduzem regressões, não provam todos os navegadores, proteção contra bots ou capacidade pública. Nenhuma publicação nesta parte.

## Referências primárias

- [Node 24.14.0, crypto.argon2](https://nodejs.org/download/release/v24.14.0/docs/api/crypto.html#cryptoargon2algorithm-parameters-callback)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
