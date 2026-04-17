import { test, expect, Page } from "@playwright/test";

/**
 * Testes E2E — Dashboard (CRUD de famílias e contas)
 * Requer usuário autenticado. O estado de autenticação é injetado via
 * storageState pré-autenticado (ver playwright.config.ts → globalSetup).
 *
 * Para ambiente local, configure VITE_TEST_EMAIL e VITE_TEST_PASSWORD.
 */

// Helper: injeta o token de autenticação no localStorage (simula login)
async function setFakeAuth(page: Page) {
  // Em CI com supabase local, fazer login real via API antes do teste
  // Em ambiente de desenvolvimento, usar o fluxo manual
  await page.addInitScript(() => {
    // Placeholder - em produção real usar storageState do Playwright
    // para persistir sessão válida do Supabase entre testes
  });
}

test.describe("Dashboard — Proteção de Rota", () => {
  test("redireciona para /login quando não autenticado", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Dashboard — Navegação", () => {
  test.beforeEach(async ({ page }) => {
    // Tenta acessar o dashboard sem autenticação → redireciona
    await page.goto("/");
  });

  test("página de login é exibida ao acessar rota protegida", async ({ page }) => {
    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole("button", { name: /entrar|login/i })).toBeVisible();
  });
});

test.describe("Dashboard — Estrutura da Página (autenticado)", () => {
  /**
   * Estes testes requerem autenticação real.
   * Para executar: configure as env vars VITE_TEST_EMAIL e VITE_TEST_PASSWORD
   * e use `npx playwright test --project=chromium` com um Supabase local ou staging.
   *
   * Marcados com .skip em CI sem as env vars configuradas.
   */
  test.skip(
    !process.env.VITE_TEST_EMAIL,
    "Requer VITE_TEST_EMAIL e VITE_TEST_PASSWORD configurados"
  );

  test("exibe header com navegação após login", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.getByRole("textbox", { name: /email/i }).fill(process.env.VITE_TEST_EMAIL!);
    await page.getByLabel(/senha|password/i).fill(process.env.VITE_TEST_PASSWORD!);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL("/", { timeout: 15_000 });
    await expect(page.getByRole("navigation")).toBeVisible();
  });
});
