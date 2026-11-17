# ADR-003 — Fechamento, janela semanal e publicação transacional

Estado: baseline do plano aceito pelo proprietário em17/11/2026, formalizado na1A. Prazos são configuração de política, não constantes físicas. Nenhum crédito de produção é concedido por este código de fundação.

Run aberta expira72h após started_at certificado pelo servidor. Primeiro finish recebido até expires_at fixa final_hash/final_tick/final_segment_index/end_reason. Se faltam partes, AWAITING_SEGMENTS; o mesmo compromisso pode ser reenviado sem prorrogar prazo e divergência é409. Upload conclui até finish_received_at+24h. Cadeia completa e consistente então vira PENDING; worker passa VERIFYING→VERIFIED ou REJECTED. Falhas transitórias retornam PENDING com backoff; payload incompatível não repete indefinidamente.

O cliente conhece prazos e pode continuar sem ranking quando expiram, sem morte automática nem promessa de sincronização ilimitada. Se finish não chegou no prazo, relógio local não certifica fechamento. Sessão deve ser reautenticada pelo mesmo jogador para retomar; troca de cookie não transfere run. Expiração de sessão e expiração da run são políticas diferentes.

Edição semanal usa started_at em UTC. Runs iniciadas na edição só contribuem se fechamento completo foi recebido até24h após a virada (fim exclusivo). O que precisa chegar nessa graça são finish+segmentos, não o resultado do worker: fila lenta não retira elegibilidade. submitted_complete_at é servidor, imutável e independente de verified_at. Definir intervalos/tolerâncias do relógio em testes1C/8. Histórico pode permanecer em consolidação enquanto jobs elegíveis ainda processam.

end_reason separa sobrevivência/abandono de verification_status. HP_ZERO/ABYSS comprovados podem ranquear; QUIT íntegro pode virar VERIFIED com ranked=false e contar somente cumulativos elegíveis. QUIT não satisfaz missões de término competitivo nem semanais de runs concluídas; métricas cumulativas só se catálogo autoriza explicitamente. ABANDONED/EXPIRED sem replay íntegro nunca concede eventos. Nenhum checkpoint sozinho libera prêmio parcial.

Fila PostgreSQL: claims curtos com SKIP LOCKED, lease, heartbeat e generation/fencing. Simulação fora de transação; conclusão checa lease atual e estado elegível antes de gravar. Checkpoints futuros só do worker, atestados e ligados aos hashes de versão/segmentos. Commit de outcome, projeções de carreira/recompensas/ranking e outbox é atômico e idempotente. Depois de commit+crash, retry não soma outra vez. UNIQUE(run_id,index) impede duas partes divergentes; hash é valor comparado, não parte adicional da chave.

Board de ranking recebe ID não nulo, e best_scores usa(player_id,board_id); evita vulnerabilidade de unicidade composta com NULL. Implementar na1B/7; restrição de run VERIFIED/eligibilidade sob mesma transação. Cursor contém chave completa/filtros/regras e não promete snapshot imutável se houver novas marcas; definir política de leitura na7.

Rate limits, tolerância entre active_ticks e janela wall-time servidor e budgets do verifier são medidos antes de release, sem cap secreto de quilômetros. Budget atual do módulo só valida configuração; não demonstra capacidade da VPS.
