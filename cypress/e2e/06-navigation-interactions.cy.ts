/// <reference types="cypress" />

describe('Dashboard - Filtro Vencem Hoje', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  it('deve filtrar "Vencem Hoje" ao clicar no card', () => {
    // The card is a Chakra Stat component rendered as a Box with cursor pointer
    cy.contains('Vencem Hoje').parents('div[class*="css"]').filter('[cursor="pointer"], [style*="cursor: pointer"]').first().click({ force: true });
    const today = new Date().toISOString().split('T')[0];
    cy.url().should('include', `dataInicial=${today}`);
    cy.url().should('include', `dataFinal=${today}`);
  });
});

describe('Switches inline da tabela de faturas', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
    // Show all bills
    cy.get('select').first().select('todos');
  });

  it('deve ter switches de Pago e Recebido em cada fatura', () => {
    cy.get('table tbody tr').first().within(() => {
      // Chakra Switch renders as input[role="switch"]
      cy.get('input[role="switch"]').should('have.length', 2);
    });
  });
});

describe('Navegação e Layout', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  it('deve exibir o header com informações do usuário', () => {
    cy.contains('Dashboard de Faturas').should('be.visible');
    cy.contains('gabriela.dinis@panahgah.org').should('be.visible');
    cy.contains('button', 'Sair').should('be.visible');
  });

  it('deve abrir e fechar o menu drawer', () => {
    cy.get('button[aria-label="Open Menu"]').click();
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Patrocinadores').should('be.visible');
    
    // Close drawer
    cy.get('button[aria-label="Close"]').click();
  });

  it('deve navegar entre Dashboard e Patrocinadores via menu', () => {
    cy.get('button[aria-label="Open Menu"]').click();
    cy.contains('a', 'Patrocinadores').click();
    cy.url().should('include', '/patrocinadores');
    
    cy.get('button[aria-label="Open Menu"]').click();
    cy.contains('a', 'Dashboard').click();
    cy.url().should('not.include', '/patrocinadores');
    cy.contains('Total a Pagar').should('be.visible');
  });
});

describe('Seleção em lote de faturas', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
    cy.get('select').first().select('todos');
    // Wait for data to load
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('deve selecionar todas as faturas com o checkbox do header', () => {
    cy.get('thead input[type="checkbox"]').check({ force: true });
    cy.contains('Excluir Selecionadas').should('be.visible');
  });

  it('deve desmarcar todas ao clicar novamente', () => {
    cy.get('thead input[type="checkbox"]').check({ force: true });
    cy.contains('Excluir Selecionadas').should('be.visible');
    cy.get('thead input[type="checkbox"]').uncheck({ force: true });
    cy.contains('Excluir Selecionadas').should('not.exist');
  });
});
