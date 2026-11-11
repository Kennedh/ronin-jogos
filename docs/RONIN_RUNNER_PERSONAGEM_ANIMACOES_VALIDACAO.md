# Ronin Runner — Criador Modular, Animações, Telas e Validação (Game Design v0.15, distribuição v0.16 confirmada)

**Estado:** especificação ANTES de programar. A presença do Criador de Ronin completo e modular na primeira versão pública é **DECISÃO CONFIRMADA**; contagens de opções e valores de animação são **PROPOSTAS para validação**.  
**Referências:** [Especificação geral](./RONIN_RUNNER_SPEC.md) · [Interface e Ronin ID](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md) · [Física e combate](./RONIN_RUNNER_MOVIMENTACAO_COMBATE.md) · [Desafios semanais](./RONIN_RUNNER_DESAFIOS_SEMANAIS.md) · [Progressão](./RONIN_RUNNER_PROGRESSAO_MISSOES.md) · [Contratos de API/persistência v0.16](./RONIN_RUNNER_CONTRATOS_API_PERSISTENCIA.md) · [Testes de lançamento v0.16](./RONIN_RUNNER_TESTES_LANCAMENTO.md).

## 1. Contrato funcional CONFIRMADO

**DECISÃO v0.16 CONFIRMADA — distribuição de peças:** a aparência básica é livre (estilos e cores básicas de cabelo, rostos/olhos e detalhes básicos, tons de pele e visual-base), inclusive para visitantes. **Trajes especiais, máscaras e acessórios especiais, variações especiais da katana e efeitos raros** são desbloqueados pela progressão verificada, sem loja e sem vantagem competitiva. Não exigir missão para selecionar tom de pele, rosto ou cabelo básico. Itens cosméticos especiais podem incluir penteados de fantasia, mas não bloqueiam acesso à categoria de cabelo.

1. **Criador completo e modular no lançamento público**, com personalização de **cabelo, rosto, tom de pele, roupas, acessórios e katana**, integrado ao perfil **Ronin ID** de visitante, e-mail/senha e Google.
2. Aparência 100% **cosmética**; **mesmas hitboxes, corpo de colisão, impulso de salto, salto duplo base, velocidade, timing de ataque, 3 vidas sem cura e morte instantânea em abismos** para todas as combinações.
3. A aparência do personagem pode aparecer em **preview, menus, inventário, perfil e ranking**; não depender de fotos pessoais, upload de imagem nem serviço de geração por IA.
4. O Ronin **é jogável imediatamente** com aparência padrão; personalização é opcional e disponível fora da corrida. Nenhum cadastro é obrigatório para jogar; apelido necessário antes de entrar em um ranking público.
5. **Traço da Aurora** continua efeito de espada recebido por quatro selos de chefe; selos semanais **Bronze 2/5, Prata 4/5, Ouro 5/5** são emblemas, não habilidades.
6. **PT-BR/EN** para todos os nomes, opções, mensagens, descrições, tutoriais, autenticação e e-mails; idioma autodetectado do navegador com seleção manual persistente.
7. Projeto com quatro regiões, ciclos infinitos, chefes que podem **recuar sem parar a corrida**, missões, ranking mundial e progresso verificado no servidor — versão completa desde a primeira implementação, não protótipo descartável.
8. Preferência por camadas reutilizáveis, assets originais/licenciados e operação econômica na VPS.

## 2. Modelo de aparência modular

### 2.1 Camadas e slots

O corpo físico possui proporções competitivas e rig/pivôs canônicos. Alterações de aparência são **apenas renderização**.

