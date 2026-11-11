# Ronin Runner — Interface, Criador de Ronin e Identidade (Game Design v0.14, Criador aprovado em v0.15)

**Status:** especificação funcional e de UX, anterior à programação. Regras **CONFIRMADAS** vindas do histórico são mandatórias; propostas de layout, quantidade de opções e sequência de onboarding serão validadas antes de congelar design.  
**Referências:** [Produto e regras gerais](./RONIN_RUNNER_SPEC.md) · [Movimentação e combate](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md) · [Progressão permanente](./RONIN_RUNNER_PROGRESSAO_MISSOES.md) · [Desafios semanais](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md) · [Chefes e recompensa](./RONIN_RUNNER_CHEFES_RECOMPENSAS.md) · [Criador modular, rig, animações e validação v0.15](./RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md).

## 1. Requisitos CONFIRMADOS

- Jogo **completo** no primeiro lançamento: quatro regiões, ciclos infinitos, nove arquétipos inicialmente propostos, quatro chefes, progresso, cosméticos, ranking global, contas e desafios semanais automáticos; sem protótipo descartável.
- **Três vidas por run, sem qualquer recuperação, abismo mata imediatamente**. Salto duplo para todos desde o início. Chefes **recuam sem encerrar a corrida** caso não sejam derrotados.
- **Mobile por gestos**, experiência em paisagem, fullscreen quando permitido, fallback responsivo quando não; controles alternativos acessíveis.
- **PT-BR e EN** em todos os conteúdos; detectar navegador e permitir escolha manual persistente.
- Ronin ID com **Visitante + apelido**, **conta por e-mail/senha** (verificação e recuperação) e **Google**, persistência e vinculação segura. Todos podem aparecer em ranking global de Jornada Completa e regional conforme elegibilidade.
- **Traço da Aurora**: efeito de katana permanente após quatro selos de chefes, sem vantagem competitiva.
- **Desafios semanais autogerados**: cinco por edição (distribuição 2/2/1 ainda parâmetro de balanceamento); **recompensas progressivas CONFIRMADAS aos 2/4/5 desafios concluídos**. Bronze (2/5), Prata (4/5), Ouro (5/5), com motivo/moldura temática gerados por composição de assets existentes, sem criação artística manual semanal. Um mesmo jogador pode obter e registrar três marcos, mas exibir um nível mais alto por edição. Somente cosméticos, sem moeda, score extra, vida ou perks.

## 2. Arquitetura de telas e rotas visuais

**Menus ficam em interface web acessível** e jogo é Phaser, compartilhando design system e estado do Ronin ID. A escolha final de framework UI (vanilla/React/etc.) fica para decisão técnica com orçamento de bundle e UX.

