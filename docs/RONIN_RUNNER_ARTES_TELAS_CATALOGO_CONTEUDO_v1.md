# Ronin Runner — Catálogo de arte, telas, jogo, missões e semanais (baseline v0.18)

**Escopo:** consolidar G06, G07, G08, G09, G10 e G11 sem criar assets nem implementar.  
**Regra:** categorias confirmadas pelo usuário; números, cores e volumes abaixo são **BASELINE ARTÍSTICO/TUNABLE**, e não declaração de que ele já aprovou a arte final.

## 1. Criador completo — catálogo de lançamento

**Decisão de produto fechada:** criar Ronin completo com cabelo, rosto, pele, roupas, acessórios e katana. **Aparência básica livre**, trajes/efeitos raros só por progressão, sem vantagem em hitboxes ou ranking.

| Slot | Básicos LIVRES sugeridos | Especiais por conquista |
|---|---|---|
| Tom de pele | **8** tons selecionáveis livres | nenhum tom de pele é bloqueado por progressão |
| Penteado | **5** (curto, longo preso, rabo de cavalo, coque, raspado) | 2+ estilos artísticos de fantasia obtidos em missões |
| Cores de cabelo | **6** pigmentos básicos | 2+ tinturas estéticas especiais |
| Olhos/sobrancelhas | **4** variantes de expressão base | efeitos faciais raros opcionais, não restringir face base |
| Detalhe de rosto | **4 + nenhum** | máscara/adereço raro diferente de tom/rosto base |
| Roupa | Ronin Errante e cores básicas compatíveis | Sombra da Névoa, Corte Silencioso + 4 propostas de carreira |
| Acessório | Nenhum + pelo menos 2 adornos simples | máscaras/chapéus/adornos de conquistas |
| Katana | visual padrão + pelo menos 2 cabos/bainhas básicos | 4 variações raras, com alcance idêntico |
| Rastro de katana | padrão livre | **Traço da Aurora** por quatro selos de chefes |
| Emblema perfil | padrão livre | selos chefes e Bronze 2/5, Prata 4/5, Ouro 5/5 semanais |

As contagens são **mínimos recomendados para planejar a produção artística**, sujeitos a revisão de custo e compatibilidade. Não inventar nomes ou características pessoais do jogador. Equipar uma peça requer `rig_version`, `slot`, `asset_id` e opção permitida pelo backend; não existe upload de foto real. Preview de item bloqueado não o concede.

**Pipeline de assets:** para cada peça, registrar ID, autoria/licença, normal map? (não necessário por padrão), silhueta, camadas, pivôs (pé/quadril/ombro/cabeça/punho/bainha), compatibilidade de animação, atlas, peso final, fallback. Usar 2D híbrido (sprites de peças+mesmo rig), exportação lossless de master e atlas compactado de runtime; PNG/WebP/AVIF somente após teste no Phaser e browser real. Menus geram avatar a partir de metadados, não imagem fornecida pelo jogador.

### 1.1 Animações e estados mínimos

`IDLE, RUN, JUMP_START, JUMP_APEX, DOUBLE_JUMP, FALL, LAND, SLIDE_START, SLIDE_LOOP, SLIDE_END, ATTACK_WINDUP, ATTACK_ACTIVE, ATTACK_RECOVERY, PERFECT_FX, SPECIAL_FX, HURT, DEATH_HP, DEATH_ABYSS`; variações BOSS_WARN, BOSS_DEFEAT, BOSS_RETREAT e efeitos de desbloqueio. Layers superiores e inferiores trabalham em pivôs compartilhados. Qualquer item que quebra deslizamento ou ataque aéreo bloqueia seu próprio deploy, **não remove o golpe nem troca hitbox**.

**Proibição:** nada de gerar uma spritesheet completa para cada combinação de aparência, nada de mecânica baseada na duração gráfica de sprite. Testes pairwise, cenários críticos (cabelo longo+chapéu, manga longa+slide, katana+perfeito, rosto+máscara) e fallback de asset.

## 2. Direção de arte e som por região

**Linguagem:** original ukiyo-e/sumi-e e aquarela sobre textura de washi, sem copiar personagens, trilha ou arte de IP existentes. Silhuetas do perigo sempre em alto contraste mesmo no ciclo mais corrompido. Reduzir movimento e flashes disponível.