| Slot / identificador | Personalização disponível | Alvo inicial PROPOSTO (não aprovado ainda) | Restrição |
|---|---|---|---|
| `body_palette` | Tom de pele | 8 tons bem revisados | Paleta/mascara de pigmentos, sem mudar tamanho |
| `hair_style` | Cabelo: preso, curto, longo, coque etc. | 5 modelos | Silhueta não cobre inimigos/gestos |
| `hair_color` | Pigmento da cabeleira | 6 cores compatíveis com sumi-e | Independentemente do estilo |
| `eye_style` | Olhar e sobrancelhas | 4 conjuntos | Expressão em cena mantida legível |
| `face_detail` | Detalhes sutis (p.ex. marca ou pintura) | 4 conjuntos + nenhum | Sem marcas de apropriação de culturas reais |
| `outfit_id` | Traje completo modular | 3 do planejamento inicial + 4 extras propostos | Verificar posse no servidor |
| `head_accessory_id` | Máscara, chapéu, ornamento | 4 + nenhum | Resolver sobreposição com cabelo |
| `katana_visual_id` | Cabo e bainha/guarda | 4 visuais | Comprimento/alcance real invariável |
| `slash_effect_id` | Rastro de golpe | Padrão + Traço da Aurora | Nunca muda hitbox nem timing |
| `profile_emblem_id` | Emblema perfil | Selos de chefes + semanal por edição | Fora do renderer físico |

**Padrões propostos**: cabelo preso, pele selecionada, rosto padrão, Ronin Errante, faixa vermelha e katana tradicional. O criador não exige nome/gênero/etnia real do jogador. Se houver variação adicional de silhueta corporal estética no futuro, também precisa manter hitbox e leitura idênticas; não é requisito já aprovado.

### 2.2 Itens iniciais versus itens conquistáveis

- **CONFIRMADO v0.16:** todas as alternativas marcadas como **catálogo básico** de cabelo, rosto, tom de pele e cores ficam livres e equipáveis desde o primeiro acesso, inclusive como visitante. Não condicionar características básicas a missão, região, pagamento, ranking ou provedor de login. Quantidades finais de alternativas básicas ainda serão aprovadas por arte e testes.
- Traje **Ronin Errante** disponível desde o começo; **Sombra da Névoa** (10 km) e **Corte Silencioso** (50 perfects) permanecem no plano anterior.
- Quatro trajes adicionais (Peregrino do Vento, Viajante Escarlate, Guardião do Vale e Lenda Errante) ainda são **propostas**, não aprovação expressa do catálogo final.
- Acessórios neutros e variações básicas de katana podem estar disponíveis no início; **cosméticos especiais** (máscaras, adornos raros, roupas especiais, visuais raros de katana e efeitos) são liberados por missões/conquistas verificadas, com preview e critério claros. Nenhum item especial concede dano, vida, alcance, invulnerabilidade, velocidade ou ranking.
- Os 4 selos de chefes liberam **Traço da Aurora** (CONFIRMADO); não está sujeito a desafios semanais.
- As variantes semanais de emblema (Bronze, Prata, Ouro) usam metadados da semana + motivo e moldura reutilizáveis, sem criação manual semanal.
- Itens nunca alteram visão efetiva, classificação, colisão, física, status de dano, ataque ou ritmo da simulação.

## 2.3 Metadados de catálogo e autorização v0.16

- Cada peça do catálogo terá `part_id`, `slot`, `rig_version`, `is_basic_free`, `unlock_requirement_id?`, `status`, `locale_key` e manifesto de assets aprovados. `is_basic_free=true` é equipável por qualquer Ronin ID válido, sem esperar run.
- Os atributos livres são acessíveis desde que o perfil visitante tenha sessão segura. Outros itens exigem `player_cosmetic_unlocks` confirmados após partida VERIFIED.
- Mudança no perfil aceita só IDs autorizados e compatíveis, e controle de versão de aparência; modificação local de propriedade "free" não concede posse.
- Inventário apresenta opções básicas sem cadeado; itens especiais mostram requisitos de conquista e estado pendente/verificado, sem cobrança e sem atributos superiores.
- Testar todas as escolhas livres em primeiro acesso e a rejeição de itens especiais ainda bloqueados para visitante, login Google e e-mail.
- Persistir `is_basic_free` no catálogo do servidor; não tomar decisões de gratuidade exclusivamente no frontend. A API envia critérios públicos e o servidor calcula posse/autorização.
- Contratos formais: [v0.16](./RONIN_RUNNER_CONTRATOS_API_PERSISTENCIA.md); matriz E2E: [v0.16](./RONIN_RUNNER_TESTES_LANCAMENTO.md).

