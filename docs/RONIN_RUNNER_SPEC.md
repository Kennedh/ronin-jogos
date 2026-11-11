# Ronin Runner: Tinta e Aço — Especificação de Produto e Jogo

> **Detalhamento técnico do movimento, gestos e combate:** [Game Design v0.9](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md). PT-BR/EN obrigatórios em todas as telas. Valores físicos são parâmetros iniciais calibráveis; três vidas sem qualquer cura.
> **Catálogo completo e regras de geração:** [Inimigos, chefes e obstáculos v0.10](./RONIN_RUNNER_INIMIGOS_CHEFES_OBSTACULOS.md). Salto duplo padrão para todos; quatro chefes no escopo de lançamento.
> **Regras confirmadas de encontro, retirada e recompensas:** [Chefes e recompensas v0.11](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md). Chefes que não forem derrotados recuam e a corrida continua, sem punição pela retirada.
> **Missões, conquistas e progressão permanente:** [Game Design v0.12](./RONIN_RUNNER_PROGRESSAO_MISSOES.md). **Traço da Aurora confirmado** como efeito permanente de katana pela coleção completa dos quatro selos. Catálogos e metas adicionais são propostas sujeitas a revisão.
> **Desafios semanais autogerados na versão completa:** [Game Design v0.13–v0.14](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md). Publicação e validação automáticas, sem curadoria manual toda semana, mesmos desafios para visitantes e contas vinculadas. **Recompensas confirmadas:** selos Bronze (2/5), Prata (4/5) e Ouro (5/5).
> **Interface, criador visual e Ronin ID:** [Game Design v0.14](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md). Define telas, fluxos de visitante/e-mail/Google, customização modular proposta, recuperação, mesclagem segura e testes E2E.

Versão: 0.14 — consolidada até game design v0.14 (planejamento pré-implementação)  
Status: **escopo funcional completo definido; parâmetros de balanceamento e decisões de UX sujeitos a playtest**  
Repositório: `Kennedh/ronin-jogos`  
Ecossistema futuro: `play.ronin.dev.br`

> Documento consolidado das decisões do projeto. Não autoriza começar a programar: o objetivo atual é detalhar, revisar e testar conceitualmente o design. A arquitetura deve mirar a versão completa desde a primeira implementação, sem substituir sistemas provisórios posteriormente.

## 1. Visão e pilares

**Nome proposto:** Ronin Runner: Tinta e Aço (EN: Ink & Steel).  
**Gênero:** endless runner 2D lateral com combate de precisão e tempo de reação.  
**Público:** jogadores casuais e competitivos em navegadores desktop e mobile.  
**Identidade visual:** pintura japonesa original, inspirada na linguagem estética de Ōkami (sumi-e, aquarela, ukiyo-e, papel washi), sem copiar sprites, personagens, trilhas, texturas ou outros materiais protegidos.  
**Direção emocional:** cenários inicialmente vivos e luminosos, gradualmente corrompidos por tinta sombria; ritmo alterna tensão e respiro.  
**Pilares de produto:** jogar imediatamente, baixa fricção, desempenho, competição justa, progressão persistente, acessibilidade e controle de custos da VPS.

Premissa narrativa proposta: um ronin sem mestre atravessa territórios onde a "Tinta Vazia" corrompe a natureza e guerreiros. Sua katana dissipa a corrupção. Narrativa transmitida principalmente por cenário, transições e efeitos, sem interromper as corridas.

## 2. Escopo da primeira versão pública — COMPLETO

