describe('Admin Authentication', () => {
    beforeEach(() => {
        cy.visit('/admin/login');
    });

    it('should display login page', () => {
        cy.get('h1').should('contain', 'Giriş');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
        cy.get('input[type="email"]').type('wrong@email.com');
        cy.get('input[type="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();

        // Should stay on login page or show error
        cy.url().should('include', '/admin/login');
    });

    it('should login with valid credentials', () => {
        cy.login();
        cy.url().should('include', '/admin/dashboard');
    });

    it('should redirect unauthenticated users to login', () => {
        cy.visit('/admin/dashboard');
        cy.url().should('include', '/admin/login');
    });
});

describe('Admin Dashboard', () => {
    beforeEach(() => {
        cy.login();
    });

    it('should display dashboard stats', () => {
        cy.get('[data-testid="stats-card"]').should('have.length.at.least', 1);
    });

    it('should navigate to menu page', () => {
        cy.contains('Menü').click();
        cy.url().should('include', '/admin/menu');
    });

    it('should navigate to tables page', () => {
        cy.contains('Masalar').click();
        cy.url().should('include', '/admin/tables');
    });

    it('should navigate to orders page', () => {
        cy.contains('Siparişler').click();
        cy.url().should('include', '/admin/orders');
    });
});
