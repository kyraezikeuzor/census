import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@core': resolve(__dirname, 'core'),
            '@frontend': resolve(__dirname, 'frontend-shell'),
            '@members': resolve(__dirname, 'members'),
            'frontend-shell': resolve(__dirname, 'frontend-shell'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            }
        }
    },
    build: {
        target: 'esnext',
    }
});