Não desenvolver um mini-MVP descartável. O lançamento público deve incluir:
1. Jornada contínua nas quatro regiões e ciclos infinitos com corrupção progressiva.
2. Combate de precisão, obstáculos gerados de forma validável, sistema de três vidas e abismos fatais.
3. Visual 2D em pintura japonesa, dois ou mais estados artísticos (vivo/corrompido) por região, animações, som, HUD e telas.
4. Controle por teclado e gestos touch, layout mobile horizontal, tela cheia quando possível e alternativa compatível.
5. Distância, pontuação, concentração, missões permanentes, **desafios semanais autogerados**, conquistas, três trajes iniciais e pontos de partida regionais desbloqueáveis.
6. Ronin ID: visitante persistente com apelido, criação de conta por e-mail e senha, login Google, vinculação e recuperação de conta.
7. Persistência no backend, ranking mundial all-time e semanal, rankings regionais e validação antifraude.
8. Internacionalização PT-BR/EN, políticas básicas de privacidade, acessibilidade e fluxos de erro/reconexão.
9. Instrumentação, testes automatizados, testes de performance mobile e observabilidade do backend.

**Estratégia de implementação:** desenvolvimento incremental de fatias verticais na **arquitetura final**. Nenhum protótipo simplificado substitui sistemas definitivos. Testes começam cedo com contratos e modelos finais e são repetidos em regressão, integração e end-to-end. Testes iniciais por si só NÃO bastam para afirmar a versão completa validada.

## 3. Stack e limites

- Jogo: Phaser 4 + TypeScript + Vite.
- API: Node.js + Fastify + TypeScript.
- Persistência: PostgreSQL; migrations versionadas, transações, índices, backups e restauração testada.
- Comunicação: HTTPS; API JSON; sem comunicação em tempo real por frame com o servidor.
- Cliente: renderização, áudio, entrada e simulação local de alto desempenho.
- Servidor: usuários, sessões, identidades, progressão confiável, início/finalização de partidas, rankings e verificação de resultados.
- Componentização clara para compartilhar Ronin ID e serviços de ranking com futuros jogos do Ronin Play.
- Licenciamento permissivo preferido; inventário de dependências e licenças de assets.
- Infraestrutura Caddy/VPS/deploy tratada por skill existente no Codex; esta especificação não define mudanças infra sem necessidade.

## 4. Mecânicas de uma partida

- Corrida lateral automática contínua; jogador controla salto, deslize e katana.
- **Salto duplo disponível a todos desde a primeira partida**, sem desbloqueios por missão, traje, conta ou distância. Permitido um salto adicional antes do pouso em chão seguro, com comandos iguais nas regras competitivas.
- Ataque comum derrota inimigos básicos quando em alcance; **corte perfeito** premia timing preciso.
- Ataque fora do alcance não causa acerto e gera breve recuperação, impedindo spam.
- Sequências de cortes perfeitos aumentam combo e concentração; errar zera combo, mas não toda a concentração.
- Concentração completa habilita golpe especial com gatilho simples, sem exigir controles complexos no mobile.
- Pontuação provisória: `P = 10 × distância_m + 30 × inimigos_derrotados + 100 × cortes_perfeitos`. Revisar após simulações e testes, sem favorecer exploração de inimigos fáceis.
- Pausa e reinício rápidos; HUD mostra vidas, distância, pontos, concentração, pausa e indicadores opcionais de missão.

### 4.1 Regras de sobrevivência DEFINITIVAS
- **EXATAMENTE três vidas no início de cada partida**, inclusive expedições regionais.
- Colisões não fatais e ataques inimigos retiram um ponto de vida.
- Ao chegar a zero vidas, a partida termina.
- **Cair em abismo termina imediatamente a partida, mesmo com três vidas disponíveis.**
- Breve invulnerabilidade após dano comum para impedir hits múltiplos injustos (duração a balancear).
- **NENHUMA cura, regeneração ou restauração de vida em momento algum da partida:** não haverá santuários de cura, consumíveis, drops, recompensas por missões, bônus por ciclo ou recuperação automática na transição de região.
- Trajes puramente cosméticos: sem melhorias de vida, velocidade, dano, alcance, invulnerabilidade ou habilidade.
- Persistência de vidas entre regiões e ciclos dentro da mesma partida; nenhuma recarga ao mudar de ambiente.

## 5. Mundo contínuo e ciclos de corrupção