| Região | Paleta inicial (referencial) | Corrupção | Assets/efeitos mandatórios | Paisagem sonora |
|---|---|---|---|---|
| Floresta de Bambu | Verde musgo #6B8768, creme #F2E7CE, carmesim #B74C47 | manchas escuras #22252A e folhas negras | bambu multicamadas, tronco, galho, vala, raízes, Raiz Negra | vento, bambu, percussão leve e katana |
| Templo Esquecido | Ocre #B99763, terracota #9E6244, papel #F2E7CE | rubro escuro e sombras de lanternas | torii, sinos, arcos, pilares, Guardião do Sino | sino baixo, ambiente sagrado original |
| Montanhas Geladas | Azul #8CB2C4, cinza #D3DDE1, gelo | tempestade tinta azul-preto | neve, blocos, fissuras, estalactites, Espírito da Nevasca | sopro de vento, estalos de gelo |
| Castelo do Eclipse | Carmesim #922F35, carvão #2A2528, dourado #C39F64 | eclipse e linhas de nanquim denso | pontes, lâminas, ruínas, Senhor do Eclipse | tambores contidos, ecos de espada |

Para cada bioma produzir **4 camadas mínimas** (céu/fundo distante/meio/collision foreground), ambient props e variáveis de corrupção controladas por ciclo. Corrosão progressiva muda clima, partículas, textura e detalhe; não apenas overlay preto. Proteger indicadores críticos do jogo com cores/contornos que funcionem sem percepção de vermelho/verde. Trilha e SFX originais ou licenciados; manter planilha de licenças e arquivos de origem. Versões reduzidas de efeitos em qualidade baixa, sem retirar pistas de perigo.

## 3. Conteúdo de inimigos, chefes e obstacles — baseline de teste

**Nove arquétipos propostos** (Soldado, Lanceiro, Espírito de Tinta, Arqueiro, Guardião de Pedra, Lobo, Andarilho de Gelo, Espadachim do Eclipse, Sombra Rasgante), com telegraph de pose+som e regras por `rules_version`. **Quatro chefes confirmados**: Raiz Negra, Guardião do Sino, Espírito da Nevasca e Senhor do Eclipse; podem morrer ou **recuar**, nunca bloquear continuação da run.

| Regra numérica | Baseline |
|---|---|
| Encontros de chefe | próximos ao fim de cada região, uma instância por (run,region,cycle) |
| Ataques para matar chefes | 3/4/5/6 válidos respectivamente |
| Oportunidades em encontro | 4–5 / 5–6 / 6–8 / 7–9 |
| Bônus de pontuação | +300/+450/+600/+900, uma vez por boss instance |
| Aviso de obstáculo comum | alvo ≥1s antes de exigir input |
| Aviso de abismo fatal | alvo ≥1,5s, nunca invisível |
| Corte perfeito | ±6 ticks em motor de 60/s; não encolhe com os ciclos |
| Velocidade do mundo | 360→600 u/s, teto no ciclo avançado |
| Corredores de respiro | obrigatórios entre blocos difíceis e antes/depois de boss |
| Obstáculos com solução | gerador calcula rotas e transições de movimentos, com testes de concatenação |

Durações físicas e distância dos encontros são `TUNABLE`; falha de alcançabilidade impede publicar seed/template. **Duplo salto disponível desde início**; não gerar sequência que pressuponha terceiro salto no ar ou reset antes de pousar.

**Progressão de quatro regiões por ciclo:** intervalos propostos 0–1500–3500–6000–8000 metros, depois repetem +8000/ciclo. Todos esses números podem mudar antes da release, sem alterar regra de quatro regiões/ciclos infinitos. Chefes nunca recuperam vidas; corredores de encontro com piso seguro na baseline, evitando múltiplos riscos fatais sobrepostos.

## 4. Missões, trajes, selos e recompensas

**Três trilhas já especificadas:** O Caminho (distância e regiões), A Lâmina (precision/combat), O Espírito (chefes, feitos). Missões são **automáticas**, não exigem equipar/ativar uma missão. Nenhuma missão muda score de ranking.

**Trajes de carreira:** Ronin Errante inicial; Sombra da Névoa aos 10km acumulados; Corte Silencioso aos 50 cortes perfeitos. Quatro adições propostas: Peregrino do Vento (3km), Viajante Escarlate (150 kills comuns), Guardião do Vale (50km), Lenda Errante (100km). `250km` gera título Caminhante Eterno; `1000 perfects` gera emblema Mestre da Lâmina. Conquistas confirmadas pela mecânica: derrotar cada chefe uma vez concede um selo; **4 selos = Traço da Aurora**; derrotar quatro boss na mesma Jornada Completa dá emblema especial. Todas com IDs estáveis, PT/EN e validação backend.

