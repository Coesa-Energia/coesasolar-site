import { expect, test } from '@playwright/test'

const legacyLinks = [
  '/desconto-na-conta-de-luz-minas-gerais',
  '/como-verificar-conta-de-energia',
  '/distribuidoras',
]

test('todas as rotas do sitemap abrem e os links internos resolvem', async ({ page, request }) => {
  test.skip(test.info().project.name === 'mobile', 'O percurso de rotas é igual nos dois layouts')
  test.setTimeout(180_000)

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBe(true)
  const paths = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
  expect(paths.length).toBeGreaterThanOrEqual(6)
  const links = new Set<string>()

  for (const path of paths) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), path).toBe(200)
    await expect(page.locator('h1').first(), path).toBeVisible()
    for (const href of await page.locator('a[href^="/"]').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')).filter(Boolean) as string[])) {
      links.add(new URL(href, page.url()).pathname)
    }
  }

  if (process.env.AUDIT_ALL_LINKS === '1') {
    for (const path of links) {
      const response = await request.get(path)
      expect(response.status(), `Link interno ${path}`).toBe(200)
    }
  }
})

test('redireciona links antigos para artigos existentes', async ({ request }) => {
  for (const path of legacyLinks) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(308)
    expect(response.headers().location, path).toMatch(/^\/blog\//)
  }
})

test('CTAs, formulário, calculadora, sol e FAQ respondem', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(800)

  if (test.info().project.name === 'mobile') {
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await page.getByRole('button', { name: 'Simular Economia', exact: true }).first().click()
  } else {
    await page.getByRole('button', { name: 'Simular', exact: true }).click()
  }

  const dock = page.getByRole('complementary', { name: 'Formulário de simulação' })
  await expect(dock).toBeVisible()
  await dock.getByRole('button', { name: 'Simular Economia' }).click()
  await expect(dock.getByText('Selecione a concessionária')).toBeVisible()
  await dock.getByRole('button', { name: 'Fechar simulação' }).click()

  const bill = page.getByRole('textbox', { name: 'Quanto você paga de luz por mês?' })
  await bill.fill('29900')
  await expect(page.getByText('A conta precisa ser de pelo menos R$ 300,00 por mês para simular.')).toBeVisible()
  await bill.fill('50000')
  await expect(page.getByText('Economia mensal estimada')).toBeVisible()

  await page.getByRole('button', { name: 'Noite' }).click()
  await expect(page.getByRole('button', { name: 'Reproduzir passagem do sol' })).toBeVisible()
  await page.getByRole('button', { name: 'O que é energia solar por assinatura?' }).click()
  await expect(page.getByRole('region', { name: 'O que é energia solar por assinatura?' })).toBeVisible()
})

test('CTA de Minas leva ao formulário da home', async ({ page }) => {
  await page.goto('/energia-solar-por-assinatura-minas-gerais')
  await page.getByRole('link', { name: 'Simular minha economia' }).click()
  await expect(page).toHaveURL(/\/#simulacao$/)
  await expect(page.getByRole('region', { name: 'Formulário da simulação' })).toBeVisible()
})

test('simulação válida confirma envio sem criar lead real', async ({ page }) => {
  test.skip(process.env.AUDIT_ALL_LINKS !== '1', 'O Preview não tem configuração de envio')
  let envios = 0
  await page.route('**/functions/v1/create-lead-from-site', async (route) => {
    envios++
    const body = route.request().postDataJSON()
    expect(body).toMatchObject({ nome: 'Teste E2E COESA', email: 'nao-enviar@example.com', concessionaria: 'CEMIG' })
    await route.fulfill({ status: 200, json: { success: true } })
  })
  await page.goto('/#simulacao')
  const form = page.getByRole('region', { name: 'Formulário da simulação' })
  await form.getByRole('textbox', { name: 'Nome completo' }).fill('Teste E2E COESA')
  await form.getByRole('textbox', { name: 'Telefone (WhatsApp)' }).fill('31999998888')
  await form.getByRole('textbox', { name: 'E-mail' }).fill('nao-enviar@example.com')
  await form.getByRole('textbox', { name: 'Valor médio da conta' }).fill('50000')
  await form.getByRole('combobox', { name: 'Concessionária' }).click()
  await page.getByRole('option', { name: 'CEMIG', exact: true }).click()
  await form.getByRole('button', { name: 'Simular Economia' }).click()
  await expect(page.getByRole('heading', { name: /Teste/ })).toBeVisible()
  expect(envios).toBe(1)
})
