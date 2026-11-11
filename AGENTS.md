# Instruções do projeto para Codex — Ronin Jogos / Ronin Runner

## Estado e autorização — desenvolvimento liberado em 11/11/2026

**AUTORIZAÇÃO EXPRESSA:** o proprietário declarou que o planejamento terminou e que agora é hora de **iniciar o desenvolvimento no Codex**. Portanto, está **autorizado programar** a versão completa, criar estrutura do projeto, testes, migrations de desenvolvimento, core, API, UI e recursos definidos nesta documentação. **Não limitar a versão pública inicial a MVP**: trabalhar de forma incremental sobre arquitetura definitiva e só divulgar quando todos os sistemas definidos estiverem implementados e homologados.

**Continua proibido sem autorização separada:** deploy na VPS/produção, mexer em DNS/Caddy existentes, criar contas externas pagas, usar credenciais de produção, apagar bancos, publicar dados reais, fazer mudanças irreversíveis ou divulgar o jogo como concluído. Antes de executar operações externas, mostrar plano e pedir autorização específica. Trabalhar em branch de desenvolvimento/PR, não alterar main de forma destrutiva.

**Primeira tarefa do Codex:** ler as fontes abaixo, revisar brevemente inconsistências contratuais e então iniciar a implementação de fundação/contratos/core determinístico/CI conforme o roteiro, registrando decisões técnicas como ADRs. Não ficar preso apenas reescrevendo documentação: produzir código testável nesta fase.

## Fonte de verdade e ordem de leitura

1. `docs/RONIN_RUNNER_SPEC.md` — decisões de produto e escopo.
2. `docs/RONIN_RUNNER_AUDITORIA_ALINHAMENTO_CODEX.md` — lacunas, prioridades e critérios para fechamento.
3. `docs/RONIN_RUNNER_PREPARACAO_CODEX.md` — estratégia de trabalho e handoff.
4. `docs/RONIN_RUNNER_MOVIMENTACAO_COMBATE.md` — física/controles.
5. `docs/RONIN_RUNNER_INIMIGOS_CHEFES_OBSTACULOS.md` + `docs/RONIN_RUNNER_CHEFES_RECOMPENSAS.md` — conteúdo e regras dos chefes.
6. `docs/RONIN_RUNNER_PROGRESSAO_MISSOES.md` + `docs/RONIN_RUNNER_DESAFIOS_SEMANAIS.md` — progressão e calendário autônomo.
7. `docs/RONIN_RUNNER_INTERFACE_PERSONAGEM_RONIN_ID.md` + `docs/RONIN_RUNNER_PERSONAGEM_ANIMACOES_VALIDACAO.md` — UX, perfil e rig.
8. `docs/RONIN_RUNNER_CONTRATOS_API_PERSISTENCIA.md` — contratos e esquema lógico.
9. `docs/RONIN_RUNNER_SEGURANCA_PARTIDAS.md` — replay, segurança e limites.
10. `docs/RONIN_RUNNER_TESTES_LANCAMENTO.md` — matriz E2E, testes e gates.

Se um documento antigo parecer contradizer uma decisão confirmada mais recente do usuário, registrar e alinhar a documentação antes de implementar. **Números rotulados PROPOSTO/TUNABLE não são decisões confirmadas**; configurar por rules_version e fechar por playtest, sem inventar metas de produção.

## Requisitos já confirmados e inegociáveis

- **Versão pública inicial completa**, com quatro regiões, ciclos infinitos de corrupção, quatro chefes, missões, semanais, personalização, identidade e rankings; desenvolvimento incremental sobre arquitetura final, nunca mini-MVP descartável.
- **Três vidas e nenhuma recuperação de vida**, abismo sempre fatal; salto duplo universal desde o início.
- Chefes **podem recuar**, sem bloquear a corrida; quatro selos de chefes desbloqueiam `Traço da Aurora`, efeito apenas visual.
- Mobile em paisagem com **gestos como controles principais**, pedir fullscreen quando possível, fallback responsivo; desktop teclado.
- Jogo e interface localizados **pt-BR e en**, inclusive conta, e-mails, semanais e erros.
- **Ronin ID**: visitante com apelido, cadastro por e-mail/senha e Google desde o lançamento; vínculo/mesclagem segura, visitante no ranking mundial conforme modo.
- **Criador de Ronin modular completo**: cabelo, rosto, tom de pele, roupas, acessórios, katana. **Aparência básica livre**, inclusive visitantes; itens especiais desbloqueáveis por progresso, nunca atributos de vantagem.
- Semanários **autogerados sem trabalho manual**, selos de edição **Bronze 2/5, Prata 4/5 e Ouro 5/5**. Missões não dão vantagem competitiva.
- **Verificação de score pelo servidor**, replay de inputs com regras determinísticas e versionamento, transações/idempotência; replay físico não garante detectar bots inteligentes.
- Proposta de stack: Phaser 4/TypeScript/Vite, Node.js/Fastify, PostgreSQL, Caddy na VPS; sem dependência de IA paga. Arte/som originais ou licenciados adequadamente.