Quatro regiões em sequência, com streaming de assets e transições suaves:
1. **Floresta de Bambu:** 0–1.500 m. Saltos, galhos, troncos, soldados básicos. Verde/dourado → tinta e névoa corrompida.
2. **Templo Esquecido:** 1.500–3.500 m. Torii, lanternas, pilares, armadilhas e lanceiros. Tons quentes → sombras rubras.
3. **Montanhas Geladas:** 3.500–6.000 m. Neve, pinheiros, fissuras, vento e gelo. Azul-claro → tempestade escurecida.
4. **Castelo do Eclipse:** 6.000–8.000 m. Estruturas arruinadas, lâminas, plataformas e inimigos avançados. Vermelho/dourado → corrupção intensa.

As faixas acima são **valores iniciais para playtests**, não constantes irrevogáveis. Após 8 km, recomeça a Floresta em um novo ciclo, sem interromper a corrida nem zerar distância, pontuação, concentração ou vidas.

- Ciclo I: O Despertar, 0–8 km.
- Ciclo II: A Mancha, 8–16 km.
- Ciclo III: A Ruptura, 16–24 km.
- Ciclo IV em diante: O Eclipse Eterno, com dificuldade alta estabilizada e variação de padrões.
- O mundo torna-se mais sombrio por mudanças artísticas reais (paletas, props, partículas, shaders leves quando adequados), **não só um filtro**.
- Dificuldade cresce em padrões e inimigos, mas velocidade, densidade de eventos e janela de reação terão tetos para manter viabilidade.
- Trechos de respiro alternam com trechos intensos.
- Purificação após ações excepcionais pode restaurar temporariamente cores **somente como efeito cosmético**; não recupera vidas.

### 5.1 Pontos de partida desbloqueáveis
- Ao alcançar uma região pela primeira vez, jogador desbloqueia início naquela região em partidas futuras.
- **Jornada Completa:** começa obrigatoriamente do 0 m; apenas ela participa do ranking mundial e semanal principais.
- **Expedição Regional:** começa na entrada desbloqueada, com três vidas, regras iniciais padronizadas da região e ranking **separado por região**.
- Pontuação e distância da expedição contam **apenas o trecho efetivamente percorrido**; jamais atribuir metros anteriores.
- Distância realmente percorrida contribui para progresso acumulado do jogador.
- Define-se identidade única de regras/seed/versão para partidas competitivas comparáveis.

## 6. Dificuldade, obstáculos e geração procedural

Gerador determinístico por semente com catálogo de padrões versionados. Cada padrão registra região, ciclo mínimo, movimentos exigidos, duração, janela de reação, dificuldade, zonas de colisão e restrições de compatibilidade.

O diretor de dificuldade escolhe combinações validadas considerando:
- velocidade do mundo, deslocamento e estados do jogador;
- alcance/tempo de salto, salto duplo, deslize, ataque e recuperação;
- área de visão real em telas móveis;
- segurança do espaço de pouso após abismos;
- antecipação visual, telegráficos inimigos e transições entre padrões;
- limite de densidade e tempo de reação.

**Nunca** gerar obstáculos intrinsecamente impossíveis; testar automaticamente padrões e transições. Abismos fatais precisam ser anunciados com margem adicional. Valores propostos para aferição: aproximadamente ≥1s de antecipação de obstáculo simples e ≥1,5s para abismo, sujeitos a playtest. Não reduzir a janela de corte perfeito indefinidamente.

Tipos básicos: tronco (pular), galho (deslizar), abismo (pulo), Soldado Errante (corte), Lanceiro da Névoa (pulo e ataque). Futuramente/na versão completa: espíritos, projéteis e desafios específicos de templo, montanha e castelo. Todos os assets e comportamentos finais precisam estar prontos antes do lançamento público.

Velocidade aumenta inicialmente e chega a um teto; unidades físicas e conversão para metros devem ser definidas pelo modelo de simulação, não estimadas pelo FPS renderizado. Simulação com passo fixo e comportamento reprodutível em diferentes taxas de quadros.

## 7. Direção artística, som e UI

