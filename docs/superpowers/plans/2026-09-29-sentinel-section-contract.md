# Sentinel: seção curta no autoblog Coesa

**Objetivo:** nunca publicar artigo cuja seção editorial fique fora de 400–700 palavras.

## Evidência do incidente

- Artigo `e92e1a3b-d38c-4989-bb6a-4a5521a4d991` publicou a seção “Quanto um comércio...” com o próprio `content_brief` (~58–77 palavras).
- `writeSection` retenta três vezes, mas depois retorna o melhor texto inválido ou o brief curto.
- O validador final verifica quantidade de H2 e total do artigo, não a contagem real de cada seção.

## Plano executável

1. Em `src/lib/blog/deepseek.ts`, fazer `writeSection` lançar depois de três respostas fora da faixa ou vazias; não devolver conteúdo sabidamente inválido.
2. Preservar os três retries e a alternância de modelo já existentes; não adicionar chamadas pagas.
3. Em `src/lib/blog/deepseek.regression.test.ts`, substituir expectativas fail-open por regressões que exigem rejeição terminal e mantêm o caso válido.
4. Rodar teste pontual; depois, via `mac-gate`, ESLint do diff, typecheck e suíte completa. O lint global tem débito preexistente e o script `preflight` inclui build proibido no Mac.

## Revisão em loop

- Passada 1: removida a proposta de duplicar a contagem no validador final. O produtor já conhece a seção exata; falhar ali é menor e evita gerar imagens para artigo inválido.
- Passada 2: nenhuma melhoria substancial. Novo modelo/retry foi descartado por custo e por não corrigir o contrato fail-open.
- Passada 3: nenhuma melhoria substancial. O comportamento correto é manter o dia sem artigo e permitir retry operacional, não publicar conteúdo quebrado.
- Revisão da implementação, passada 4: melhoria substancial — o chamador ainda convertia a exceção em `content_brief`; removido o `catch` para a falha abortar o artigo.
- Passadas 5 e 6: nenhuma melhoria substancial. `Promise.all` já propaga a falha e o teste cobre o contrato de ponta a ponta.