| Tela | Funcionalidade obrigatória | Ações principais | Estado de erro/vazio |
|---|---|---|---|
| S00 Carregamento | Carrega recursos mínimos, idioma, sessão e saúde da API | continuar, tentar novamente | conexão offline, erro de asset; não bloquear menu inutilmente |
| S01 Início | Identidade do jogo, Jogar, Meu Ronin, Pergaminho, Ranking, Configurações, seletor de idioma | jogo imediato | login opcional nunca obrigatório |
| S02 Seleção de jornada | Jornada Completa ou Expedição Regional; regiões disponíveis/bloqueadas e prévia de regras | escolher, iniciar | região indisponível com critério de desbloqueio |
| S03 Preparação mobile | solicitação fullscreen/orientação no gesto do usuário, explicação rápida dos gestos | jogar/voltar | fallback quando navegador nega fullscreen/orientation |
| S04 Corrida | jogo, parallax, HUD, gestos ou teclas, combate, chefes, regiões e ciclos | pausar | HUD funciona com rede lenta |
| S05 Pausa | resumo, continuar, recomeçar (com confirmação), configurações, sair | continuar com contagem discreta | troca de foco/rotação pausa sem morte injusta |
| S06 Resultados | distância real, score, chefes, perfeitos, recorde e ganhos de carreira; status de verificação | nova corrida, ranking, pergaminho, início | `pending / verified / rejected` claramente diferentes |
| S07 Ranking | global all-time, global semanal UTC, regional; posição do próprio jogador, filtro por modo | compartilhar perfil público, navegar página | sem pontuações, offline, sem posição, resultado aguardando |
| S08 Pergaminho | Caminho, Lâmina, Espírito, Semana; missões, selos de chefes e semanal, conquistas, histórico | ver detalhes, equipar recompensa | definição indisponível ou verificação pendente |
| S09 Meu Ronin | perfil público e privado, personagem, coleção, progresso, login/vínculos | personalizar, conta, privacidade | visitante não vinculado: aviso sutil de recuperação limitada |
| S10 Criador de Ronin | visual, presets e slots cosméticos, visualização de corrida, equipamentos | editar, prévia, confirmar | assets indisponíveis usam padrão sem quebrar personagem |
| S11 Autenticação | visitante, entrar com Google, criar conta por e-mail, login, confirmação/reenvio, recuperação de senha | vincular, entrar, cancelar | erros genéricos/temporários e preservação de progresso local |
| S12 Configurações | PT-BR/EN, áudio, efeitos, FPS/qualidade, controles alternativos, acessibilidade e privacidade | salvar/restaurar padrões | preferências locais quando servidor offline |
| S13 Conta e segurança | sessões, métodos associados, e-mail, senha, exclusão e exportação | confirmar com autenticação recente | não mesclar automaticamente identidades por email |

**Navegação primária do menu inicial**: `Jogar` destacado; `Meu Ronin`, `Pergaminho`, `Ranking`, `Configurações`. O perfil não exige login para abrir o menu. Em mobile, menus podem ser responsivos em vertical; **somente a corrida exige orientação horizontal como experiência preferida**.

## 3. Fluxos principais e microinterações

### 3.1 Primeira visita sem conta — acesso imediato

`Home (S01) -> Jogar (S02) -> criação silenciosa/recuperação de sessão visitante -> preparação orientação (S03 se mobile) -> corrida (S04) -> morte/resultado (S06)`.

- Não exigir e-mail, Google, senha nem personalização para começar.
- Criar Ronin ID anônimo com sessão segura mantida pelo servidor; se indisponível, informar degradação: resultado só poderá ser publicado ao reconectar e passar verificação, sem inventar ranking offline.
- Apelido: solicitar **antes da primeira submissão pública ao ranking ou ao abrir perfil**, não antes da primeira corrida. Permitir sugestão automática segura e edição.
- Resultado sempre destaca `Tentar novamente`, próprio recorde e progreso de conquistas, separando verificado e pendente.
- Sugerir **Vincular conta para proteger progresso** apenas após primeiro marco significativo ou no menu/perfil, nunca durante corrida.

### 3.2 Jogador retornando

- Se sessão válida: carregar perfil, configurações, traços, desbloqueios, semana atual e classificações; início em um toque.
- Se sessão expirada: oferecer reconexão/sessão anônima segura, sem apagar ou substituir dados de perfil anterior.
- Carregar progresso incremental com indicadores claros, sem telas bloqueantes desnecessárias.

### 3.3 Jornada Completa versus Expedição Regional

- Escolher jornada no S02 com visual destacado do ranking correspondente.
- Jornada Completa: inicia Floresta marco zero; compete em rankings globais all-time/semanal.
- Regional: inicia região já desbloqueada, contabiliza somente metros realmente percorridos e compete no ranking regional próprio.
- Exibir na tela de resultado qual ranking foi afetado; nunca sugerir que corrida regional entra no ranking mundial principal.
- Expedições não pulam requisitos de conquistas que exigem Jornada Completa; desbloqueios de região originam-se de alcance legítimo conforme especificação geral.

## 4. HUD e pausa (ambas plataformas)