## Regra de contribuição após autorização

- Priorizar contratos corretos, testes automatizados, acessibilidade e segurança desde a primeira fatia vertical; nunca aceitar falso score do cliente.
- Não criar funcionalidades falsas ou temporárias que serão descartadas; dados persistentes em banco desde implementação do backend.
- Nunca exigir login para iniciar a primeira corrida; convidado e conta terão mesmas regras de física.
- Toda personalização deve manter a mesma hitbox/alcance/velocidade e mesmos resultados de replay; catálogos autorizados pelo servidor.
- Cada mudança de gameplay que afete competição passa por `rules_version`, migração/retrocompatibilidade explicitada e testes.
- Nenhum segredo, token de usuário, senha ou dado pessoal de produção deve entrar em código, commit ou log.
- Scripts e páginas de jogos precisam funcionar em PT-BR/EN; respeitar SEO e identificação do Ronin Play quando os contratos correspondentes estiverem fechados.
- Não anunciar recurso como concluído sem evidência de teste e sem considerar os gates no documento de lançamento.

## Baseline completo v0.18 — leia antes de tomar decisões de arquitetura

Além dos documentos anteriores, o planejamento agora possui baseline de todas as lacunas G01–G15:
- [Simulação determinística, partidas longas e rankings](docs/RONIN_RUNNER_CONTRATO_SIMULACAO_PARTIDAS_RANKING_v1.md);
- [Identidade, dados, privacidade e APIs](docs/RONIN_RUNNER_CONTRATO_IDENTIDADE_DADOS_PRIVACIDADE.md);
- [Arte, telas, conteúdo e 30 templates semanais](docs/RONIN_RUNNER_ARTES_TELAS_CATALOGO_CONTEUDO_v1.md);
- [VPS, Ronin Play, operação e desempenho](docs/RONIN_RUNNER_OPERACAO_VPS_PORTAL_TESTES_v1.md);
- [OpenAPI 3.1 PRELIMINAR](docs/openapi.ronin-runner.v1.yaml);
- [Matriz de aceite G01–G15 e handoff](docs/RONIN_RUNNER_MATRIZ_ACEITE_E_EXECUCAO_v1.md).

**Precedência:** escolha expressa do usuário > especificação principal > novos contratos baseline v0.18 > propostas numéricas antigas. Não reabrir decisões explícitas. `BASELINE` é padrão proposto, não aprovação expressa; `TUNABLE` depende de playtest/benchmark. OpenAPI é draft e não está implementada nem validada em CI.

**A autorização para implementar FOI DADA em 11/11/2026.** O Codex pode escrever código e testes imediatamente em branch de trabalho, usando a arquitetura completa e os gates de qualidade. **O lançamento público e mudanças de infraestrutura ainda exigem aprovação específica.** `BASELINE/TUNABLE` podem ser ajustados com testes e ADRs, sem alterar decisões explícitas de produto.

## Primeiro passo de desenvolvimento

1. Abrir a [matriz v0.18](docs/RONIN_RUNNER_MATRIZ_ACEITE_E_EXECUCAO_v1.md) e os contratos, consolidar ADRs e pendências que impactem schemas; **sem reabrir decisões explícitas do produto**.
2. Criar estrutura TypeScript e ambiente de desenvolvimento/staging local com core determinístico, testes e ferramenta de validação do OpenAPI draft; não conectar produção.
3. Implementar no primeiro ciclo uma fatia vertical executável que use desde o princípio os **módulos definitivos**: cliente Phaser, core, contrato de run, API e replay/verificação, persistência real em Postgres de desenvolvimento. Continuar por etapas até completar quatro regiões, chefes, identidade, criador, semanas e ranking.
4. Executar testes e criar PR com resumo, evidências, limitações e próximos itens; **não afirmar que o produto está completo** antes de passar todos os gates.

**Política de divergência:** se um baseline técnico precisar de ajuste por impossibilidade/segurança, registrar ADR e alternativa sem inventar regras de produto. Pedir decisão somente sobre mudanças relevantes no produto ou serviços externos, não sobre detalhes banais de implementação.
