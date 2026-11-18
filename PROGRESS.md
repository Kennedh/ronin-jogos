# Ronin Runner — continuidade

## Estado atual — parte 4

Implementada em `feat/runner-bosses-4`, base `390dab9`/PR #7, em 18/11/2026. Autorização: “Iniciar parte 4”. PRs anteriores seguem empilhados, sem merge automático/fechar Issue #1. Sem produção, VPS, DNS, contas externas ou alteração em Ronin/Arquivos. Arte atual é estudo original; nanquim colorido permanece a direção do acabamento.

## Entregue

- Major 4 / physics rr-physics-0.4.0 / generator rr-boss-director-4 / scoring rr-score-boss-4 / assets rr-boss-study-4. V1–V3 continuam executáveis com estados e traces preservados. Perfil físico/hitbox/controles da v3 mantidos; v4 fixa também comprimentos certificados.
- Quatro encontros por ciclo: Raiz Negra, Guardião do Sino, Espírito da Nevasca e Senhor do Eclipse. Fases completas de aviso/entrada/ataque/abertura/vitória ou retirada/saída. Corredores seguros sem abismos, distância contínua, ataques evitáveis sem atacar. B03 tem alvos aéreos; B04 tem investida anunciada.
- Baseline da especificação: 5/6/8/9 oportunidades, 3/4/5/6 acertos e bônus 300/450/600/900. Um hit por abertura; normal conta, perfeito recebe regra anterior. Chefe não conta como inimigo comum. Acerto no tick-limite vence retirada; abismo fatal prevalece antes de ataques. Sem cura/reset de concentração pela transição.
- Estado de tick com tamanho constante no número de encontros; ledger reconstruído pelo worker, nunca vindo do cliente. Migration nova 004, anteriores intactas. Outcome/eventos/selos/conquistas iniciais/Aurora/regiões/outbox na mesma transação idempotente. Lock por player protege concessões concorrentes.
- Quatro selos podem vir de sessões/expedições distintas legitimamente desbloqueadas; Traço da Aurora e Guardião das Quatro Trilhas são permanentes/únicos por identidade interna. Lenda do Caminho exige quatro tipos na mesma FULL. QUIT íntegro concede cumulativos, sem ranking. Creator/equipamento do rastro é 6A; arte/áudio definitivos são 6B; demais missões/rankings continuam 7.
- GET /me/bosses privado; RunStatus.boss_results agregado somente em VERIFIED. HUD PT/EN de energia/aberturas/contrajogada e resultado confirmado por chefe. Consulta de selos e cues sonoros originais opcionais, sem botões novos de combate.

Leia [ADR010](docs/adr/ADR-010-CHEFES-E-SELOS.md), ADR009 e ADR008; ADR001–007 e especificações preservam as decisões anteriores.

## Evidências

`npm ci` e `npm run verify` aprovados localmente: **100 testes de unidade/integração +33 de navegador**, zero falhas/skips; contratos/geração/typecheck/lint/formato/build. Logs privados artifacts/phase-4-install.log e phase-4-verify-final.log. CI Windows/Linux deve ser consultada no commit final e registrada no PR, sem presumir aprovação a partir do teste local.

