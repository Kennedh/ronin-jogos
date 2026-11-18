# ADR-008 — Combate, concentração e rig compartilhado (parte 2)

Estado: implementação técnica em branch `feat/runner-combat-2`, base `ffe946c`/PR #5, autorizada pelo pedido “Iniciar parte 2”. Sem merge, publicação ou mudança em infraestrutura. A aprovação estética da amostra pertence ao proprietário; os testes não a substituem. Complementa ADR001–007 e o plano por partes, preservando o escopo público completo.

## Regras e compatibilidade

Nova major competitiva 2, physics `rr-physics-0.2.0`, generator `rr-combat-course-2` e assets `rr-rig-2`. Score permanece a fórmula `rr-score-1`: 10 por metro inteiro, 30 por inimigo comum eliminado e 100 por corte perfeito; zero multiplicador de combo, cura ou bônus por especial. API local inicia novas runs com COMBAT_MANIFEST. Manifest/ticket antigos continuam append-only e carregáveis. Nenhuma migration é necessária; os manifests já são JSON versionados no banco e os estados/replays não vêm do cliente.

V1 mantém sua configuração e forma exata de SimState, sem acrescentar nem mesmo campos combat zerados. O core despacha o comportamento novo pela versão compilada; registry recusa misturar major/generator/physics. Verificador e cliente escolhem o mesmo curso pelo manifest histórico. As suítes legadas de API/cliente estão explicitamente fixadas na fundação v1; novas suítes usam major 2. Não atualizar golden antigo para disfarçar uma quebra. A paridade legada conserva o trace 0481dd7bcf1f468aca5e64a1013903cc631e4a3aad91377fbc7016a8d47733cc.

A publicação futura de uma major em serviço público segue política de virada/compatibilidade; esta escolha somente inicia o desenvolvimento local, onde não há ranking público nem jogadores reais. Rig visual novo não modifica física dos replays v1. Histórico de arte final/cache/SBOM terá gate próprio antes do lançamento.

## Semântica de combate

Estado combat contém concentração, sequência perfeita, melhor sequência, especiais, erros e flags do ciclo de ataque. É clonado a cada tick; pausa/countdown não o alteram. Ataque mantém windup 4, active 7 e recovery 11, overlap vertical, salto/duplo salto e exclusão do slide. Os mesmos comandos JUMP/SLIDE/ATTACK permanecem no codec; não há comando arbitrário SPECIAL enviado pelo browser.

Baseline de playtest: perfeito +12, comum +3, teto 100. Uma sequência conta no máximo uma vez por ataque, mesmo que haja vários contatos perfeitos; contadores de perfects e concentração continuam por contato legítimo, único por inimigo. Comum interrompe a sequência perfeita na baseline (`normalBreaksCombo=1`); alternativa 0 possui teste explícito para avaliação, sem trocar silenciosamente a regra da run. Um golpe sem qualquer contato encerra a sequência após a janela ativa, uma vez, e mantém a concentração. Inputs ignorados por recovery/slide não geram ataques ou erros extras. Dano não concede nem retira concentração e não cura.

Ao iniciar um ataque com concentração 100, arma-se o especial para o primeiro contato válido desse ataque. Se errar, mantém 100. Atingir 100 durante um golpe habilita somente um ataque posterior. No contato armado: consome 100, gera SPECIAL e uma única varredura frontal/vertical delimitada (220 unidades baseline; espada comum 140). Elimina somente ENEMY elegível, vulnerável e ainda não resolvido, sem atravessar a geometria de alcance, atingir atrás/acima ou destruir obstáculos. Não há imunidade, stun, mudança de velocidade nem proteção de abismo. Alvos secundários geram SPECIAL_HIT e +30 por eliminação; não geram novos perfects, concentração recursiva ou multiplicadores. A identidade resolvida impede prêmios repetidos.

Vulnerability opcional no contrato de entidade usa [start,end) em ticks; elegibilidade de especial é explícita. São primitivas para composição dos inimigos/chefes das partes 3/4, não implementação antecipada dos seus comportamentos. Ataque comum/perfeito e especial respeitam a janela; entidades antigas sem essa restrição mantêm o comportamento anterior. Abismo fatal continua resolvido antes de qualquer acerto do tick fatal e ignora i-frames/especial pronto.

## Curso e telegraph

