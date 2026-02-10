describe('Full Order Flow', () => {
    // Generate random values for each test run to avoid conflicts
    const timestamp = Date.now();
    const tableId = 1;
    let categoryId: number;
    let menuItemId: number;
    let authToken: string;

    // Helper function to wait
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    before(() => {
        // Login as admin to setup data
        cy.request('POST', 'http://localhost:3001/api/v1/auth/login', {
            email: Cypress.env('adminEmail'),
            password: Cypress.env('adminPassword')
        }).then((response) => {
            authToken = response.body.token;

            // Create a test category
            cy.request({
                method: 'POST',
                url: 'http://localhost:3001/api/v1/categories',
                headers: { Authorization: `Bearer ${authToken}` },
                body: {
                    name: `Test Category ${timestamp}`,
                    nameEn: `Test Category En ${timestamp}`,
                    displayOrder: 1
                }
            }).then((catRes) => {
                categoryId = catRes.body.category.id;

                // Create a test menu item
                cy.request({
                    method: 'POST',
                    url: 'http://localhost:3001/api/v1/menu-items',
                    headers: { Authorization: `Bearer ${authToken}` },
                    body: {
                        categoryId: categoryId,
                        name: `Test Item ${timestamp}`,
                        description: 'Delicious test item',
                        price: 150,
                        isAvailable: true
                    }
                }).then((itemRes) => {
                    menuItemId = itemRes.body.menuItem.id;
                });
            });
        });
    });

    after(() => {
        // Cleanup data
        if (authToken && menuItemId) {
            cy.request({
                method: 'DELETE',
                url: `http://localhost:3001/api/v1/menu-items/${menuItemId}`,
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false
            });
        }
        if (authToken && categoryId) {
            cy.request({
                method: 'DELETE',
                url: `http://localhost:3001/api/v1/categories/${categoryId}`,
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false
            });
        }
    });

    it('should complete a full order cycle', () => {
        // 1. Visit Public Menu (simulate scanning QR)
        // Note: We need a valid QR code or Table ID. Assuming Table 1 exists and has a known QR or we bypass QR check logic if possible for testing.
        // For E2E, the public URL is usually /menu/:tableQr. We might need to fetch the QR for table 1 first.

        let tableQr: string;
        cy.request({
            method: 'GET',
            url: `http://localhost:3001/api/v1/tables/${tableId}/qr`,
            headers: { Authorization: `Bearer ${authToken}` }
        }).then((qrRes) => {
            // Realistically we need the QR code string that is embedded in the URL, not the image.
            // But let's assume we can get the QR string from the table object itself if the API supports it
            cy.request({
                method: 'GET',
                url: `http://localhost:3001/api/v1/tables/${tableId}`,
                headers: { Authorization: `Bearer ${authToken}` }
            }).then((tableRes) => {
                tableQr = tableRes.body.table.qrCode; // Accessing the UUID/String stored in qrCode field

                // NOW we can visit the menu
                cy.visit(`/menu/${tableQr}`);

                // 2. Select Item
                cy.contains(`Test Item ${timestamp}`).click();
                cy.get('button').contains('Sepete Ekle').click();

                // 3. Go to Cart and Checkout
                cy.get('a[href="/cart"]').click(); // Assuming cart link is an anchor or button
                cy.contains('Siparişi Gönder').click();

                // 4. Verify Order Tracking
                cy.url().should('include', '/order/');
                cy.contains('Sipariş Alındı').should('be.visible');

                // Capture Order ID from URL
                cy.url().then(url => {
                    const orderId = url.split('/').pop();

                    // 5. Open Kitchen Screen (in disjoint browser context via direct API or just log in as admin in same test)
                    // Since Cypress is single-browser, we simulate the kitchen view updates by just visiting the page
                    // OR we can use the API to update status and verify the Customer view updates

                    // Option A: Admin updates status via API
                    cy.request({
                        method: 'PATCH',
                        url: `http://localhost:3001/api/v1/orders/${orderId}/status`,
                        headers: { Authorization: `Bearer ${authToken}` },
                        body: { status: 'preparing' }
                    });

                    // Verify Customer View updates
                    cy.contains('Hazırlanıyor', { timeout: 10000 }).should('be.visible');

                    cy.request({
                        method: 'PATCH',
                        url: `http://localhost:3001/api/v1/orders/${orderId}/status`,
                        headers: { Authorization: `Bearer ${authToken}` },
                        body: { status: 'ready' }
                    });

                    cy.contains('Hazır', { timeout: 10000 }).should('be.visible');
                });
            });
        });
    });
});
