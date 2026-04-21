/// <reference types="cypress" />

describe('CRUD Faturas (Bills)', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  it('deve abrir o modal de nova fatura', () => {
    cy.contains('button', 'Nova Fatura').click();
    cy.contains('Nova Fatura').should('be.visible');
    cy.contains('Descrição').should('be.visible');
    cy.contains('Família').should('be.visible');
    cy.contains('Valor').should('be.visible');
    cy.contains('Vencimento').should('be.visible');
  });

  it('deve validar campos obrigatórios', () => {
    cy.contains('button', 'Nova Fatura').click();
    cy.contains('button', 'Salvar').click();
    cy.contains('Preencha os campos obrigatórios', { timeout: 5000 }).should('be.visible');
  });

  it('deve criar uma nova fatura', () => {
    cy.contains('button', 'Nova Fatura').click();

    // Fill description
    cy.get('input[placeholder="Ex: Conta de Luz"]').type('CYPRESS_TEST_BILL');
    
    // Select first family from the modal's select
    cy.get('.chakra-modal__body select').select(1);
    
    // Set amount
    cy.get('input[placeholder="R$ 0,00"]').clear().type('15050');
    
    // Set due date - use force because Chakra modal overlay can cover it
    cy.get('.chakra-modal__body input[type="date"]').first().type('2026-06-15', { force: true });

    // Save
    cy.contains('button', 'Salvar').click();
    cy.contains('Fatura salva com sucesso', { timeout: 10000 }).should('be.visible');
  });

  it('deve exibir a fatura criada na tabela', () => {
    // Show all bills
    cy.get('select').first().select('todos');
    cy.contains('CYPRESS_TEST_BILL', { timeout: 10000 }).should('be.visible');
  });

  it('deve alterar o switch "Pago" de uma fatura', () => {
    cy.get('select').first().select('todos');
    
    // Find the test bill row and toggle the paid switch (first switch in row)
    cy.contains('tr', 'CYPRESS_TEST_BILL').within(() => {
      cy.get('input[type="checkbox"][role="switch"]').first().click({ force: true });
    });
    
    cy.wait(1500);

    // Now filter by "Pagas" to verify
    cy.get('select').first().select('pagas');
    cy.contains('CYPRESS_TEST_BILL', { timeout: 5000 }).should('be.visible');
  });

  it('deve alterar o switch "Recebido" de uma fatura', () => {
    cy.get('select').first().select('pagas');
    
    cy.contains('tr', 'CYPRESS_TEST_BILL').within(() => {
      // The second switch is "Recebido"
      cy.get('input[type="checkbox"][role="switch"]').eq(1).click({ force: true });
    });

    cy.wait(1500);

    // Verify in recebidos filter
    cy.contains('Recebimento').parent().find('select').select('recebidos');
    cy.contains('CYPRESS_TEST_BILL', { timeout: 5000 }).should('be.visible');
  });

  it('deve editar uma fatura existente', () => {
    cy.get('select').first().select('todos');
    
    // Click edit button on the test bill
    cy.contains('tr', 'CYPRESS_TEST_BILL').within(() => {
      cy.get('button[aria-label="Editar"]').click();
    });

    // Modal should open with "Editar Fatura"
    cy.contains('Editar Fatura').should('be.visible');
    
    // Change description
    cy.get('input[placeholder="Ex: Conta de Luz"]').clear().type('CYPRESS_TEST_BILL_UPDATED');
    
    cy.contains('button', 'Salvar').click();
    cy.contains('Fatura salva com sucesso', { timeout: 10000 }).should('be.visible');
  });

  it('deve exibir a fatura editada', () => {
    cy.get('select').first().select('todos');
    cy.contains('CYPRESS_TEST_BILL_UPDATED', { timeout: 10000 }).should('be.visible');
  });

  it('deve selecionar faturas com checkbox', () => {
    cy.get('select').first().select('todos');
    
    cy.contains('tr', 'CYPRESS_TEST_BILL_UPDATED').within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });
    
    // Should show "Excluir Selecionadas" button
    cy.contains('Excluir Selecionadas (1)').should('be.visible');
  });

  it('deve excluir a fatura de teste', () => {
    cy.get('select').first().select('todos');
    
    cy.contains('tr', 'CYPRESS_TEST_BILL_UPDATED').within(() => {
      cy.get('button[aria-label="Excluir"]').click();
    });

    // Confirm dialog
    cy.on('window:confirm', () => true);

    cy.contains('Fatura excluída', { timeout: 10000 }).should('be.visible');
    cy.contains('CYPRESS_TEST_BILL_UPDATED').should('not.exist');
  });
});