O curso continua a geometria primitiva da fundação; o diretor e as quatro regiões são parte 3. Major 2 acrescenta instante ideal reproduzível ao inimigo comum: posição em que a distância até a frente do corpo é metade do alcance da espada, usando viagem inteira e ceil com BigInt. O índice é global, independente do recorte de streaming; janelas sobrepostas retornam a mesma entidade/idealTick. O círculo sobre o inimigo muda forma/tamanho/traço dentro de ±6 ticks, mantendo a pista com reduced motion; não depender apenas da cor. FOV, dificuldade e latência humana ainda são calibráveis por playtest em aparelhos físicos. O teste automatizado que reage à geometria não é prova de dificuldade apropriada para humanos.

## HUD e controles

Faixa fora da cena mostra concentração 0–100, sequência e especial pronto; feedback localizado de acerto, perfeito, golpe vazio, especial e dano. Feedback usa eventos recentes limitados (até 64/60 ticks), com preferência para o evento mais novo e prioridade somente em empate. Não cria score nem conquista no DOM. Resultados oficiais continuam vindo da verificação do replay; projeções de carreira/ranking/missões/recompensas chegam na parte 7.

Atalhos JUMP/SLIDE/ATTACK remapeáveis por KeyboardEvent.code, salvos como preferência do dispositivo. Aceitam letras, números, setas e Espaço; recusam duplicatas, Escape e teclas de navegação/sistema. Escape continua pausa. Campos permitem Tab; key repeat e comandos durante edição/pausa continuam bloqueados. Restaurar padrões é funcional. Botões de toque e gestos continuam usando o mesmo input do próximo tick. Preferências/estudo ficam ocultos na corrida, sem alterar regras ou roubar espaço da cena.

## Rig e amostra para revisão

`runner-client/rig.ts` é um rig vetorial original e puro, composto em camadas com pivôs de pé/quadril/ombro/cabeça/punho/bainha. DrawRig usa uma pequena interface Brush: Phaser Graphics na corrida e Canvas2D na amostra usam o mesmo desenho. Física não importa renderer/Phaser nem recebe opções de roupa. Pose separa locomoção e ação superior, permitindo ataque aéreo; versões de pele/roupas e autorização de inventário continuam na parte 6, sem seletor falso de itens.

Há poses de idle/corrida, impulso/ápice/duplo salto/queda/pouso, entrada/loop/saída de slide, preparação/active/recovery, perfeito/especial, dano e dois motivos de morte. Marcas e efeitos são visuais, não movem ticks/hitboxes. Reduced motion reduz os movimentos cosméticos e mantém as pistas críticas. O painel “Estudo de animação do personagem” permite animar/congelar, trocar pose e mostrar pivôs/colisão; há margem para o alcance inteiro do especial e limpeza do canvas/RAF ao fechar/iniciar corrida/unload. Retorno persistido pelo histórico recria o canvas quando necessário, sem deixar uma prévia vazia.

É prova de rig/animação para revisão estética, não catálogo, criador persistente nem arte final aprovada. Contagens de peças e arte final continuam 6A/6B. Licenças/originalidade: FOUNDATION_ASSETS.md; nenhuma imagem, fonte ou material de terceiros novo foi baixado.

## Evidências e limites

Testes novos: regras/manifest antigo e novo, ganho/teto/erro, comum alternativo, sequência por ataque, especial curto/elegibilidade/overlap/IDs únicos, próximo golpe somente, janela inclusiva/exclusiva, dano/abismo/pausa, telegraph por janelas, remapping e rig sem mutação. Suíte real de PostgreSQL gera comandos legais até ganhar 100 e ativar especial, encerra via API e verifica o mesmo state_hash/score pelo worker, sem confiar no cliente. As contagens de combate ficam auditáveis no replay/hash, sem simular concessão de missão.

Paridade major 2 compara 600 estados em Chromium/Node a 30/60/120; trace 9c7d64bf83fa2b6427def78d3c2accf0e8ca4ce9c374a9b947501fd3265251ef. Navegador serve dist com CSP/API/DB/worker reais, ganha um perfeito por teclado e por toque, valida HUD/pausa/resultado, remapping persistido/rejeição de duplicata, prévia com pixels alterados e congelados, troca de pose, limpeza e restauração persistida. Suíte 1D inteira preservada. Instalação limpa/gate completo, capturas e contagens em PROGRESS.md; CI final deve ser conferida por commit.

Sem afirmar aparelhos reais/Safari, FPS universal, equilíbrio competitivo aprovado, arte aprovada ou jogo público completo. Número e formato de slots/pivôs/artes finais ainda exigem revisão. Nenhum deploy/DNS/VPS/Google/Ads nem alterações nos outros sites. Próxima parte 3 depende de novo pedido e trata diretor procedural, regiões/ciclos/arquétipos; este PR não a inicia.