## 3. Contrato de arte e rig compartilhado

**Direção visual:** samurai original em sumi-e/ukiyo-e/aquarela/washi, contornos nítidos com faixa vermelha icônica e efeitos de tinta sem encobrir abismos. Não copiar personagens ou sprites de outras propriedades intelectuais.

**Pipeline visual proposto**:
1. **Silhueta canônica** / atlas do ronin com âncoras consistentes (pé, quadril, ombro, punho/katana, cabeça, cintura/faixa); 2D articulado ou atlas de sprites por pose após estudo de qualidade.
2. **Peças modulares** desenhadas na mesma orientação/perspectiva, com máscaras/sistemas de oclusão por parte da animação. As camadas devem compartilhar rig/marcações de frame ou pivôs equivalentes.
3. **Ordem visual por pose**, não apenas `z-index` estático: cabelo traseiro → corpo → vestimenta traseira → braços/pernas/roupas à frente → cabeça/rosto → acessórios → espada e rastro; atravessar o corpo altera oclusões de espada e manga de acordo com a pose.
4. **Paletas com máscaras de pigmento** para tom de pele/cabelo, sem tingir por acidente contornos, olhos ou acessórios. Paletas devem parecer pintadas, não somente CSS filter sobre personagem.
5. **Faixa vermelha** continua elemento visual principal em todos os trajes (sugestão de identidade), sem simular física com efeitos dependentes do frame do jogo autoritativo.
6. **Avatar sintético** do perfil/leaderboard gerado dos mesmos IDs/presets com fallback imagem padrão. Persistir metadados estáveis, não uma imagem arbitrária enviada pelo usuário.
7. **Pré-carregamento por demanda** do traje atual e assets prováveis; não baixar todo o catálogo ao iniciar o game. Assets do próximo bioma seguem fluxo separado de streaming de cenário.
8. **Cache/atlases** de peças equipadas e sprites compostos quando útil; evitar dezenas de draw calls por personagem em telas com muitos avatares. Garantir recolhimento de recursos após fechar editor.
9. **Fallback seguro:** se qualquer peça de um avatar quebrar/carregar incorretamente, desenhar a variante padrão, nunca invisibilidade ou quadro de colisão diferente.
10. **Metadados e versões** de compatibilidade entre peça, rig e animação, com validação automática antes de publicar catálogo.

**Proposta de performance:** 60 FPS em dispositivos capazes e escalonamento para 30 FPS visual onde necessário **sem mudar ticks de simulação**. Medir uso de VRAM, draw calls, tamanho de atlas, primeira pintura e memória em corrida longa; limites são definidos por teste em aparelhos reais e perfil da VPS/banda, não arbitrados no documento.

## 4. Sistema de animação completo

Separar **estado autoritativo da simulação** (tick, posição, hitbox, dano, janela de ataque) do **estado visual** (interpolação, frames, partículas, tecido, efeitos). O estado de ataque nunca deriva de "frame atual" do navegador.

### 4.1 Estados visuais obrigatórios no lançamento