- Originalidade: arte própria/licenciada; inspiração em Ōkami não significa reprodução de materiais, personagens, mecânicas exclusivas ou identidade visual idêntica.
- Texturas: papel washi, sumi-e, contornos em nanquim, aquarelas e gravuras; profundidade por parallax.
- Protagonista: ronin ágil, katana, faixa vermelha reconhecível e roupas estilizadas.
- Leituras visuais obrigatórias: terreno seguro, abismo, inimigos e indicador de golpe possuem contraste adequado mesmo nos ciclos escuros.
- Animações: correr, pular, salto duplo, deslizar, ataque comum, corte perfeito, dano, morte e efeitos de traje.
- Corte perfeito: arco de nanquim e destaque vermelho breve, efeito sonoro característico; evitar flashes desconfortáveis.
- Tela inicial, seleção de traje, missões, seleção de região, jogar, pausa, resultado, ranking, perfil/conta, acessibilidade/configurações.
- Trilha original/licenciada, instrumentos japoneses como referência, variantes de clima vivo/corrompido e volume separado de música/efeitos.
- Conteúdo em português brasileiro e inglês desde o início, preparado para novas traduções.

## 7.1 Regra consolidada de chefes e recompensas (v0.11)

- **Confirmado:** cada região terá um chefe com encontro finito no fim de seu percurso. O chefe será derrotado ou **recuará**, e o ronin vivo prosseguirá sempre sem bloquear passagem. O jogador pode apenas se esquivar; a vitória é opcional e premia habilidade.
- **Confirmado:** o chefe que recua não aplica penalidade extra em vida, distância, score ou progressão. Ataques não evitados durante o encontro ainda causam 1 de dano conforme regras usuais.
- **Confirmado:** nenhuma vitória, derrota, transição ou prêmio de chefe recupera corações ou protege contra abismos. O salto duplo e os gestos continuam padrão, sem comandos novos.
- **Valores propostos para balanceamento:** Raiz Negra +300 pts, Guardião do Sino +450, Espírito da Nevasca +600, Senhor do Eclipse +900 por vitória verificada em instância legítima. Não contar morte de chefe como morte de inimigo comum; corte perfeito válido no boss conta uma vez na janela.
- **Recompensa CONFIRMADA:** cada primeira derrota de chefe válida concede seu selo permanente, registrado uma vez por Ronin ID. **Reunir os quatro selos concede o efeito cosmético de katana Traço da Aurora**, equipável independentemente do traje e sem alterar física, dano ou ranking. Os selos podem vir de partidas diferentes. A conquista de quatro chefes na mesma Jornada Completa concede um emblema separado.
- **Repetição:** cada chefe reaparece uma vez por região/ciclo em encontro versionado e verificável; pontos de vitória por instância, conquistas de primeira vitória não duplicadas. Expedições Regionais pontuam apenas em rankings de sua modalidade.
- **Segurança:** servidor reconstitui replay/seed e valida derrota, retirada, ticks, acertos e bônus; não confiar em `boss_defeated` reportado pelo cliente.
- **Detalhes de duração, janelas e recompensas:** [documento v0.11](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md). **Missões, recompensas e persistência:** [documento v0.12](./RONIN_RUNNER_PROGRESSAO_MISSOES.md).

## 8. Trajes e missões

Trajes de lançamento:
1. **Ronin Errante** — inicial, quimono desgastado, faixa vermelha.
2. **Sombra da Névoa** — 10 km de distância acumulada, azul-escuro, máscara e capa de névoa.
3. **Corte Silencioso** — 50 cortes perfeitos acumulados, roupas escuras e pinceladas brancas.

Todos cosméticos e com colisões idênticas. **Traço da Aurora** confirmado como efeito de katana por reunir os quatro selos, sem alterar qualquer estatística. Progressão por três caminhos independentes (O Caminho, A Lâmina e O Espírito), com missões de partida, carreira, região e conquistas de chefes. A coleção proposta para a versão completa inclui mais trajes e metas de 3–250 km acumulados, centenas de ações e feitos de uma corrida, sujeitos a balanceamento. Missões **não concedem pontos extras ao ranking**. Recompensas emitidas e deduplicadas pelo servidor após validação. Catálogo detalhado e casos de teste: [v0.12](./RONIN_RUNNER_PROGRESSAO_MISSOES.md).

