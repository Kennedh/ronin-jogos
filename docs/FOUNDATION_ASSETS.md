# Assets e dependências da fundação

A cena Bambu em packages/runner-client/src/scene.ts e o rig compartilhado rr-rig-2 em packages/runner-client/src/rig.ts são código original do projeto. A cena usa Graphics do Phaser; o mesmo rig usa Canvas2D na amostra de animação. A marca SVG e a ilustração CSS do hub também foram produzidas no projeto. Não há imagens/sprites/sons copiados de terceiros, assets raster gerados nem fontes externas baixadas. Georgia e fontes de sistema são referências ao sistema do visitante, sem distribuir arquivos de fonte.

Isso não é aprovação da arte final. A parte 2 entrega uma prova de rig/animação para revisão estética; catálogo/arte final permanecem nas partes 6A/6B e o conteúdo de biomas/chefes nas partes 3/4. Nenhuma combinação de arte pode alterar geometria, RNG competitivo ou score. Canvas2D nesta integração mantém desenho leve e não autoritativo; o adaptador admite evolução visual com os mesmos contratos.

A distribuição de desenvolvimento inclui avisos MIT de Phaser, eventemitter3 e helpers de Ajv/ajv-formats/fast-uri em apps/portal/public/third-party.txt. Ajv e o bundler são ferramentas de geração; o browser executa validadores standalone auto-contidos. Preservar avisos/atribuições em qualquer release. A revisão completa de licenças/SBOM e dos assets definitivos continua sendo gate de lançamento.

A parte 3 acrescenta estudos vetoriais em packages/runner-client/src/biomes.ts para Templo, Montanhas, Castelo, corrupção e inimigos. Tudo é código original; nenhum material foi extraído da imagem de referência fornecida pelo proprietário. A referência de 18/11/2026 orienta nanquim colorido e profundidade, sem aprovação do acabamento atual como arte final. Ilustrações, texturas e áudio definitivo continuam na 6B, com rastreabilidade/licenças antes de publicação.

A parte 4 acrescenta quatro estudos originais em boss-render.ts e sinais suplementares sintetizados em boss-sound.ts (Web Audio, sem arquivos de terceiros). Não há extração de sprites ou áudio da referência. Arte, desenho de som e efeito equipado da Aurora ainda exigem acabamento e validação nas partes 6A/6B; conceder o item persistente não equivale a concluir esse catálogo.