**HUD paisagem proposto:**
- canto superior esquerdo: **três corações** (estado vital).
- topo centro/direita: distância, pontuação compacta, ícone de pausa.
- faixa inferior discreta: concentração 0–100 e indicador de combo quando ativo.
- durante boss: barra de vida/vulnerabilidade do chefe em posição que não cubra cenário, faixa de alerta reduzida, sem botão adicional.
- notificações de conquistas/desafios: preferencialmente após a run ou em trechos seguros, sem overlay cobrindo ataque ou abismo.
- nenhuma informação crítica depende de cor isoladamente.
- fallback com safe-area (notches / barras) e escala de texto sem reduzir área necessária a visualizar abismos.

**Pausa:** manual por ícone/Esc; automática ao perder foco ou alterar orientação, com pausa de relógio da simulação. Continuar com breve contagem visual; gerenciar pausas em partidas ranqueadas por regras explícitas que não punam rede móvel instável. Sair/reiniciar pede confirmação para evitar perda acidental de run.

## 5. Criador de personagem — CONFIRMADO para versão completa, sem alterar fairness

**DECISÃO CONFIRMADA em v0.15:** o jogador terá um Criador de Ronin **completo e modular** desde o lançamento, com **cabelo, rosto, tom de pele, roupas, acessórios e katana**. Animações e colisões devem ser idênticas entre combinações, sem custo de renderização desproporcional. O catálogo de quantidades de peças **continua sendo proposta** até aprovação/testes. Pipeline e matriz de validação: [v0.15](./RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md).

**Estrutura de slots proposta:**
- `base_body`: corpo e proporções de combate fixos, sem sliders que alterem hitbox.
- `skin_tone`: pequena paleta inclusiva de variações pintadas; normalizar camadas para tratamento artístico consistente.
- `hair_style`: pelo menos 4 cortes/amarrações estilizadas e penteados curtos adequados ao ronin (catálogo inicial proposto).
- `hair_color`: cores de nanquim e castanho/acinzentado, com paleta legível; propor 4–6.
- `face_detail`: sobrancelha/olhar e detalhe visual discreto de rosto; não alterar expressão de ataque que indique timing.
- `outfit`: Ronin Errante inicial e trajes desbloqueáveis por carreira/habilidade; slot de roupa único.
- `accessory_head`: chapéu ou máscara (somente itens obtidos, sem vantagens).
- `katana_skin`: bainha e cabo; manter comprimento e alcance do corte idênticos.
- `slash_effect`: padrão ou Traço da Aurora (quando desbloqueado), até um efeito ativo.
- `profile_emblem`: emblema de perfil separado da aparência durante corrida, incluindo selos semanais bronze/prata/ouro.

**Diretrizes de aparência:**
- Preservar a silhueta legível, posição da katana e a **faixa vermelha icônica** do protagonista (sugerido que continue elemento visual constante, mesmo em trajes; possibilidade de variações cromáticas apenas se não prejudicarem identidade).
- Para controle de escopo artístico: usar **camadas modulares com mesmo rig/animações-base**, spritesheets/atlases, paletas e mascaramento pré-calculado quando possível; evitar multiplicar spritesheet inteiro para todas as combinações.
- Não oferecer uploads de fotos, geração de rosto por IA nem texto livre nas roupas na versão inicial; facilita licenças, moderação, privacidade e desempenho.
- Jogador escolhe visual inicial por presets rápidos ou ignora. **Criação de personagem nunca obrigatória para jogar a primeira partida**.
- Alterações de aparência podem ser feitas a qualquer momento **fora da corrida**; persistem no Ronin ID. Mudanças durante run só terão efeito na próxima partida, impedindo inconsistência de replay.
- A representação no ranking é retrato/avatar sintético gerado dos atributos de aparência e traje, com opção padrão. Não inferir informações pessoais reais do jogador pelo avatar.

### 5.1 Experiência visual de criação (proposta)

Layout desktop: preview grande do ronin (idle, correr, ataque), painel à direita com abas `Aparência`, `Roupas`, `Katana`, `Efeitos`; barra inferior de inventário com bloqueio e critério de conquista.

Layout mobile: retrato e abas sobrepostas em tela responsiva **fora da corrida**; preview acompanha a escolha, sem exigir rotação horizontal para editar; indicadores claros de item equipado, desbloqueado e bloqueado.

