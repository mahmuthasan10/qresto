import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
    env: {
        adminEmail: process.env.CYPRESS_ADMIN_EMAIL || '',
        adminPassword: process.env.CYPRESS_ADMIN_PASSWORD || '',
    },
});