**Se run termina em morte:** replay VERIFIED conta pontuação/estatísticas e missões elegíveis. Se ABANDONED por opção, score não ranqueia mas eventos de segmentos válidos podem contar *somente cumulativos* se run fechou com replay íntegro, conforme política v0.18. PENDING não concede itens.

## 5. 30 templates iniciais de desafios semanais

**Produto confirmado:** geração automática sem curadoria semanal; selos Bronze (2 de 5), Prata (4 de 5), Ouro (5 de 5). Recompensas puramente cosméticas.  
**Baseline:** edição mundial 5 desafios toda segunda-feira 00:00 UTC, 2 acessíveis, 2 intermediários, 1 avançado, sem obrigação de login diário, sem cadeias de dependência e sem exigir regiões desbloqueadas para cumprir desafios acessíveis.

Templates (IDs imutáveis; alvos como faixas para escolha determinística dentro do tier e testes):
| ID | Categoria | Condição | Tier elegível / alvo sugerido |
|---|---|---|---|
| W01 | distância | metros acumulados | fácil: 500–2.000m |
| W02 | distância | metros acumulados | médio: 2.000–6.000m |
| W03 | distância | metros acumulados | avançado: 6.000–12.000m |
| W04 | distância | única run de pelo menos N metros | fácil: 400–900m |
| W05 | distância | única run de pelo menos N metros | médio: 1.000–2.500m |
| W06 | distância | distância em Jornada Completa | médio: 1.500–4.000m |
| W07 | kills | derrotar N inimigos comuns | fácil: 5–15 |
| W08 | kills | derrotar N inimigos comuns | médio: 15–35 |
| W09 | kills | derrotar N inimigos comuns | avançado: 40–80 |
| W10 | kills | derrotar N inimigos numa run | médio: 8–20 |
| W11 | perfects | N cortes perfeitos na semana | fácil: 3–8 |
| W12 | perfects | N cortes perfeitos na semana | médio: 10–25 |
| W13 | perfects | N cortes perfeitos na semana | avançado: 25–55 |
| W14 | perfects | N perfects numa run | médio: 5–12 |
| W15 | perfects | N perfects numa run | avançado: 15–25 |
| W16 | combo | streak de N cortes perfeitos numa run | fácil: 2–3 |
| W17 | combo | streak de N numa run | médio: 4–6 |
| W18 | combo | streak de N numa run | avançado: 7–10 |
| W19 | sobrevivência | N metros sem dano numa run | fácil: 400–800m |
| W20 | sobrevivência | N metros sem dano numa run | médio: 800–1.800m |
| W21 | sobrevivência | N metros sem dano numa run | avançado: 1.800–3.500m |
| W22 | mobilidade | N saltos duplos válidos | fácil: 5–12 |
| W23 | mobilidade | N saltos duplos válidos | médio: 15–35 |
| W24 | mobilidade | N slides válidos | fácil/médio: 6–25 |
| W25 | boss | derrotar um chefe qualquer | médio/avançado: 1 |
| W26 | boss | derrotar N instâncias de chefes | avançado: 2–3 |
| W27 | boss | derrotar Raiz Negra ou Guardião do Sino | médio: 1, sem exigir kill obrigatória na progressão |
| W28 | exploração | alcançar Templo em Jornada Completa | médio: 1 |
| W29 | exploração | alcançar Montanhas em Jornada Completa | avançado: 1 |
| W30 | runs | concluir N runs válidas com >=300m cada | fácil/médio: 2–4 |

**Gerador:** catalog versioned + semana ISO + seed HMAC, no máximo um boss template, diversidade preferencial de categoria e sem mesmo template por quatro semanas se o catálogo comportar, ou fallback auditado. Não confundir "10 kills em uma run" com "10 kills ao longo da semana". O backend avalia por eventos verificados; nunca criar desafios com cura, login diário, speed buff, moedas, vantagens de classe ou itens comprados.

**Selos semanais:** mesmo motivo estético por semana com moldura Bronze/Prata/Ouro, imagem composta a partir de assets aprovados; histórico da melhor tier com idempotência por (player,week,tier), sem nova pintura manual toda semana. PT-BR/EN devem localizar objetivos no plural, distância e fuso local.

## 6. Telas S00–S13 e comportamento