Ao salvar: validação no backend de que roupas/efeitos estão desbloqueados. Local pode pré-visualizar qualquer item sem conceder posse; backend guarda apenas IDs canônicos e paletas aprovadas. Evitar abuso de cores ilegais que tornem personagem invisível.

### 5.2 Componentes persistidos

`player_character_profiles(player_id, base_preset, skin_tone_id, hairstyle_id, hair_color_id, face_detail_id, outfit_id, head_accessory_id, katana_skin_id, slash_effect_id, profile_emblem_id, appearance_version, updated_at)`.

Validações:
- composição permitida e itens realmente desbloqueados;
- um traje, um efeito e um emblema equipáveis por vez (configuração proposta);
- animações e hitbox fixas, não vinculadas à customização;
- imagem do avatar de ranking sintetizada no cliente (com fallback seguro), não arquivo pessoal enviado ao servidor;
- mudanças idempotentes com `appearance_version`/controle otimista para não perder atualizações feitas em dois dispositivos simultâneos.

### 5.3 Animações, rig e testes do Criador (v0.15)

- O criador deverá apresentar prévia real do personagem em **idle, corrida, salto, salto duplo, deslize, ataque normal/perfeito e dano**, permitindo inspecionar roupas, cabelos e acessórios com a animação do jogo.
- **Rig e pivôs compartilhados**; camadas de roupa/cabelo/rosto/katana com ordem de oclusão adaptada à pose, sem redesenhar lógica da física para cada opção.
- Slots confirmados por categoria; propostas de quantidade, manifest de assets, compatibilidade, otimização para mobile, campos de perfil e casos de teste E2E foram detalhados no [documento de v0.15](./RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md).
- Pré-visualização de itens bloqueados não concede posse: somente o servidor confirma e persiste equipamentos desbloqueados.
- A aparência muda **somente fora da corrida**; atualizações concorrentes em dois dispositivos precisam de `appearance_version` ou política transacional equivalente.
- Sem vantagem de ranking ou física em qualquer variação do avatar, inclusive se exibido em classificação mundial.

## 6. Ronin ID — fluxos de autenticação

### 6.1 Visitante

`Entrar -> servidor cria player_id interno e session_id anônimos -> cookie seguro -> avatar padrão -> primeira run -> definir apelido antes de publicar em ranking -> opcionalmente vincular conta`.

- Apelido público e identificador de jogador **não são a mesma coisa**.
- Normalização Unicode, unicidade case-insensitive, comprimento mínimo/máximo, moderação de ofensas, confusables, limites de renomeação e rate limit; nunca mostrar e-mail.
- Se cookie/sessão anônima for perdido antes de vincular conta, progresso pode se tornar irrecuperável. Mostrar esse limite com linguagem clara, sem obrigar cadastro.

### 6.2 Cadastro próprio por e-mail

`Menu -> Criar conta -> formulário (e-mail, senha, confirmar senha, apelido se não definido) -> registrar credencial pendente -> enviar link de confirmação -> confirmar posse da caixa -> sessão vinculada -> Meu Ronin`.

- Se veio de visitante, preservar progresso e preparar **vínculo ao mesmo player_id** ao confirmar/verificar; transação segura, evitar registrar dois jogadores inadvertidamente.
- Se e-mail já for cadastrado, não anunciar existência do usuário; respostas que evitem enumeração e exibição cuidadosa de erros.
- Validação de e-mail; termos de uso e privacidade acessíveis. Consentimentos adicionais só se houver propósito separado, nunca obrigatório para jogar sem necessidade.
- Senha com tamanho mínimo razoável, permitir frase longa e gerenciadores; sem regras arbitrárias de símbolos; hash de senha **Argon2id + salt único**, limites de tentativas e proteção contra credenciais vazadas conforme política escolhida.
- Link de verificação de uso único com expiração; reenvio com rate limit; sessões com privilégios reduzidos antes de confirmação quando aplicável.
- Envio de e-mail por transporte confiável e monitorado (SMTP ou serviço transacional); não pressupor que um VPS com envio direto tenha alta entregabilidade.
- Reenviar confirmação, trocar e-mail pendente e login/logout com estados e mensagens em PT-BR/EN.

