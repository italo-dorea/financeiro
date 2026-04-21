/// <reference types="cypress" />

describe('Login & Autenticação', () => {
  it('deve exibir a página de login', () => {
    cy.visit('/login');
    cy.contains('Gestão Financeira').should('be.visible');
    cy.contains('Faça login para continuar').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.contains('button', 'Entrar no Sistema').should('be.visible');
  });

  it('deve mostrar erro com credenciais inválidas', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('invalido@email.com');
    cy.get('input[type="password"]').type('senhaerrada');
    cy.get('button[type="submit"]').click();
    // Should show error toast
    cy.contains('Credenciais inválidas', { timeout: 10000 }).should('be.visible');
  });

  it('deve fazer login com credenciais válidas', () => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
    // Should be on dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/?situacao=pendentes');
    cy.contains('Total a Pagar').should('be.visible');
  });

  it('deve redirecionar para login quando não autenticado', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('deve fazer logout corretamente', () => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
    cy.logout();
    cy.url().should('include', '/login');
  });
});