| Animação / layer | Quando ocorre | Marcação ou regra crítica |
|---|---|---|
| `IDLE` | Menu e criador | Respiração, tecido e katana repousando |
| `RUN` | Corrida automática | Loop visual sincronizado com deslocamento |
| `JUMP_START` | Primeiro impulso | Pose legível; não atrasa impulso da física |
| `JUMP_APEX` | Pico do primeiro pulo | Leitura de fase de ar |
| `DOUBLE_JUMP` | Segundo impulso no ar | Efeito de tinta diferenciável, sem ganho oculto |
| `FALL` | Queda após salto ou fim do arco | Sem cancelar hitbox de ataque válido |
| `LAND` | Contato com chão seguro | Partícula reduzível; buffer de salto continua autoritativo |
| `SLIDE_START` | Entrar em deslize | Corpo visual desce junto com hitbox |
| `SLIDE_LOOP` | Manter deslize ~550 ms **propostos** | Altura visual compatível com hitbox reduzida |
| `SLIDE_END` | Erguer após deslize | Não atravessar galho/teto nem prolongar hitbox sem regra |
| `ATTACK_WINDUP` | Início de corte | Aproximadamente 70 ms **propostos** |
| `ATTACK_ACTIVE` | Área ativa de katana | Aproximadamente 120 ms **propostos**, com event marker de tick |
| `ATTACK_RECOVERY` | Fim de golpe | Aproximadamente 180 ms **propostos**, impede spam |
| `PERFECT_SLASH_FX` | Contato no timing perfeito | Traço próprio, sem novo ataque extra |
| `CONCENTRATION_SPECIAL_FX` | Próximo golpe bem-sucedido com 100 de concentração | Visual + eventos autoritativos, sem vida extra |
| `HURT` | Perde um coração | Feedback legível; invulnerabilidade ~900 ms proposta, independente da duração visual |
| `DEATH_DAMAGE` | Zera vidas | Sem hitbox e sem novos comandos |
| `DEATH_ABYSS` | Cai em abismo | Fim imediato da run; visual pode continuar brevemente |
| `BOSS_INTRO/DEFEAT/RETREAT` | Encontro de chefe | A corrida continua se personagem vive |
| `UNLOCK_REVEAL` | Fora da partida | Selos, traje ou efeito; prêmio só após verificação no backend |

**Regras de composição de animações:**
- Locomoção e **ataque em layer superior** quando permitido; salto+ataque deve ser possível com braços/katana sincronizados às pernas em movimento.
- `SLIDE` não permite iniciar ataque no conjunto atual de regras. Variantes de traje e acessórios seguem a mesma transição.
- `HURT` e `DEATH` têm prioridades claras; morte cancela feedback normal e input; invulnerabilidade não protege de abismos.
- Comandos aceitos pelo estado autoritativo no **próximo tick válido**. Não atrasar movimento para fechar ciclo de animação bonita.
- A janela de `perfect slash` depende do tick da simulação e do telegraph verificado, não da taxa de FPS/quantidade de frames desenhados.
- Nenhuma animação de roupa ou cabelo muda silhueta crítica o suficiente para esconder o momento de corte ou um abismo.
- `reduced motion`: partículas diminuídas, transições de tela breves, flashes reduzidos, sem retirar telegraph obrigatório de bosses.
- Todas as aparências selecionáveis devem suportar todos os estados; **não aceitar combinação que falhe em animação de dano, deslize ou duplo salto**.

### 4.2 Planilha de sincronização de marcadores (PROPOSTA)

- Unidades autoritativas em ticks fixos `TICK_RATE=60`; animação representa estados sem controlá-los.
- Ataque: tick inicial = 0; windup ~ticks 0–3; janela ativa ~ticks 4–10; recovery ~ticks 11–21; os arredondamentos ficam na tabela `rules_version` de produção.
- Slide: entrada e saída com marcadores de hitbox previstos; duração ~33 ticks, recuperação ~6 ticks.
- Invulnerabilidade dano: ~54 ticks; overlays/flash podem durar menos.
- Jump buffer/coyote: verificações em ticks (~6 e ~5 ticks).
- Eventos `sword_hit`, `land`, `boss_window_open` e `damage` devem ser instrumentáveis e reproduzíveis.
- Evitar inconsistência de contagem por arredondar ms em diferentes dispositivos; escolher **ticks inteiros finais** antes de publicar ranking.

## 5. Interface completa — fluxos de telas e apresentação

