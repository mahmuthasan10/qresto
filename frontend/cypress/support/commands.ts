/// <reference types="cypress" />

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to log in as admin
             */
            login(email?: string, password?: string): Chainable<void>;

            /**
             * Custom command to logout
             */
            logout(): Chainable<void>;
        }
    }
}

// Login command
Cypress.Commands.add('login', (email?: string, password?: string) => {
    const userEmail = email || Cypress.env('adminEmail');
    const userPassword = password || Cypress.env('adminPassword');

    cy.visit('/admin/login');
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin/dashboard');
});

// Logout command
Cypress.Commands.add('logout', () => {
    cy.window().then((win) => {
        win.localStorage.removeItem('accessToken');
        win.localStorage.removeItem('refreshToken');
    });
    cy.visit('/admin/login');
});

export { };