## 8.1 Desafios semanais autônomos — CONFIRMADOS (v0.13)

- **Obrigatórios na primeira versão pública completa**: seleção, publicação, acompanhamento e encerramento automáticos **sem seleção manual de missões pelo proprietário a cada semana**.
- Diretor de Desafios determinístico escolhe modelos testados e versionados, metas e diversidade, valida completabilidade, limita repetições e possui fallback publicado por transação idempotente se cron falhar.
- Mesma edição global para todos os Ronin IDs: visitantes com apelido, contas e-mail/senha e Google; sem login diário obrigatório, sem moeda, loja, loot box, cura, buffs ou pontos de ranking por cumprir desafio.
- **RECOMPENSA CONFIRMADA:** três selos cosméticos semanais progressivos, **Bronze ao completar 2/5**, **Prata ao completar 4/5** e **Ouro ao completar 5/5** desafios verificados. Exibir o maior nível no perfil, registrar marcos por edição com idempotência e manter histórico. **Parâmetros ainda propostos:** distribuição 2 acessíveis, 2 intermediários, 1 avançado e semana ISO segunda 00:00 UTC; metas e tempos sujeitos a playtest.
- Persistência PostgreSQL, progresso incrementado por replays verificados e transações idempotentes; uso de assets de recompensa reutilizáveis para permitir muitos anos de edições sem demanda artística semanal.
- O desafio não pode exigir região desbloqueada em tier acessível nem contradizer três vidas sem cura, salto duplo inicial e chefes que podem recuar.
- **Detalhamento, dados, exemplos e casos de teste:** [v0.13–v0.14](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md); integração com o [Ronin ID e personagem v0.14](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md).

## 9. Mobile, fullscreen e controles

**Mobile em paisagem**, HUD adaptado à área segura (notches e barras do sistema). Sem botões de movimento durante a jogabilidade normal:
- toque curto: atacar;
- deslizar para cima: pular;
- repetir deslize para cima no ar: salto duplo obrigatório, disponível desde o início;
- deslizar para baixo: deslizar;
- botão discreto de pausa: pausar.

Interpretador de gestos distingue toque versus swipe por deslocamento, duração e estado do personagem; não emite ataque junto com swipe. Prevenir scroll e gestos inadvertidos somente na superfície do jogo, respeitando comportamento da página fora dela. Permitir alternativa de controles acessíveis nas configurações.

Ao clicar em Jogar: solicitar fullscreen e bloqueio de orientação quando o navegador suportar e permitir; se recusados, usar layout imersivo responsivo e orientação solicitada por overlay, sem assumir que Safari/iOS ofereça suporte equivalente. Nunca prometer fullscreen obrigatório. Pausar/reconciliar estado ao perder foco, trocar app, receber chamada, sair da tela cheia ou mudar orientação.

Desktop: espaço/↑ pular, ↓/S deslizar, J atacar; configurações para alterar teclas e áudio.

## 9.1 Interface completa e Criador de Ronin — proposta v0.14

- **Telas de lançamento:** carregamento, menu principal, escolha Jornada Completa/Expedição Regional, preparação mobile/gestos, corrida/HUD, pausa, resultados, ranking, Pergaminho (missões e semanas), Meu Ronin, criador de aparência/coleção, autenticação e segurança da conta, configurações e privacidade.
- **Jogar sem cadastro** continua obrigatório: criar/reusar sessão visitante, escolher apelido antes de exibir no ranking, recomendar vínculo de conta discretamente após marcos relevantes.
- **Criador visual proposto**, ainda sujeito à confirmação de abrangência: cabelo, cores, detalhes faciais e de pele, trajes, acessórios, aparência da katana e efeitos cosméticos, todos com corpo, hitboxes e comandos idênticos. Nada de uploads pessoais/IA para imagens de personagem no lançamento. Alterações apenas fora da corrida.
- Traço da Aurora pode equipar em qualquer traje, sem alterar alcance. Bronze/Prata/Ouro semanal são **emblemas de perfil independentes**, nível máximo exibido por edição, histórico preservado.
- Fluxos completos de **e-mail/senha** (verificação, recuperação, troca, sessão), **Google** (token verificado pelo servidor e associação via sub), **visitante** e **mesclagem autenticada** sem juntar contas só por e-mail ou apelido; replays e eventos deduplicados.
- Menus responsivos mobile/desktop, **orientação horizontal recomendada durante a corrida**, fullscreen quando permitido, fallback sem fullscreen; PT-BR/EN inclusive em emails, erros e informações legais.
- Política de erro: score e recompensas pendentes até validação, conexão interrompida, sessão expirada, e-mail atrasado, desconexão da API, reautenticação, contas duplicadas e tentativa de fusão.
- **Fluxos, modelo lógico, testes e decisões ainda abertas:** [documento v0.14](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md).