**As telas S00–S13 são mantidas e são obrigatórias conforme [v0.14](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md).** Aqui ficam refinadas em transições e critérios de aceitação.

### 5.1 Menu inicial (S01)

- `JOGAR` é ação predominante, sem modal pedindo conta.
- Atalhos `Meu Ronin`, `Pergaminho`, `Ranking`, `Configurações`; indicador PT/EN e nome/apelido da sessão.
- Arte viva/corrompida de fundo tem movimento reduzido opcional; menor custo de renderização do que gameplay ativo.
- Se API falhar, informar status real de ranking/salvamento sem fingir que informações estão sincronizadas.

### 5.2 Seleção de modo (S02)

- Jornada Completa: inicia 0 m, ranking mundial e semanal.
- Expedição Regional: regiões alcançadas, ranking individual daquela região, apenas distância efetiva percorrida; mostrar bloqueio e critério.
- Seleção preserva traje e aparência já equipados; alterações só entram na corrida seguinte.
- Mostrar clareza entre "recorde global" e "recorde regional"; nunca misturar pontuação.

### 5.3 Criador de Ronin (S10) — tela detalhada

**Layout desktop**: preview grande central-esquerdo, abas de personalização à direita e catálogo inferior. **Layout mobile**: preview compacto com abas roláveis, sem exigir horizontal enquanto no menu. Barra de progresso/estado de salvamento.

Abas **propostas**:
1. `Aparência`: tom de pele, cabelo, cor, olhos, detalhes faciais.
2. `Roupas`: trajes disponíveis, prévia dos bloqueados com requisito.
3. `Acessórios`: máscara/chapéu/adornos, compatibilidade visual.
4. `Katana`: cabo/bainha/guarda e efeitos de golpe desbloqueados.
5. `Perfil`: emblema exibido e prévia de avatar de ranking.

Comandos: voltar sem salvar, restaurar padrão, pré-visualizar animação (`IDLE`, `RUN`, `JUMP`, `DOUBLE_JUMP`, `SLIDE`, `ATTACK`, `HURT`), `SALVAR`. Um item bloqueado pode ter preview sem equipar. Mensagens de erro associadas ao controle, não alert modal genérico.

**Persistência**:
- Apenas IDs canônicos de opções e `appearance_version`; validações de posse/compatibilidade no servidor.
- Atualizações idempotentes; conflito entre dois dispositivos notifica "visual atualizado em outro dispositivo" com opções de recarregar e aplicar de novo, sem sobrescrever silenciosamente.
- Fallback padrão se camada ou CDN falhar, sem apagar a personalização da base.
- Mudanças de roupa fora de partida; personagem fotografado/espelhado no ranking deve refletir o perfil após confirmação do servidor, não altera replays concluídos.

### 5.4 HUD e resultado (S04–S06)

- HUD mantém 3/2/1 corações, distância, score, concentração, pausa e barra de chefe apenas durante encontro.
- Não cobrir abismo/inimigos com tooltip de missão ou "item desbloqueado" durante run.
- Pausa em perda de foco, mudança de orientação, chamada e queda de fullscreen; retomar sem perda injusta.
- Resultados distinguem `PENDENTE`, `VERIFICADO`, `REJEITADO`; conquistas/itens só são efetivados quando verificados.
- Listar aumento real de distância da carreira, ações válidas e progresso semanal, com níveis Bronze 2/5, Prata 4/5 e Ouro 5/5.

### 5.5 Meu Ronin, Pergaminho, Ranking (S07–S09)

- `Meu Ronin`: avatar modular, apelido, traje/efeito equipados, emblema semanal exibido, recordes por modo, progresso e atalhos de segurança da conta.
- `Pergaminho`: O Caminho, A Lâmina, O Espírito, Semana; coleção de selos de chefes, Traço da Aurora, histórico de selos semanais sem logins diários.
- `Ranking`: mundial all-time e semanal (só Jornada Completa), regional separado, paginação, perfil público com avatar composto, desempate e status; anonimizar e-mail.
- Missões e selos não mudam score do ranking; equipar emblema não altera concorrência.
- `Settings`: idioma PT-BR/EN, controles alternativos, volume, qualidade (automática/baixo/alto), redução de movimento, transparência e suporte.

