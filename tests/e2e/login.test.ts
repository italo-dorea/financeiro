import { test, expect } from "@playwright/test";

/**
 * Testes E2E — Login Page
 * Estes testes rodam em navegador real apontando para http://localhost:5173
 *
 * IMPORTANTE: Para o fluxo de login bem-sucedido, use as credenciais de um
 * usuário de teste criado no Supabase (nunca hardcode produção aqui).
 * Defina VITE_TEST_EMAIL e VITE_TEST_PASSWORD nas variáveis de ambiente do CI.
 */

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("exibe o formulário de login", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /gestão financeira/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByLabel(/senha|password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar no sistema/i })).toBeVisible();
  });

  test("exibe erro para credenciais inválidas", async ({ page }) => {
    await page.getByRole("textbox", { name: /email/i }).fill("invalido@test.com");
    await page.getByLabel(/senha|password/i).fill("senha-errada");
    await page.getByRole("button", { name: /entrar no sistema/i }).click();

    // Supabase retorna erro → a página deve exibir mensagem de erro
    await expect(
      page.getByText(/credenciais inválidas|email ou senha|invalid|erro de con/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("campos obrigatórios são validados", async ({ page }) => {
    await page.getByRole("button", { name: /entrar no sistema/i }).click();
    // Deve ter algum feedback de campo obrigatório
    const emailField = page.getByRole("textbox", { name: /email/i });
    // HTML5 validation ou mensagem de erro custom
    const required = await emailField.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(required).toBe(true);
  });
});
