describe('Menu Management', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/admin/menu');
    });

    it('should display menu page', () => {
        cy.contains('Menü Yönetimi').should('be.visible');
    });

    it('should have add category button', () => {
        cy.contains('Kategori Ekle').should('be.visible');
    });

    it('should have search functionality', () => {
        cy.get('input[placeholder*="Ara"]').should('be.visible');
    });
});

describe('Table Management', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/admin/tables');
    });

    it('should display tables page', () => {
        cy.contains('Masa Yönetimi').should('be.visible');
    });

    it('should have add table button', () => {
        cy.contains('Masa Ekle').should('be.visible');
    });

    it('should open add table modal', () => {
        cy.contains('Masa Ekle').click();
        cy.get('[role="dialog"]').should('be.visible');
    });
});

describe('Order Management', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/admin/orders');
    });

    it('should display orders page', () => {
        cy.contains('Sipariş Yönetimi').should('be.visible');
    });

    it('should have status filter tabs', () => {
        cy.contains('Tümü').should('be.visible');
        cy.contains('Bekleyen').should('be.visible');
    });
});
