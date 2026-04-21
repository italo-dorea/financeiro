/// <reference types="cypress" />

describe('CRUD Famílias', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  it('deve abrir o modal de nova família', () => {
    cy.contains('button', 'Nova Família').click();
    cy.contains('Nova Família').should('be.visible');
    cy.contains('Nome da Família').should('be.visible');
    cy.contains('Nome do Facilitador').should('be.visible');
    cy.contains('Dados Bancários').should('be.visible');
  });

  it('deve validar campos obrigatórios', () => {
    cy.contains('button', 'Nova Família').click();
    cy.contains('button', 'Salvar').click();
    cy.contains('Preencha os campos obrigatórios', { timeout: 5000 }).should('be.visible');
  });

  it('deve criar uma nova família', () => {
    cy.contains('button', 'Nova Família').click();

    // Fill basic info
    cy.get('input[placeholder="Ex: Família Silva"]').type('CYPRESS_TEST_FAMILY');
    cy.get('input[placeholder="Ex: João"]').type('Facilitador Teste');
    cy.get('input[placeholder="(99) 9 9999-9999"]').type('11999998888', { force: true });

    // Fill bank info
    cy.get('input[placeholder="Ex: Nubank, Itaú"]').type('Banco Teste', { force: true });
    cy.get('input[placeholder="Agência"]').type('1234', { force: true });
    cy.get('input[placeholder="Conta"]').type('56789-0', { force: true });
    cy.get('input[placeholder*="CPF"]').type('teste@pix.com', { force: true });

    // Fill dates - force required due to Chakra modal overlay
    cy.get('.chakra-modal__body input[type="date"]').eq(0).type('2026-01-01', { force: true });
    cy.get('.chakra-modal__body input[type="date"]').eq(1).type('2026-12-31', { force: true });

    // Observations
    cy.get('.chakra-modal__body textarea').type('Família criada pelo teste Cypress', { force: true });

    cy.contains('button', 'Salvar').click();
    cy.contains('Família salva com sucesso', { timeout: 10000 }).should('be.visible');
  });

  it('deve exibir a família criada no filtro', () => {
    // Wait for data reload, then check family filter dropdown
    cy.wait(1000);
    cy.contains('Família').parent().find('select').find('option').should('contain', 'CYPRESS_TEST_FAMILY');
  });

  it('deve editar a família criada', () => {
    // Select the test family in the filter
    cy.contains('Família').parent().find('select').select('CYPRESS_TEST_FAMILY');
    
    // Click "Editar" button
    cy.contains('button', 'Editar').click();

    // Should open modal with "Editar Família"
    cy.contains('Editar Família').should('be.visible');

    // Verify pre-filled data
    cy.get('input[placeholder="Ex: Família Silva"]').should('have.value', 'CYPRESS_TEST_FAMILY');

    // Update name
    cy.get('input[placeholder="Ex: Família Silva"]').clear().type('CYPRESS_TEST_FAMILY_UPDATED');
    
    cy.contains('button', 'Salvar').click();
    cy.contains('Família salva com sucesso', { timeout: 10000 }).should('be.visible');
  });

  it('deve mostrar a família editada no filtro', () => {
    cy.wait(1000);
    cy.contains('Família').parent().find('select')
      .find('option')
      .should('contain', 'CYPRESS_TEST_FAMILY_UPDATED');
  });

  it('deve limpar a família de teste (via API)', () => {
    // Cleanup via authenticated API call
    const supabaseUrl = 'https://morlgdmenrphxorhdjaf.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcmxnZG1lbnJwaHhvcmhkamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTQzMjksImV4cCI6MjA4NjQzMDMyOX0.eV3daWt5Do3p4SO9pYhtrcFp3mEN6_qvlWq7RlL-6_o';

    // First get a valid token
    cy.request({
      method: 'POST',
      url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
      body: { email: 'gabriela.dinis@panahgah.org', password: 'panagah2026' },
      headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' }
    }).then((authRes) => {
      const token = authRes.body.access_token;
      cy.request({
        method: 'DELETE',
        url: `${supabaseUrl}/rest/v1/families?name=like.*CYPRESS_TEST*`,
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=minimal'
        },
        failOnStatusCode: false
      });
    });
  });
});
