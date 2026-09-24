import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
        globals: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary', 'json'],
            reportsDirectory: './coverage',
            include: ['src/**/*.ts'],
            exclude: ['src/scripts/**', '**/*.d.ts', 'src/seed.json'],
            all: true,
        },
    },
});
