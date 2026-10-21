# Plan

Restaurar a publicação diária eliminando o limiar arbitrário que descarta pautas válidas do Search Console e ampliando o estoque editorial de segurança, sem adicionar chamadas de IA. A validação cobre seleção determinística, fluxo local, Preview Vercel e uma publicação real persistida e pública.

## Scope
- In: resolvedor de keyword, catálogo-reserva, testes de regressão, PR, deploy e comprovação E2E publicada.
- Out: retrigger pago antes de autorização e mudanças no gerador do artigo depois da escolha da pauta.

## Action items
[x] Registrar o vetor de produção: calendário sem pautas, seis seeds publicadas e `keyword_not_resolved` em 21/10.
[x] Alterar a seleção GSC para aceitar a melhor consulta inédita elegível mesmo quando houver menos de cinco opções.
[x] Ampliar o catálogo-reserva com pautas específicas e úteis para clientes mineiros, preservando a proibição de repetir keyword publicada.
[x] Adicionar regressões para uma única consulta GSC elegível e para disponibilidade do novo estoque após o catálogo antigo acabar.
[x] Rodar testes focados e `mac-gate npm run preflight:ci`, revisar o diff e publicar um único PR.
[ ] Confirmar Vercel Preview verde, integrar, acompanhar produção e validar artigo persistido mais URL pública HTTP 200.

## Open questions
- Nenhuma; o retrigger manual pago permanece fora do escopo sem autorização explícita.
