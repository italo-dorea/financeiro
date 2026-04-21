/// <reference types="cypress" />

describe('CRUD Patrocinadores (Sponsors)', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  it('deve navegar para a página de patrocinadores', () => {
    // Open drawer menu
    cy.get('button[aria-label="Open Menu"]').click();
    cy.contains('Patrocinadores').click();

    cy.url().should('include', '/patrocinadores');
    cy.contains('Patrocinadores').should('be.visible');
    cy.contains('button', 'Adicionar').should('be.visible');
  });

  it('deve abrir o modal de novo patrocinador', () => {
    cy.visit('/patrocinadores');
    cy.contains('button', 'Adicionar').click();
    cy.contains('Novo Patrocinador').should('be.visible');
    cy.get('input[placeholder="Nome do patrocinador"]').should('be.visible');
    cy.get('input[placeholder="email@exemplo.com"]').should('be.visible');
    cy.get('input[placeholder="(99) 99999-9999"]').should('be.visible');
  });

  it('deve validar nome obrigatório', () => {
    cy.visit('/patrocinadores');
    cy.contains('button', 'Adicionar').click();
    cy.contains('button', 'Salvar').click();
    cy.contains('Nome é obrigatório', { timeout: 5000 }).should('be.visible');
  });

  it('deve criar um novo patrocinador', () => {
    cy.visit('/patrocinadores');
    cy.contains('button', 'Adicionar').click();

    cy.get('input[placeholder="Nome do patrocinador"]').type('CYPRESS_TEST_SPONSOR');
    cy.get('input[placeholder="email@exemplo.com"]').type('cypress@test.com');
    cy.get('input[placeholder="(99) 99999-9999"]').type('11888887777');

    cy.contains('button', 'Salvar').click();
    cy.contains('Salvo com sucesso', { timeout: 10000 }).should('be.visible');
  });

  it('deve exibir o patrocinador criado na tabela', () => {
    cy.visit('/patrocinadores');
    cy.contains('CYPRESS_TEST_SPONSOR', { timeout: 10000 }).should('be.visible');
    cy.contains('cypress@test.com').should('be.visible');
  });

  it('deve editar o patrocinador', () => {
    cy.visit('/patrocinadores');
    
    cy.contains('tr', 'CYPRESS_TEST_SPONSOR').within(() => {
      cy.get('button[aria-label="Editar"]').click();
    });

    cy.contains('Editar Patrocinador').should('be.visible');
    cy.get('input[placeholder="Nome do patrocinador"]').should('have.value', 'CYPRESS_TEST_SPONSOR');
    cy.get('input[placeholder="Nome do patrocinador"]').clear().type('CYPRESS_TEST_SPONSOR_UPDATED');

    cy.contains('button', 'Salvar').click();
    cy.contains('Salvo com sucesso', { timeout: 10000 }).should('be.visible');
  });

  it('deve exibir o patrocinador editado', () => {
    cy.visit('/patrocinadores');
    cy.contains('CYPRESS_TEST_SPONSOR_UPDATED', { timeout: 10000 }).should('be.visible');
  });

  it('deve excluir o patrocinador de teste', () => {
    cy.visit('/patrocinadores');
    
    cy.contains('tr', 'CYPRESS_TEST_SPONSOR_UPDATED').within(() => {
      cy.get('button[aria-label="Excluir"]').click();
    });

    cy.on('window:confirm', () => true);

    cy.contains('Patrocinador excluído', { timeout: 10000 }).should('be.visible');
    cy.contains('CYPRESS_TEST_SPONSOR_UPDATED').should('not.exist');
  });
});