## 6. Ronin ID e estado de sessão

A especificação de autenticação do [v0.14](./RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md) permanece obrigatória. Pontos críticos adicionais:

- O **Criador funciona também em perfil visitante**, com sessões protegidas; acesso a conta não é barreira para personalizar.
- Um visitante pode definir aparência e jogar, e depois **vincular** Google ou e-mail preservando o mesmo `player_id`; fusão com conta existente exige verificação explícita e deduplica `run_id`, conquistas e cosméticos.
- Receber um visual bloqueado por fraude ou manipulação da requisição é rejeitado na API; render client não é fonte de autoridade.
- Google Identity Services: validar ID token no backend e usar sub, não e-mail como prova suficiente de identidade.
- Cadastro com e-mail: confirmar, recuperar senha e proteger sessões contra uso indevido; notificações PT-BR/EN.
- Alterar apelido/avatar não altera historicamente pontuações. Ranking referencia ID do jogador e exibe apelido/visual atuais sob regras de cache, com moderação.
- Privacidade: perfil público pode omitir personalização detalhada e usar avatar-padrão, mas não esconder deliberadamente elementos competitivos que influenciem visibilidade (não existem atributos de vantagem).
- Tela de exportação/exclusão e sessões ativas; políticas LGPD e retenção compatível com integridade do ranking.

## 7. Persistência e APIs (propostas)

**`player_character_profiles`**: `player_id`, `base_rig_id`, `body_palette_id`, `hair_style_id`, `hair_color_id`, `eye_style_id`, `face_detail_id`, `outfit_id`, `head_accessory_id`, `katana_visual_id`, `slash_effect_id`, `profile_emblem_id`, `appearance_version`, `updated_at`.

Catálogos imutáveis/versionados: `character_rigs`, `visual_part_definitions`, `visual_part_compatibility`, `asset_manifests`, `animation_marker_versions`, `cosmetic_unlocks`, `profile_emblem_definitions`.

APIs candidatas: `GET /me/character`, `PATCH /me/character` (controle otimista), `GET /character/catalog`, `POST /character/preview` **se preview exigir render servidor — recomendação é cliente**, `GET /leaderboards/{mode}`, `GET /players/{id}/public`, `GET /me/emblems`, `PATCH /me/emblems/equip`.

**Não implementar endpoint de upload de avatar/arte no lançamento.** Renderização da aparência é local; servidor armazena somente opções permitidas.

## 8. Matriz de validação antes do lançamento