- Esquiva sem atacar nos quatro chefes, duas classes de seed, ciclos 1/2/3/4/5/6/50 e margem ±3 ticks: 168 trajetórias, cobrindo os três padrões de ordem no teto. Vitórias em 28 encontros complementares, aberturas fechadas, instância única, pausa, zero cura, três ataques esgotando HP e abismo durante i-frames.
- Duas jornadas completas de vitórias/16 km (8 eventos únicos, bônus 4500) e cinco ciclos mistos/40 km (20 eventos únicos, 10 vitórias/10 retiradas), sem perda de continuidade. São provas concretas desses trajetos, não exploração exaustiva de toda ação humana.
- Integração HTTP/Postgres/worker real: replay desde zero, mesmo state_hash/score; falha de outbox faz rollback integral de outcome/ledger/selos/Aurora; retry não duplica. Concessões em sessões regionais distintas, incluindo dois selos finais verificados concorrentemente, concedem Aurora uma vez. Regional não concede Lenda. Finish malicioso/replay inválido não concedem itens; progresso de outro visitante permanece privado.
- Paridade v4: **19212 estados**, quatro vitórias e quatro retiradas, Node/Chromium local 157 em 30/60/120. Trace: 4dfdb4e8456c45c527e04d51a9576212ed66947311131e689ef6f6c67c8042b8. V1: 0481dd7bcf1f468aca5e64a1013903cc631e4a3aad91377fbc7016a8d47733cc; V2: 9c7d64bf83fa2b6427def78d3c2accf0e8ca4ce9c374a9b947501fd3265251ef; V3: f2eb7c113e7d876b63a049628f54b0dc48d755fb2e41c9d5b4f670121dcd613f.
- Browser usa dist/CSP/API/DB/worker reais. PT desktop percorre até o primeiro chefe com relógio normal (~160 s), teclado real, vitória/verificação/selo, captura de página e asserção dos pixels do PNG. EN mobile faz o mesmo fluxo com relógio virtual e captura direta dos pixels do canvas, sem overflow/erro/CSP. Hash local ao encerrar confere com servidor. Fonte/cores do papel/wash preservadas. A comparação usa swatch independente com as cores/opacidade aprovadas: Chromium 157 e 159 arredondam um canal do wash de modo diferente, reproduzido em QA; igualdade de pixels permanece exata.
- O compositor com relógio virtual produziu página preta apesar de canvas correto: captura virtual é só diagnóstico, não aceite visual. Imagens aceitas incluem live-boss-pt-br.png (página com relógio normal) e live-canvas-en.png (pixels reais). Quatro study-*.png vêm de fixture privada com prefixos reexecutados, sem criar score. Não entram no dist. Regressões anteriores de rede, pausa, preview, remapeamento/gestos e regiões estão incluídas.

Auditoria runtime: zero ocorrências em phase-4-runtime-audit.json. OpenAPI 0.24 válido com 19 avisos; chunk lazy Phaser ~1379 kB/362 kB gzip, controlador ~293 kB/43 kB gzip, shell ~29 kB/11 kB gzip. Avisos de budget/picomatch dev não foram escondidos (ADR004). Hashes dos sete arquivos do dist aprovado e evidências privadas em artifacts/phase-4-evidence.json; não reconstruir depois do gate e chamar o novo artefato de testado.

## Próxima etapa e limites

**Parte 5A, somente após novo pedido:** conta e-mail, confirmação/reset/sessões/reauth, transporte local de teste, tokens únicos, enumeração/CSRF e traduções. Ler AGENTS/PROGRESS/ADR001–010 e contratos de identidade. Google/vínculo/merge são 5B. Não iniciar SMTP externo, DNS, Google ou produção por inferência.

Ainda faltam Ronin ID completo, Creator/equipamento cosmético, arte/áudio finais, missões/rankings/semanas completas, offline durável/retention e operação pública homologada. Emulação/relógio de teste não substituem Safari/aparelhos físicos, reação humana ou playtest. Replay íntegro não prova jogador humano.

## Comandos

`npm ci`; `npm run verify`. Para jogar: `npm run db:dev` (aguardar migration 004 e pronto), `npm run dev:api`, `npm run dev:verifier`, `npm run dev`, em terminais separados. http://127.0.0.1:5173/roninrunner/pt-br ou /roninrunner/en. Não alternar localhost. DB sintético 15432, API 3001. Ctrl+C preserva banco dev; QA remove somente clusters próprios.

Após OpenAPI: `npm run contracts:generate`. Testes dirigidos: `node --test tests/bosses.test.ts tests/boss-runtime.test.ts`; browser exige build antes (verify faz a ordem). Teste PT de chefes usa relógio normal e leva alguns minutos. Sem Chromium: `npx playwright install chromium`; Linux pode precisar de --with-deps. Nenhum comando desta fase publica o jogo.