## 10. Ronin ID — identidade compartilhada entre jogos

**Três opções já no lançamento público:**
1. **Visitante** — joga imediatamente sem e-mail, recebe ID anônimo do servidor, apelido público e sessão persistente; participa do ranking mundial.
2. **Conta por e-mail e senha** — cadastro próprio, nome público/apelido, confirmação de e-mail, login, logout, recuperação e redefinição de senha e alteração segura de e-mail.
3. **Entrar com Google** — Google Identity Services; validar ID token no backend e associar o identificador estável `sub` à identidade interna. Nunca confiar em ID do navegador nem usar o endereço de e-mail isoladamente como prova de vínculo.

**Regras de conta e vinculação:**
- ID interno imutável do jogador separado dos provedores de autenticação.
- Apelido público único segundo política definida, mutável com limitação e moderação; nunca exibir e-mail no ranking.
- Sessões anônimas persistidas no servidor; visitante pode perder acesso se apagar cookies/perder dispositivo antes de vincular conta; apresentar aviso discreto para vinculação.
- Visitante → conta Google ou e-mail: após autenticação segura, reconciliar progresso, conquistas, recordes e desbloqueios transacionalmente, sem somar partidas duplicadas.
- Mesmo usuário pode vincular login Google e senha à mesma identidade com comprovação de posse e, quando necessário, reautenticação.
- Se o e-mail informado já existir em outra conta, **não mesclar automaticamente por e-mail**. Exigir fluxo autenticado de vinculação, evitando takeover.
- Conta e-mail: senhas armazenadas só como **hash Argon2id com salt exclusivo**, custos calibrados para a VPS; jamais armazenar ou registrar senha em claro.
- Verificação e redefinição: tokens criptograficamente aleatórios, de uso único, expiração curta, armazenados de forma segura; invalidar sessões/tokens quando relevante.
- Respostas genéricas para impedir descoberta de e-mails cadastrados; rate limits por IP, usuário e ação; proteção contra bots e abuso.
- Cookies de sessão `HttpOnly`, `Secure`, `SameSite`, com rotação, expiração e proteção CSRF quando aplicável. Não guardar senhas/tokens sensíveis em `localStorage`.
- Serviço de e-mail transacional requerido (verificação, reset, alertas); configurar transporte SMTP confiável e testar entregabilidade antes do lançamento. Não assumir que SMTP autoprovocado na VPS entregará mensagens de forma consistente.
- Recuperação de conta, logout de sessões, privacidade, exclusão e exportação de dados e gestão mínima conforme LGPD.
- Modelo de autenticação desenhado para reuso por futuros títulos Ronin Play.

## 11. Rankings, partidas e integridade competitiva

Rankings: (a) Jornada Completa all-time, (b) Jornada Completa semanal em UTC com período definido e (c) rankings por região. **Visitantes e contas vinculadas competem em todas as categorias elegíveis.**

