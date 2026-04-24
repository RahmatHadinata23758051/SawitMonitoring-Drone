import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css', 
                'resources/js/app.js',
                'resources/js/gcs-react.jsx',
                'resources/js/dashboard-react.jsx',
                'resources/js/laporan-ai-react.jsx'
            ],
            refresh: true,
        }),
        react(),
    ],
});
