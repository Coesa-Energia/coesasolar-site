# Autoblog Workflow Step Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir que a falha de uma seção refaça estrutura e seções já concluídas, preservando o erro causal e reduzindo chamadas pagas repetidas.

**Architecture:** Separar o step monolítico `generateStructureAndSectionsStep` em um step de estrutura e um step por seção. Reusar `generateArticleStructure`, `writeSection`, `enrichSectionBriefs` e `assembleArticleMarkdown`; adicionar apenas um montador puro compartilhado para manter o formato atual de `ArticleWithSections`.

**Tech Stack:** TypeScript, Vercel Workflow DevKit v4, Vitest, OpenRouter já configurado.

**Spec:** Incidente de produção de 30/09/2026: duas execuções do workflow terminaram em `deepseek_structure_failed`; os logs mostram estrutura válida em 133s antes da falha e retry posterior da estrutura, provando que o step combinado descartou trabalho concluído e mascarou a falha anterior.

## Global Constraints

- Não adicionar dependência nem modelo/provider.
- Não acionar geração real ou API paga durante validação.
- Typecheck, lint e testes rodam no Mac somente via `~/.local/bin/mac-gate`.
- `next build` roda apenas no Vercel Preview.
- Uma seção fora de 400–700 palavras continua fail-closed após retries limitados.

## Review Focus

- Falha de uma seção deve retentar somente essa seção; teste source-based fixa a fronteira de steps.
- Estrutura bem-sucedida deve ser persistida antes das seções; teste direto fixa `saveOutlineStructure` no step de estrutura.
- Todas as seções devem manter execução paralela; teste/source assertion fixa `Promise.all` sobre `writeSectionStep`.
- O artigo montado deve manter `content`, `bodies`, `structure` e prompts de imagem; teste unitário fixa o helper puro.
- Erro terminal precisa mencionar a seção causal; `writeSection` existente já preserva H2 e contagem no erro.

---

### Task 1: Extrair montagem pura e preservar contrato

**Files:**
- Modify: `src/lib/blog/deepseek.ts`
- Test: `src/lib/blog/deepseek.regression.test.ts`

**Interfaces:**
- Consumes: `ArticleStructure`, `string[]` de corpos.
- Produces: `buildArticleFromSections(structure, bodies): ArticleContent & { sectionImagePrompts: string[]; structure: ArticleStructure; bodies: string[] }`.

- [x] **Step 1: Escrever o teste do montador**

Adicionar um teste que monta duas seções e verifica `content`, `structure`, `bodies` e `sectionImagePrompts` sem chamar API.

- [x] **Step 2: Rodar o teste e confirmar falha**

Run: `~/.local/bin/mac-gate npx vitest run src/lib/blog/deepseek.regression.test.ts`

Expected: FAIL porque `buildArticleFromSections` ainda não existe.

- [x] **Step 3: Extrair a implementação mínima**

```ts
export function buildArticleFromSections(structure: ArticleStructure, bodies: string[]) {
  return {
    title: structure.title,
    page_title: structure.page_title,
    slug: structure.slug,
    meta_desc: structure.meta_desc,
    image_prompt: structure.cover_image_prompt,
    cover_alt: structure.cover_alt,
    category: structure.category,
    content: assembleArticleMarkdown(structure, bodies),
    sectionImagePrompts: structure.sections.map(section => section.image_prompt),
    structure,
    bodies,
  };
}
```

Fazer `generateArticleWithSections` retornar esse helper para haver uma única montagem canônica.

- [x] **Step 4: Rodar o teste e confirmar sucesso**

Run: `~/.local/bin/mac-gate npx vitest run src/lib/blog/deepseek.regression.test.ts`

Expected: PASS.

### Task 2: Isolar estrutura e seções em steps duráveis

**Files:**
- Modify: `src/workflows/generate-article.ts`
- Test: `src/workflows/generate-article.regression.test.ts`