| Área | Cenário E2E/unitário/visual | Critério de aprovação |
|---|---|---|
| Criador completo | Editar cabelo, rosto, pele, roupa, acessório e katana | Todas as seis categorias funcionais no lançamento |
| Disponibilidade | Primeiro uso sem cadastro nem personalização obrigatória | Chega à corrida em poucos passos, sem formulário forçado |
| Integridade | Mudar item não adquirido via devtools/API | Servidor recusa, item não é equipado |
| Fairness | Comparar todas as opções com mesmos inputs/seed | **Mesmas colisões, velocidade, vidas e score** |
| Rig/oclusão | Ataque aéreo e deslize com chapéu, cabelo longo e roupa volumosa | Sem membro solto, espada atrás de rosto indevidamente, clipping crítico |
| Animações | Todos os estados para combinações básicas e pairwise | Sem frames ausentes, deformações ou lag de marcador |
| Ticks/replay | 30/60/120 Hz e hardware diferente | Mesmo replay autoritativo, janela de corte idêntica |
| Mobile | Swipe, tela horizontal, fullscreen recusado, notch | HUD e criador legíveis, sem morte por rotação |
| Memória | Alternar 100+ visuais no editor e longas corridas | Cache controlado, sem crescimento contínuo de memória |
| Perfil e ranking | Troca de visual e emblema, cache atualizado | Avatar coerente com Ronin ID, sem interferir no ranking |
| Visitante→conta | Personalizar, vencer chefe, obter selos semanais, vincular | Sem perda/duplicidade de progresso e aparência |
| Google/e-mail | Login duplo, troca de dispositivo, senha resetada | Sem takeover por coincidência de e-mail |
| Semanas | 2/5 Bronze, 4/5 Prata, 5/5 Ouro em batch | Três prêmios idempotentes, maior selo visível |
| Aurora | 4 selos chefes em runs diferentes; equipar efeito | Apenas visual, não modifica alcance/dano |
| Localização | Todos os menus, itens e fluxos em PT-BR/EN | Sem texto faltando, truncado ou arte com strings fixas |
| Performance | Baixa/média/alta GPU, menu e 4 biomas, chefes/ciclos | Sem diferença de física, tempo de reação ou segurança |
| Acessibilidade | Redução de movimento, alto contraste, controles alternativos | Telegráficos continuam perceptíveis |
| Falha de rede | Salvar personagem desconectado, conflito de versão | Erro recuperável sem apagar estado salvo |
| Segurança/privacy | Perfil público, nickname, cookies, export/delete | E-mail e dados privados não vazam |
| Catálogo | Todas as combinações válidas em matriz de compatibilidade | Sprite válido ou fallback, nunca invisibilidade |

**Estratégia combinatória:** testes exaustivos por slot, combinações pairwise (duplas) entre slots/posições, combinações críticas específicas (chapéu+cabelo longo, máscara+animação facial, traje volumoso+slide, katana+golpe perfeito), snapshots visuais versionados e replays de longa duração. Para catálogo maior, geração de pares validada e teste de amostragem estratificada. Não tentar renderizar manualmente todas as combinações em todo build.

### 8.1 Critérios de aceite não negociáveis

- As seis categorias do criador devem existir, ser utilizáveis e persistir em todos os modos de identidade.
- Equipar qualquer combinação válida não pode alterar um **único tick** de combate ou uma caixa de colisão.
- Cada animação obrigatória possui versão compatível com todos os estilos equipáveis, direta ou por fallback explícito e esteticamente aceitável.
- Sem perda de vidas ou alteração indevida de score por efeitos, telas, troca de idioma, interação de conta ou atualização visual.
- Quatro regiões e chefes, ciclos infinitos, missões e selos semanais 2/4/5 permanecem cobertos pelos testes E2E da versão final.
- Nenhuma feature será tratada como "pronta" apenas por funcionar no menu sem ser validada em partidas e ranking.

## 9. Pendências para próximos documentos antes do código

- **Resolvido:** aparência básica livre + especiais desbloqueáveis. **Pendente:** quantidade final e identidade artística das peças básicas gratuitas, quantidade de cosméticos especiais de estreia e quais missões específicas concedem cada peça, sem restringir escolhas básicas.
- Escolha técnica entre **rig 2D articulado com camadas** versus **spritesheets compostos por pose** (ou híbrido), após teste de custo/qualidade; ambas preservam renderer desacoplado da física. A arquitetura deve permitir adaptar a implementação sem redesenhar a lógica de customização.
- Definição final de tokens gráficos de UI, proporções de tela, tempos de transição, tipografia/licenças e contraste.
- Revisão de política de moderação de apelidos, perfis públicos, dados e retenção.
- Política competitiva de pausas, desconexão, runs pendentes e upgrade de `rules_version`; anti-cheat e ambiente de testes.
- Catálogo final completo de opções e requisitos de desbloqueio, perfil de performance e plano de teste por dispositivo.
- Proteção de recursos na VPS, e-mails transacionais de conta, monitoramento e recuperação de falhas.
