describe('Order Flow', () => {
    it('should allow a customer to place an order', () => {
        // Visit menu page with test QR
        cy.visit('http://localhost:3000/menu/test-qr-123');

        // Check if restaurant name is visible
        cy.contains('Test Restaurant');

        // Check if category is visible
        cy.contains('Başlangıçlar');

        // Add item to cart
        cy.contains('Ev Salatası').click();

        // Check if added to cart (toast or counter)
        cy.contains('Sepete Eklendi');

        // Go to cart
        cy.get('[aria-label="Sepetim"]').click();

        // Check cart content
        cy.contains('Sepetim');
        cy.contains('Ev Salatası');

        // Proceed to checkout
        cy.contains('Siparişi Tamamla').click();

        // Wait for checkout modal/page
        cy.contains('Ödeme Yöntemi');

        // Select Cash
        cy.contains('Nakit').click();

        // Confirm Order
        cy.contains('Siparişi Onayla').click();

        // Verify success
        cy.contains('Siparişiniz Alındı');
        cy.url().should('include', '/order/ORD-');
    });
});
