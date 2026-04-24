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
                'resources/js/laporan-ai-react.jsx',
                'resources/js/log-penerbangan-react.jsx',
                'resources/js/navbar-react.jsx',
                'resources/js/drone-dataset-react.jsx',
                'resources/js/kebun-dataset-react.jsx',
                'resources/js/sawit-dataset-react.jsx',
                'resources/js/user-react.jsx',
                'resources/js/log-aktivitas-react.jsx',
                'resources/js/lahan-react.jsx',
                'resources/js/kebun-react.jsx',
                'resources/js/perangkat-react.jsx',
                'resources/js/pengaturan-aplikasi-react.jsx'
            ],
            refresh: true,
        }),
        react(),
    ],
});