**Interfaces:**
- Consumes: `generateArticleStructure`, `writeSection`, `enrichSectionBriefs`, `buildArticleFromSections`.
- Produces: `generateStructureStep(...)` e `writeSectionStep(...)`, cada um com retry próprio.

- [x] **Step 1: Atualizar mocks e escrever regressão do incidente**

O teste deve provar que o workflow chama uma vez a estrutura, chama uma vez cada seção e monta o artigo; uma assertion source-based deve impedir o retorno de `generateStructureAndSectionsStep`.

- [x] **Step 2: Rodar o teste e confirmar falha**

Run: `~/.local/bin/mac-gate npx vitest run src/workflows/generate-article.regression.test.ts`

Expected: FAIL porque o workflow ainda usa o step combinado.

- [x] **Step 3: Implementar os dois limites de retry**

```ts
export async function generateStructureStep(keyword: string, links: InternalLink[], brief: EditorialBrief | null) {
  'use step';
  const structure = await generateArticleStructure(keyword, links, brief);
  await saveOutlineStructure(keyword, JSON.stringify(structure)).catch(() => {});
  return structure;
}
generateStructureStep.maxRetries = 1;

export async function writeSectionStep(keyword: string, section: ArticleSection, index: number, total: number) {
  'use step';
  return writeSection(keyword, section, index, total);
}
writeSectionStep.maxRetries = 1;
```

No workflow, enriquecer a estrutura, executar `Promise.all(structure.sections.map(writeSectionStep))` e chamar `buildArticleFromSections`.

- [x] **Step 4: Rodar regressões pontuais**

Run: `~/.local/bin/mac-gate npx vitest run src/workflows/generate-article.regression.test.ts src/lib/blog/deepseek.regression.test.ts`

Expected: PASS e nenhuma chamada externa real.

### Task 3: Validar gates e Preview

**Files:**
- Verify: `package.json`, `.github/workflows/*`, `vercel.json`

**Interfaces:**
- Consumes: diff final.
- Produces: evidência local sem build e Vercel Preview verde.

- [x] **Step 1: Rodar testes e lint pelo mac-gate**

Run: `~/.local/bin/mac-gate npm test -- --run && ~/.local/bin/mac-gate npm run lint`

Expected: zero falhas.

- [x] **Step 2: Revisar o diff final**

Run: `git diff --check && git status --short`

Expected: apenas plano, implementação e regressões deste incidente.

- [ ] **Step 3: Enviar branch e conferir Vercel Preview**

O Preview deve concluir `Ready`; nenhum `next build` local ou em GitHub Actions.

## Revisão em loop

- Passada 1: removida a ideia de apenas aumentar timeout. Isso prolongaria o step monolítico, repetiria chamadas pagas e continuaria mascarando o primeiro erro.
- Passada 2: melhoria substancial — persistir a estrutura dentro do step de estrutura, antes das seções, para manter evidência mesmo quando uma seção falhar.
- Passada 3: nenhuma melhoria substancial. A divisão estrutura/seção já é a menor fronteira durável útil; separar montagem pura em step adicionaria persistência sem I/O e sem ganho.
- Passada 4: nenhuma melhoria substancial. Alterar ordem/modelos foi descartado: não é necessário, muda roteamento pago e não corrige o retry grosseiro.

## Revisão da implementação

- Passada 1: melhoria substancial — o enriquecimento determinístico foi movido para o step de estrutura. Assim, o cache e `saveOutlineStructure` preservam exatamente a estrutura completa usada pelas seções.
- Passada 2: nenhuma causa relevante restante. Falhas de estrutura e de seção agora têm fronteiras e retries independentes; montagem e publicação continuam sem mudança de contrato.
- Passada 3: nenhuma causa relevante restante. Timeout, resposta vazia e tamanho inválido continuam cobertos pelos retries internos existentes, sem refazer unidades concluídas.
