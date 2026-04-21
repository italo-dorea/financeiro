/// <reference types="cypress" />

describe('Dashboard - Carregamento e Estatísticas', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  it('deve carregar o dashboard com estatísticas', () => {
    cy.contains('Total a Pagar').should('be.visible');
    cy.contains('Total Pago').should('be.visible');
    cy.contains('Vencem Hoje').should('be.visible');
  });

  it('deve exibir a tabela de faturas', () => {
    cy.get('table').should('be.visible');
    cy.contains('th', 'Família').should('be.visible');
    cy.contains('th', 'Descrição').should('be.visible');
    cy.contains('th', 'Valor').should('be.visible');
    cy.contains('th', 'Pago').should('be.visible');
    cy.contains('th', 'Recebido').should('be.visible');
  });

  it('deve mostrar contagem de faturas', () => {
    cy.contains('faturas').should('be.visible');
  });

  it('deve ter os botões de ação visíveis', () => {
    cy.contains('button', 'Nova Fatura').should('be.visible');
    cy.contains('button', 'Nova Família').should('be.visible');
  });
});

describe('Dashboard - Filtros', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  it('deve filtrar por status "Todas"', () => {
    cy.get('select').first().select('todos');
    cy.url().should('include', 'situacao=todos');
  });

  it('deve filtrar por status "Pagas"', () => {
    cy.get('select').first().select('pagas');
    cy.url().should('include', 'situacao=pagas');
  });

  it('deve filtrar por status "Não Pagas" (padrão)', () => {
    cy.get('select').first().select('pendentes');
    cy.url().should('include', 'situacao=pendentes');
  });

  it('deve filtrar por recebimento', () => {
    // Select "Recebidas"
    cy.contains('Recebimento').parent().find('select').select('recebidos');
    cy.url().should('include', 'recebimento=recebidos');

    // Select "Não Recebidas"
    cy.contains('Recebimento').parent().find('select').select('pendentes');
    cy.url().should('include', 'recebimento=pendentes');
  });

  it('deve filtrar por família', () => {
    cy.contains('Família').parent().find('select').then($select => {
      // Get the first option that is not placeholder
      const options = $select.find('option').not('[value=""]');
      if (options.length > 0) {
        const firstVal = options.first().val() as string;
        cy.contains('Família').parent().find('select').select(firstVal);
        cy.url().should('include', 'familia=');
      }
    });
  });

  it('deve filtrar por intervalo de datas', () => {
    cy.contains('De').parent().find('input[type="date"]').type('2026-01-01');
    cy.url().should('include', 'dataInicial=2026-01-01');

    cy.contains('Até').parent().find('input[type="date"]').type('2026-12-31');
    cy.url().should('include', 'dataFinal=2026-12-31');
  });

  it('deve limpar todos os filtros', () => {
    // Apply some filters first
    cy.get('select').first().select('todos');
    cy.contains('De').parent().find('input[type="date"]').type('2026-01-01');

    // Clear
    cy.contains('button', 'Limpar Filtros').click();
    cy.url().should('include', 'situacao=pendentes');
    cy.url().should('not.include', 'dataInicial');
  });

  it('deve filtrar "Vencem Hoje" ao clicar no card', () => {
    cy.contains('Vencem Hoje').click({ force: true });
    const today = new Date().toISOString().split('T')[0];
    cy.url().should('include', `dataInicial=${today}`);
    cy.url().should('include', `dataFinal=${today}`);
  });
});

describe('Dashboard - Paginação', () => {
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
    // Show all bills to test pagination
    cy.get('select').first().select('todos');
  });

  it('deve alterar quantidade de itens por página', () => {
    cy.contains('Exibir').parent().find('select').select('10');
    cy.contains('Mostrando 1 a').should('be.visible');
  });
});
