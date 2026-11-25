# ADR 012 — Aparência modular do Ronin

## Decisão

A versão `rr-appearance-1` contém 44 peças em dez slots, com 39 opções básicas para visitantes e contas. O catálogo bilíngue em `@ronin/content/character` identifica a peça, o slot, o rig compatível e a conquista necessária. A API publica o catálogo e calcula o inventário a partir dos selos e recompensas do verificador. A Aurora exige os quatro selos. Cada selo de chefe pode ser exibido no perfil.

A migração 010 armazena a seleção e a versão por jogador. Um perfil anterior à migração ou ainda sem edição lê o padrão com versão 1. O servidor valida as peças e a sessão na transação. A primeira gravação materializa a linha. Uma repetição que já corresponde ao visual salvo é idempotente. Edições divergentes com a mesma versão resultam em conflito e exigem recarregar a seleção antes de salvar.

A promoção do visitante por e-mail ou Google preserva o identificador. Na transferência explícita entre identidades, o jogador pode escolher o visual de origem. A prévia inclui as duas versões e a confirmação detecta alterações concorrentes. O visual integra a exportação privada e é removido na finalização da exclusão.

## Renderização

O criador compõe as peças sobre os pivôs do rig vetorial `rr-rig-2`. Phaser, a prévia com dezoito poses e o retrato de perfil usam a mesma função. A corrida captura o visual do servidor no início. O motor e o protocolo de replay recebem apenas regras, estado e comandos. Uma peça indisponível ou de slot incompatível usa a alternativa padrão daquele slot para renderização.

## Verificação e etapas seguintes

A suíte cobre os pares de peças de slots diferentes nas dezoito poses, a repetição dos mesmos comandos com aparências alternadas, a autorização depois da verificação de chefes, a migração, a fusão, a exportação e a exclusão. Chromium testa a prévia, edição em duas abas, persistência, falha de rede e o pigmento da roupa no canvas da partida.

A parte 6B trata do acabamento artístico e sonoro e da homologação visual. As projeções de missões e os emblemas semanais pertencem às partes 7 e 8 e poderão acrescentar itens ao catálogo.
