describe('Kitchen Screen', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/kitchen');
    });

    it('should display kitchen Kanban board', () => {
        cy.contains('Mutfak Ekranı').should('be.visible');
        cy.contains('YENİ SİPARİŞLER').should('be.visible');
        cy.contains('HAZIRLANIYOR').should('be.visible');
        cy.contains('HAZIR').should('be.visible');
    });

    it('should display order counts in header', () => {
        cy.get('.bg-red-600').should('contain', 'Bekleyen');
        cy.get('.bg-orange-600').should('contain', 'Hazırlanan');
        cy.get('.bg-green-600').should('contain', 'Hazır');
    });

    it('should toggle sound setting', () => {
        // Find and click sound toggle button
        cy.get('button[title="Sesi Kapat"]').click();
        cy.get('button[title="Sesi Aç"]').should('be.visible');

        // Toggle back
        cy.get('button[title="Sesi Aç"]').click();
        cy.get('button[title="Sesi Kapat"]').should('be.visible');
    });

    it('should have refresh button', () => {
        cy.get('button[title="Yenile"]').should('be.visible');
        cy.get('button[title="Yenile"]').click();
    });

    it('should display keyboard shortcuts help', () => {
        cy.contains('Kısayollar:').should('be.visible');
    });
});