- Apenas a melhor marca válida por jogador por ranking/período; desempate: maior distância real, depois menor tempo (podendo ajustar após testes).
- Pontuação calculada no **servidor**, jamais aceita como verdade quando enviada pelo cliente.
- Ao iniciar partida, servidor registra `run_id`, jogador, modo, região, seed, versão de regras e horário.
- Cliente executa jogo e envia eventos/log compacto e resultado para verificação.
- Verificador valida evolução temporal, movimentos possíveis, obstáculos, colisões, kills, golpes e distâncias de acordo com simulação determinística com passo fixo (ou abordagem equivalente rigorosa); resultados incompatíveis não entram no ranking.
- Projetar desde o início replay/reprodução de runs para testes e auditoria; evitar depender apenas de heurísticas frágeis.
- Transações/idempotência garantem que uma partida não seja premiada/contada duas vezes.
- Rate limits, detecção de padrão suspeito, logs técnicos sem dados sensíveis, bloqueio/moderação quando necessário.
- O servidor tem autoridade sobre saldos de progresso, desbloqueios, conquistas e rankings.
- Não presumir segurança perfeita no cliente; simulações e anti-cheat reduzem, mas não eliminam fraude.

## 12. Modelo lógico inicial (a detalhar)

Entidades previstas: `players`, `auth_identities`, `password_credentials`, `sessions`, `email_verification_tokens`, `password_reset_tokens`, `player_profiles`, `runs`, `run_events/replays`, `leaderboard_entries` (ou projeção materializada), `player_progress`, `regions_unlocked`, `cosmetics`, `player_cosmetics`, `missions`, `player_missions`, `achievement_definitions`, `player_achievements`, `game_rules_versions`, `audit_events`.

Definir chaves UUID/identificadores não adivinháveis, FKs, constraints únicas, índices por jogador, modo, região, período, pontuação e `run_id`. Históricos de partidas e regras/versionamento devem permitir auditar rankings mesmo após mudanças de balanceamento.

## 13. API por domínio (contrato a fechar antes do código)

- `/auth/guest`, `/auth/register`, `/auth/verify-email`, `/auth/login`, `/auth/google`, `/auth/logout`, `/auth/password/forgot`, `/auth/password/reset`, `/auth/link`.
- `/me`, `/me/profile`, `/me/progress`, `/me/cosmetics`, `/me/missions`, `/me/regions`, `/me/sessions`.
- `/runs/start`, `/runs/finish`, `/runs/{id}` (somente autorizado), e pontos de ingestão/verificação de eventos se necessários.
- `/leaderboards/global`, `/leaderboards/weekly`, `/leaderboards/regions/{region}`, `/leaderboards/me`.
- `/health`, e endpoints internos protegidos para operação/moderação.
Documentar OpenAPI, erros, autenticação, paginação, versões e limites antes da implementação.

## 14. Testes da arquitetura FINAL — obrigatórios desde a primeira etapa

**Princípio:** criar e manter testes do produto final enquanto as funcionalidades são construídas. Não criar um `localStorage` provisório para depois trocar por PostgreSQL em produção, nem simulação de ranking local para substituir por backend posteriormente.

Camadas:
1. **Unidade:** movimento de passo fixo, física, janelas de corte, colisão, gestos, pontuação, ciclos, unlocks, missões, parser e validação de eventos.
2. **Propriedades/procedural:** milhares de seeds; testar alcançabilidade de cada padrão e transição em diferentes velocidades, proporções de tela e latências de input; nenhum abismo surpresa e nenhuma sequência impossível.
3. **Integração:** contas, identidade visitante, e-mail/Google, verificação de token, fusão autenticada, sessões, progresso, classificação e transações PostgreSQL.
4. **Segurança:** rate limits, CSRF, sessão, brute force, reset, abuso de nickname, replay duplicado, adulteração de score e alteração de client.
5. **E2E desktop/mobile:** novo visitante → jogar → morrer → resultado → ranking → criar conta → login em outro dispositivo → recuperar progresso; login Google; perda/reconexão; fullscreen negado; orientação alterada; modo paisagem.
6. **Desempenho:** tempo de carregamento, FPS alvo de 60 em dispositivos compatíveis, adaptação de qualidade, uso de memória em partidas longas, estabilidade de backend sob carga e limites da VPS.
7. **Regressão:** testes desde início reproduzidos após cada feature, alteração de arte, mecânica, schema ou autenticação; testes finais com quatro regiões e múltiplos ciclos.
8. **Acessibilidade/UX:** alternativas aos gestos, opções de som/efeitos, HUD legível, contraste com corrupção, idiomas PT/EN.
9. **Dados:** migrações reversíveis quando apropriado, backup/restauração, consistência de rankings e privacidade/exclusão.