### 6.3 Login Google

`Continuar com Google -> Google Identity Services -> token no backend -> validar assinatura, audience, issuer, exp e CSRF quando aplicável -> localizar identidade Google pelo sub -> iniciar/vincular sessão -> perfil`.

- Usar `sub` do Google como ID externo estável, jamais e-mail como prova única de identidade ou chave primária.
- Se o Google retornar um e-mail igual a uma conta local existente, **não mesclar automaticamente**. Pedir login no método existente/reauth e confirmação de vinculação.
- Player pode associar **ambos Google e e-mail/senha** ao mesmo Ronin ID quando comprovar posse de ambos e executar fluxo de vínculo autorizado.
- Nenhum dado da conta Google vira nome público automaticamente sem escolha do usuário.

### 6.4 Entrar em conta existente quando há progresso de visitante

Exibir confirmação com comparativo resumido:
- `Conta encontrada`: progresso existente de identidade autenticada.
- `Este dispositivo`: progresso visitante atual.
- Opções claras: **Unir progresso** (após autenticação e checagens), **Entrar sem unir** (mantém visita isolada, com aviso), **Cancelar**.
- Mesclagem só depois de autenticação validada, nunca por coincidência de apelido/email; transação idempotente.
- União baseada em eventos únicos, não soma cega de totais: máxima distância/recorde por modo, união de cosméticos, conquistas, selos, runs válidas não duplicadas, regiões desbloqueadas, missões e progresso semanal por run_id.
- Se há emblemas de edições antigas, preservar o nível máximo de cada semana e seus eventos, sem duplicar créditos.
- Se há mudança de aparência conflitante, manter aparência da conta existente por padrão e oferecer seleção explícita após fusão, sem perder itens.
- Falha na mesclagem: nunca apagar o perfil visitante antes de concluir transação; recuperação/retry consistente.

### 6.5 Esqueci senha, verificação e segurança

- Fluxo `Esqueci minha senha` solicita e-mail e responde genericamente ("Se houver uma conta..."), entrega link temporário de uso único, exige redefinição e rotaciona/invalida sessões conforme risco.
- Reautenticação recente para alterar senha, e-mail, login Google associado ou excluir conta.
- Sessões mantidas em cookies `Secure`, `HttpOnly`, `SameSite`; proteção CSRF e origem para mutações; não armazenar senhas/tokens sensíveis em localStorage.
- Controle de sessões por dispositivo e opção de encerrar outras sessões; política de expiração e rotação definida.
- Interface de exportação de dados e solicitação de exclusão, com informações de histórico/ranking e retenção por motivos legais/segurança quando pertinente; atender LGPD.
- Não expor contas/e-mails privados nas buscas públicas; perfis só exibem apelido, avatar cosmético e estatísticas públicas selecionadas.

## 7. Falhas e continuidade de partida

- API offline antes de começar: informar que ranking e salvamento em nuvem podem não estar disponíveis; permitir apenas modo explicitamente **não ranqueado** se arquitetura suportar, sem prometer posterior submissão competitiva não verificável.
- Rede perdida DURANTE corrida: simulação local continua e registra log limitado; ao terminar, tentar enviar replay assinado pela sessão; estado `pendente de verificação` até servidor confirmar. Não atribuir score ao ranking enquanto pendente.
- Repetição de envio: mesmo `run_id` só pode gerar uma partida válida e um crédito de missão/recompensa; retry idempotente.
- Sessão expira durante partida: não apagar resultado local; oferecer reautenticação e plano seguro de retomada da submissão sem usurpação de player_id.
- Aba em segundo plano/troca de orientação: pausar sem morrer por inatividade; a política antiexploit de pausas precisa ser finalizada antes de ranking de produção.
- Perfil de visitante fica atrelado ao cookie até vinculação; sem backup recuperável fora daquele navegador.

## 8. Modelos e APIs candidatas (sem implementar ainda)

