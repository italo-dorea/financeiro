/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const BILL_NAME = 'CYPRESS_FATURA_TESTE';
const BILL_NAME_UPDATED = 'CYPRESS_FATURA_ATUALIZADA';
const DRIVE_URL = 'https://drive.google.com/file/d/fakeid/view';
const AMOUNT_RAW = '25099'; // "250,99" in BR format typed as digits
const DUE_DATE = '2026-08-20';
const PAYMENT_DATE = '2026-08-18';
const OBSERVATIONS = 'Observação gerada pelo Cypress - verificação de campos';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Opens the bill modal via the "Nova Fatura" button */
const openNewBillModal = () => {
  cy.contains('button', 'Nova Fatura').should('be.visible').click();
  cy.get('.chakra-modal__content', { timeout: 8000 }).should('be.visible');
  cy.contains('Nova Fatura').should('be.visible');
};

/** Applies the "Todos" filter on the status select (first select on page) */
const filterAll = () => {
  cy.get('select').first().select('todos');
  cy.wait(500);
};

/** Locates the table row that contains a specific bill name */
const getBillRow = (name: string) =>
  cy.contains('tr', name, { timeout: 12000 });

// ─────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────
describe('🧾 CRUD Completo de Faturas', () => {
  // Authenticate before every test
  beforeEach(() => {
    cy.login('gabriela.dinis@panahgah.org', 'panagah2026');
  });

  // ───────────────────────────────────────────
  // 1. MODAL – Abertura e campos visíveis
  // ───────────────────────────────────────────
  describe('1 · Modal – Estrutura e campos', () => {
    it('deve abrir o modal de nova fatura ao clicar no botão', () => {
      openNewBillModal();

      // Required labels
      cy.contains('Descrição').should('be.visible');
      cy.contains('Família').should('be.visible');
      cy.contains('Valor').should('be.visible');
      cy.contains('Vencimento').should('be.visible');

      // Optional labels
      cy.contains('Pago?').should('be.visible');
      cy.contains('Recebido?').should('be.visible');
      cy.contains('Data de Pagamento').should('be.visible');
      cy.contains('Fatura Recorrente?').should('be.visible');
      cy.contains('Link do Comprovante').should('be.visible');
      cy.contains('Observações').should('be.visible');

      // Footer buttons
      cy.contains('button', 'Cancelar').should('be.visible');
      cy.contains('button', 'Salvar').should('be.visible');
    });

    it('deve fechar o modal ao clicar em "Cancelar"', () => {
      openNewBillModal();
      cy.contains('button', 'Cancelar').click();
      cy.get('.chakra-modal__content').should('not.exist');
    });

    it('deve fechar o modal ao clicar no "X" de fechamento', () => {
      openNewBillModal();
      cy.get('.chakra-modal__close-btn').click();
      cy.get('.chakra-modal__content').should('not.exist');
    });
  });

  // ───────────────────────────────────────────
  // 2. VALIDAÇÃO – Campos obrigatórios
  // ───────────────────────────────────────────
  describe('2 · Validação de campos obrigatórios', () => {
    it('deve exibir aviso ao salvar sem preencher nenhum campo', () => {
      openNewBillModal();
      cy.contains('button', 'Salvar').click();
      cy.contains('Preencha os campos obrigatórios', { timeout: 6000 }).should('be.visible');
    });

    it('deve exibir aviso ao salvar sem selecionar família', () => {
      openNewBillModal();
      cy.get('.chakra-modal__body input[placeholder="Ex: Conta de Luz"]').type(BILL_NAME);
      cy.get('.chakra-modal__body input[placeholder="R$ 0,00"]').type(AMOUNT_RAW);
      cy.get('.chakra-modal__body input[type="date"]').first().type(DUE_DATE, { force: true });
      // Intentionally skip family
      cy.contains('button', 'Salvar').click();
      cy.contains('Preencha os campos obrigatórios', { timeout: 6000 }).should('be.visible');
    });

    it('deve exibir aviso ao salvar sem valor', () => {
      openNewBillModal();
      cy.get('.chakra-modal__body input[placeholder="Ex: Conta de Luz"]').type(BILL_NAME);
      cy.get('.chakra-modal__body select').select(1);
      cy.get('.chakra-modal__body input[type="date"]').first().type(DUE_DATE, { force: true });
      // Intentionally skip amount
      cy.contains('button', 'Salvar').click();
      cy.contains('Preencha os campos obrigatórios', { timeout: 6000 }).should('be.visible');
    });
  });

  // ───────────────────────────────────────────
  // 3. CRIAÇÃO – Todos os campos
  // ───────────────────────────────────────────
  describe('3 · Criação de fatura com todos os campos', () => {
    it('deve criar fatura preenchendo TODOS os campos do formulário', () => {
      openNewBillModal();

      // [CAMPO 1] Descrição
      cy.get('.chakra-modal__body input[placeholder="Ex: Conta de Luz"]')
        .should('be.visible')
        .clear()
        .type(BILL_NAME);

      // [CAMPO 2] Família – select first available option
      cy.get('.chakra-modal__body select')
        .first()
        .should('be.visible')
        .select(1);

      // [CAMPO 3] Valor monetário (NumericFormat)
      cy.get('.chakra-modal__body input[placeholder="R$ 0,00"]')
        .should('be.visible')
        .clear()
        .type(AMOUNT_RAW);

      // [CAMPO 4] Vencimento (date)
      cy.get('.chakra-modal__body input[type="date"]')
        .first()
        .should('be.visible')
        .type(DUE_DATE, { force: true });

      // [CAMPO 5] Switch "Pago?"
      cy.get('#paid-switch').check({ force: true });
      cy.get('#paid-switch').should('be.checked');

      // [CAMPO 6] Data de Pagamento (second date input)
      cy.get('.chakra-modal__body input[type="date"]')
        .eq(1)
        .type(PAYMENT_DATE, { force: true });

      // [CAMPO 7] Switch "Recebido?"
      cy.get('#received-switch').check({ force: true });
      cy.get('#received-switch').should('be.checked');

      // [CAMPO 8] Link do Comprovante (drive_url)
      cy.get('.chakra-modal__body input[placeholder="https://drive.google.com/..."]')
        .should('be.visible')
        .clear()
        .type(DRIVE_URL);

      // [CAMPO 9] Observações (textarea)
      cy.get('.chakra-modal__body textarea')
        .should('be.visible')
        .clear()
        .type(OBSERVATIONS);

      // Submit
      cy.contains('button', 'Salvar').click();

      // Assert success
      cy.contains('Fatura salva com sucesso', { timeout: 15000 }).should('be.visible');
    });

    it('deve exibir a fatura criada na tabela com os dados corretos', () => {
      filterAll();
      getBillRow(BILL_NAME).should('be.visible');

      // Verify amount column shows R$ 250,99
      getBillRow(BILL_NAME).within(() => {
        cy.contains('250,99').should('exist');
      });

      // Verify due date is shown
      getBillRow(BILL_NAME).within(() => {
        cy.contains('20/08/2026').should('exist');
      });

      // Verify the drive_url link icon renders (ExternalLinkIcon)
      getBillRow(BILL_NAME).within(() => {
        cy.get('[aria-label="Ver anexo"]').should('be.visible');
      });

      // Verify the drive_url link has the correct href
      getBillRow(BILL_NAME).within(() => {
        cy.get('[aria-label="Ver anexo"]')
          .should('have.attr', 'href', DRIVE_URL);
      });
    });

    it('deve exibir a fatura na aba "Pagas" (paid=true)', () => {
      cy.get('select').first().select('pagas');
      cy.wait(500);
      getBillRow(BILL_NAME).should('be.visible');
    });
  });

  // ───────────────────────────────────────────
  // 4. RECORRÊNCIA – campos condicionais
  // ───────────────────────────────────────────
  describe('4 · Campos de fatura recorrente', () => {
    it('deve exibir campos de recorrência ao ativar o switch', () => {
      openNewBillModal();

      // Fields should NOT be visible before enabling
      cy.contains('Periodicidade').should('not.exist');
      cy.contains('Quantidade de Parcelas').should('not.exist');

      // Enable recurrence switch
      cy.get('#recurring-switch').check({ force: true });

      // Fields should NOW appear
      cy.contains('Periodicidade').should('be.visible');
      cy.contains('Quantidade de Parcelas').should('be.visible');
    });

    it('deve preencher e salvar fatura recorrente (mensal, 12x)', () => {
      openNewBillModal();

      cy.get('.chakra-modal__body input[placeholder="Ex: Conta de Luz"]')
        .type('CYPRESS_RECORRENTE_TESTE');

      cy.get('.chakra-modal__body select').first().select(1);

      cy.get('.chakra-modal__body input[placeholder="R$ 0,00"]')
        .clear()
        .type('10000');

      cy.get('.chakra-modal__body input[type="date"]')
        .first()
        .type('2026-09-01', { force: true });

      // Enable recurrence
      cy.get('#recurring-switch').check({ force: true });

      // Set periodicity to monthly
      cy.contains('Periodicidade').parent().find('select').select('monthly');

      // Set installments
      cy.get('.chakra-modal__body input[placeholder="Ex: 12"]')
        .clear()
        .type('12');

      cy.contains('button', 'Salvar').click();
      cy.contains('Fatura salva com sucesso', { timeout: 15000 }).should('be.visible');

      // Cleanup – delete this extra test record
      filterAll();
      cy.contains('tr', 'CYPRESS_RECORRENTE_TESTE', { timeout: 10000 }).within(() => {
        cy.get('button[aria-label="Excluir"]').click();
      });
      cy.on('window:confirm', () => true);
      cy.wait(1500);
    });
  });

  // ───────────────────────────────────────────
  // 5. EDIÇÃO – Abertura do modal e persistência
  // ───────────────────────────────────────────
  describe('5 · Edição de fatura existente', () => {
    it('deve abrir o modal de edição com os dados pré-carregados', () => {
      filterAll();

      getBillRow(BILL_NAME).within(() => {
        cy.get('button[aria-label="Editar"]').click();
      });

      // Modal opens in "edit" mode
      cy.contains('Editar Fatura', { timeout: 8000 }).should('be.visible');

      // Assert all fields are pre-populated
      cy.get('.chakra-modal__body input[placeholder="Ex: Conta de Luz"]')
        .should('have.value', BILL_NAME);

      cy.get('.chakra-modal__body input[placeholder="R$ 0,00"]')
        .should('not.have.value', '');

      cy.get('.chakra-modal__body input[type="date"]')
        .first()
        .should('have.value', DUE_DATE);

      cy.get('.chakra-modal__body input[placeholder="https://drive.google.com/..."]')
        .should('have.value', DRIVE_URL);

      cy.get('.chakra-modal__body textarea')
        .should('have.value', OBSERVATIONS);

      // Switches should reflect saved state
      cy.get('#paid-switch').should('be.checked');
      cy.get('#received-switch').should('be.checked');
    });

    it('deve salvar a edição da descrição e persistir na tabela', () => {
      filterAll();

      getBillRow(BILL_NAME).within(() => {
        cy.get('button[aria-label="Editar"]').click();
      });

      cy.contains('Editar Fatura', { timeout: 8000 }).should('be.visible');

      // Update description
      cy.get('.chakra-modal__body input[placeholder="Ex: Conta de Luz"]')
        .clear()
        .type(BILL_NAME_UPDATED);

      // Update observations
      cy.get('.chakra-modal__body textarea')
        .clear()
        .type('Observação editada pelo Cypress');

      cy.contains('button', 'Salvar').click();
      cy.contains('Fatura salva com sucesso', { timeout: 15000 }).should('be.visible');

      // Verify updated name appears in table
      filterAll();
      getBillRow(BILL_NAME_UPDATED).should('be.visible');
    });

    it('deve atualizar o link do comprovante (drive_url) via edição', () => {
      const NEW_DRIVE_URL = 'https://drive.google.com/file/d/newid/view';

      filterAll();

      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('button[aria-label="Editar"]').click();
      });

      cy.contains('Editar Fatura', { timeout: 8000 }).should('be.visible');

      cy.get('.chakra-modal__body input[placeholder="https://drive.google.com/..."]')
        .clear()
        .type(NEW_DRIVE_URL);

      cy.contains('button', 'Salvar').click();
      cy.contains('Fatura salva com sucesso', { timeout: 15000 }).should('be.visible');

      // Verify new URL on link icon
      filterAll();
      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('[aria-label="Ver anexo"]')
          .should('have.attr', 'href', NEW_DRIVE_URL);
      });
    });

    it('deve remover o link do comprovante ao limpar o campo', () => {
      filterAll();

      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('button[aria-label="Editar"]').click();
      });

      cy.contains('Editar Fatura', { timeout: 8000 }).should('be.visible');

      // Clear the drive url
      cy.get('.chakra-modal__body input[placeholder="https://drive.google.com/..."]').clear();

      cy.contains('button', 'Salvar').click();
      cy.contains('Fatura salva com sucesso', { timeout: 15000 }).should('be.visible');

      // The attachment icon should no longer be rendered
      filterAll();
      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('[aria-label="Ver anexo"]').should('not.exist');
      });
    });
  });

  // ───────────────────────────────────────────
  // 6. SWITCHES INLINE – Pago / Recebido na tabela
  // ───────────────────────────────────────────
  describe('6 · Switches inline da tabela (Pago / Recebido)', () => {
    it('deve desmarcar "Pago" direto na tabela e refletir no filtro', () => {
      // Bill should be in "pagas" because paid=true
      cy.get('select').first().select('pagas');
      cy.wait(500);

      getBillRow(BILL_NAME_UPDATED).within(() => {
        // First switch = Pago
        cy.get('input[type="checkbox"][role="switch"]').first().click({ force: true });
      });

      cy.wait(1500);

      // Filter by "não pagas" – bill should appear
      cy.get('select').first().select('nao_pagas');
      cy.wait(500);
      getBillRow(BILL_NAME_UPDATED).should('be.visible');
    });

    it('deve marcar "Recebido" direto na tabela', () => {
      filterAll();

      getBillRow(BILL_NAME_UPDATED).within(() => {
        // Second switch = Recebido
        cy.get('input[type="checkbox"][role="switch"]').eq(1).click({ force: true });
      });

      cy.wait(1500);

      // Re-open edit to verify persistence
      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('button[aria-label="Editar"]').click();
      });

      cy.contains('Editar Fatura', { timeout: 8000 }).should('be.visible');
      cy.get('#received-switch').should('be.checked');
      cy.contains('button', 'Cancelar').click();
    });
  });

  // ───────────────────────────────────────────
  // 7. SELEÇÃO – Checkbox e exclusão em lote
  // ───────────────────────────────────────────
  describe('7 · Seleção e exclusão em lote', () => {
    it('deve selecionar fatura via checkbox e exibir botão "Excluir Selecionadas"', () => {
      filterAll();

      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('input[type="checkbox"]').check({ force: true });
      });

      cy.contains('Excluir Selecionadas (1)').should('be.visible');
    });

    it('deve desmarcar o checkbox e ocultar o botão de exclusão em lote', () => {
      filterAll();

      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('input[type="checkbox"]').check({ force: true });
      });

      cy.contains('Excluir Selecionadas (1)').should('be.visible');

      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('input[type="checkbox"]').uncheck({ force: true });
      });

      cy.contains('Excluir Selecionadas').should('not.exist');
    });
  });

  // ───────────────────────────────────────────
  // 8. EXCLUSÃO – Remoção individual
  // ───────────────────────────────────────────
  describe('8 · Exclusão de fatura', () => {
    it('deve excluir a fatura de teste e removê-la da tabela', () => {
      filterAll();

      // Handle native confirm dialog before triggering click
      cy.on('window:confirm', () => true);

      getBillRow(BILL_NAME_UPDATED).within(() => {
        cy.get('button[aria-label="Excluir"]').click();
      });

      cy.contains('Fatura excluída', { timeout: 12000 }).should('be.visible');

      // Bill must no longer appear
      cy.contains(BILL_NAME_UPDATED, { timeout: 5000 }).should('not.exist');
    });
  });
});