**Critérios de aceitação explícitos:**
- Nenhuma partida recupera vida; trocar região ou ciclo não recarrega corações; abismo sempre mata.
- Um visitante consegue publicar uma pontuação válida com apelido sem cadastro.
- Usuário cria conta por e-mail, confirma e-mail, entra, sai e redefine senha.
- Usuário entra com Google e mantém a mesma identidade quando adequadamente vinculada.
- Progresso/trajes/regiões/recordes permanecem após logout/login e em outro dispositivo para contas vinculadas.
- Jornada Completa e Expedição Regional não compartilham ranking injustamente.
- Resultados falsificados, duplicados ou não verificáveis não geram classificação.
- Mobile opera por gestos, tem fallback sem fullscreen e oferece retomada/pause coerentes.
- Quatro regiões, transições sem interrupção, ciclos infinitos e escalonamento de dificuldade funcionam em corridas longas.
- Todas as regras possuem evidências de teste antes de lançamento público.

## 15. Sequenciamento SEM protótipo descartável

Implementar sobre schema, autenticação, contratos, gerador determinístico e infraestrutura de teste planejados para produção desde a primeira linha:
A. Contratos, migrations, identidades e base do jogo; CI/testes.
B. Loop final e gesto/física/combate + validador de eventos por seed.
C. Quatro regiões, arte, transições, ciclos infinitos e testes de alcançabilidade.
D. Trajes, missões, conquistas e progresso persistido.
E. Ranking mundial, regional, semanal + verificação antifraude e operação.
F. Polimento, carga/performance, compatibilidade, idiomas, privacidade, segurança e lançamento.

O sequenciamento serve à validação incremental, **não** reduz escopo nem dispensa testes integrados completos.

## 16. Pontos ainda em aberto para discussão antes de programar

- Ajuste fino da janela de corte perfeito, velocidade, pulo, deslize, invulnerabilidade e balanceamento.
- Ajustes de balanceamento de combo/concentração e golpe especial; **salto duplo inicial já confirmado como regra definitiva**.
- Cadência/densidade e valores finais de inimigos e chefes; **os quatro chefes integram o escopo obrigatório da primeira versão pública**, conforme a especificação v0.10.
- Catálogo final de missões/efeitos/trajes e regras de desbloqueio.
- UX de entrada, consentimento, apelidos e fluxo de vinculação de contas existentes.
- Formato de replay/verificação e estratégia de anti-cheat compatível com a VPS.
- Entregabilidade de e-mails (SMTP/serviço) e política operacional.
- Métricas-alvo por perfil de dispositivo; testes em Android/iOS/navegadores.
- Política de pontuação histórica quando versões de balanceamento mudarem.

## 17. Referências técnicas

- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP Email Validation and Verification Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html
- Google Identity: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- MDN Screen Orientation API: https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock

**Últimas decisões CONFIRMADAS:** salto duplo para todos desde o começo; nove arquétipos propostos de inimigos e quatro chefes obrigatórios para o lançamento completo; combate de precisão, três vidas sem cura, ciclos infinitos, gestos mobile, PT-BR/EN, ranking global com visitante, cadastro e-mail/senha e login Google. **Chefes podem recuar sem encerrar a corrida.** **Reunir os quatro selos concede Traço da Aurora, efeito exclusivamente cosmético de katana.** **Desafios semanais opcionais autogerados na versão completa e três selos cosméticos progressivos Bronze 2/5, Prata 4/5, Ouro 5/5.** Interface e fluxos de Ronin ID detalhados em v0.14. Criador de personagem modular e quantidade de opções seguem como proposta para confirmação, não como decisão já aprovada. Catálogos, distâncias e metas sujeitos a playtests.