Modelos: `players`, `player_profiles`, `player_character_profiles`, `player_character_presets`, `cosmetic_definitions`, `player_cosmetics`, `player_cosmetic_equips`, `profile_emblems`, `auth_identities`, `password_credentials`, `email_verification_tokens`, `password_reset_tokens`, `sessions`, `account_link_audits`, `identity_merge_records`, `runs`, `run_verifications`, `weekly_editions`, `weekly_rewards`.

APIs existentes no projeto principal: `/auth/guest`, `/auth/register`, `/auth/login`, `/auth/google`, `/auth/verify-email`, `/auth/password/forgot`, `/auth/password/reset`, `/auth/link`, `/me`, `/me/progress`, `/leaderboards/*`, `/runs/*`.
Propostas complementares: `GET /me/character`, `PATCH /me/character`, `GET /cosmetics/catalog`, `GET /me/weekly-emblems`, `PATCH /me/profile-emblem`, `POST /auth/merge/preview`, `POST /auth/merge/confirm`, `GET /me/sessions`, `DELETE /me/sessions/{session_id}`, `POST /me/export`, `POST /me/delete-request`. Rotas reais devem passar por revisão de REST, autenticação, enumeração e CSRF.

## 9. Testes E2E, interface e segurança

1. Primeira visita pode jogar sem login e sem escolher personagem; apelido só é necessário antes de ranking público.
2. Editar visual de Ronin não altera hitboxes, score, katana, salto duplo, vidas nem replay; desbloqueios estéticos são respeitados.
3. Se visitante vincula e-mail ou Google, mantém distância, cosméticos, quatro selos/Traço da Aurora, emblemas bronze/prata/ouro semanais e ranking.
4. Conta com e-mail: criar, confirmar, login/logout, recuperação, troca de senha/e-mail e proteção de enumeração e brute force.
5. Google: validar token, vincular com reauth, nunca fundir apenas por coincidência de e-mail; tests de CSRF.
6. Contraprovas de fusão: duas runs iguais não duplicam progresso; conflitos de avatar resolvidos sem perda, retry após crash recupera estado.
7. Semanas: 2/5 bronze, 4/5 prata, 5/5 ouro; receber 5 de uma vez gera três marcos idempotentes, com **ouro como emblema exibível** da edição; histórico mantém o máximo.
8. Progresso de 2/5 ou 4/5 permanece registrado e não precisa atingir 5/5 para receber cosmético.
9. Todas as telas, erros, e-mail transacional e descrição de trajes estão em PT-BR/EN; alternar idioma não altera dados.
10. Mobile (Android/iOS) e desktop: menus responsivos, rotação solicitada só na corrida, fullscreen fallback, controles sem gestos falsos e safe-area.
11. Ranking global/regional e status de verificação de score nunca confundem a posição do jogador.
12. Acesso sem rede, sessão expirada, tokens inválidos, envio SMTP atrasado e erro de banco têm estados acessíveis, retries e mensagens claras.
13. Tela de resultado e missões não afirmam concessão de selo ou recorde antes de verificação no servidor.
14. Privacidade: perfis públicos não revelam e-mail, vinculações, dados do navegador nem histórico sensível.

## 10. Próximas decisões a confirmar

- **RESOLVIDO em v0.15:** Criador completo e modular de cabelo, rosto, tom de pele, roupas, acessórios e katana **obrigatório no primeiro lançamento público**. A regra de aparência sem impacto em hitboxes, física e ranking também está fechada.
- **PENDENTE:** quantidade mínima de opções e presets, variações de penteados, cores, acessórios e opções visuais da katana; papel da faixa vermelha como marca visual permanente; avaliação de rig e clipping. O formato completo está documentado em [v0.15](./RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md).
- Preservar 5 desafios/semana e 3 níveis (2/4/5): **níveis já confirmados**, quantidade 5 foi implícita na escolha e é coerente com a edição v0.13.
- Políticas de moderação/alteração de apelido, apresentação pública do personagem (avatar e cosméticos visíveis).
- Detalhamento visual de acessibilidade, telas vazias, design tokens, animações de menu e indicadores de carregamento.
- Prazo de envio de e-mail e confirmação, política de sessões e recuperação/backup com infraestrutura concreta.