| ID | Tela | Conteúdo/ações e estados obrigatórios |
|---|---|---|
| S00 | Carregamento | idioma, sessão e assets mínimos, retry e offline |
| S01 | Menu | JOGAR destaque, Meu Ronin, Pergaminho, Ranking, Configurações, PT/EN |
| S02 | Modo | Jornada Completa/Regional, requisitos bloqueados, ranking pertinente |
| S03 | Preparação mobile | swipes, teclado acessível alternativo, request fullscreen/orientação, fallback |
| S04 | Corrida | 3 corações, distância, score, concentração, boss bar, pausa; zero overlays bloqueantes |
| S05 | Pausa | scene shield, continuar com 3–2–1, configurações, confirmar abandono |
| S06 | Resultado | status pending/verified/rejected, recorde real, missões, retry |
| S07 | Ranking | FULL all-time-major e semanal, REGIONAL separado, paginação, perfil público |
| S08 | Pergaminho | Caminho/Lâmina/Espírito/Semana, 4 selos, Aurora, tiers 2/4/5, histórico |
| S09 | Meu Ronin | avatar modular, nickname, estatísticas, métodos de conta e coleção |
| S10 | Criador de Ronin | aparências base livres, preview de animações, equipar somente concedidos |
| S11 | Conta | visitante, registro email, login, Google, reset, email confirmation, merge preview |
| S12 | Configurações | idioma PT/EN, áudio, qualidade, controles, acessibilidade, privacidade |
| S13 | Segurança | sessões, vinculação, reautenticação, exportação e exclusão |

**Design tokens BASELINE para mock e inspeção:** superfície papel `#F2E7CE`, texto carvão `#2A2528`, ação carmesim `#A64340`, acento musgo `#6B8768`; tipografia legível livre/licenciada, corpo ≥16 CSS px em menus desktop, ≥15 CSS px em mobile menus onde couber, texto de ajuda ≥13 CSS px com contraste suficiente. Preferir WCAG AA para contraste de informação, foco visível, elementos touch preferencialmente ≥44 CSS px de área. Paleta escura nas cenas de corrupção com contraste mantido.

**Wireframes de orientação**, não mock final: em desktop menu com arte de fundo/ação principal à esquerda e quatro módulos abaixo, avatar no canto; em mobile menu vertical rolável sem obrigatoriedade de paisagem. Corrida horizontal com hearts topo-esquerda, pontos/distância topo-direita e barra de boss central inferior apenas quando ativo. Resultado apresenta resumo primeiro, depois conquistas e ação de novo jogo, sem modal de login obrigatório.

**Estados de tela por operação:** `idle, loading, success, empty, pending_verification, offline, error, expired_session, conflict`. Definir transições e mensagens `message_key`, nunca string hardcoded em sprite. Botões de "aplicar" só chamam API e ficam pendentes até confirmação; result de score não se converte em ranking com lógica do cliente.

## 7. Asset manifest e validação visual

**Planilha/manifest futuro:** uma linha por ativo com `asset_id, biome, layer, quality_tier, slot, animation_name, rig_version, format, pixel_dimensions, bytes, license_id, source, fallback_id, locale_key?`. Não deixar assets arbitrários fora do controle do manifesto.

**Testes:** para cada slot, combinações pairwise com outras peças e todas poses críticas; snapshot de S00–S13 em PT/EN, desktop/Android/iOS; sem clipping crítico de cabelo/chapéu, katana/roupa; render da Aurora não esconde boss telegraph nem abismo; shader de corrupção reduzido ainda mantém perigo perceptível.

**Licenças:** fontes, música, texturas e sprites próprios ou permissivamente licenciados; inventariar versões, atribuições e requisitos de distribuição, respeitando custo da VPS. Não usar assets copiados de jogos ou bibliotecas com licenças incompatíveis.

## 8. Decisões ainda dependentes de prova visual/playtest

- Paleta final e volumes de assets, nomes definitivos dos cosméticos e aprovação estética; contagens acima são baseline de produção.
- Duração exata de animações e pós-processamento, hitboxes por chefes/inimigos, leitura de telegraph em aparelhos reais.
- Limites de bundle e streaming por dispositivos; metas de contraste e frame time mensuradas em staging.
- Distribuição 2/2/1 e metas dos 30 templates ajustáveis, mas três patamares 2/4/5 são decisões confirmadas.
- Nenhum desses testes altera fato de que criador completo e todas quatro regiões fazem parte do primeiro lançamento.

**Esta é a versão inicial completa do inventário textual; a produção de assets e wireframes gráficos finais pertence à implementação artística futura, sem autorização de código neste momento.**
