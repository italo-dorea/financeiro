/// <reference types="cypress" />

// Custom commands for the Financeiro app

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect to dashboard
  cy.url().should('not.include', '/login', { timeout: 15000 });
  // Wait for data to load
  cy.contains('Total a Pagar', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.contains('button', 'Sair').click();
  cy.url().should('include', '/login');
});

export {};
