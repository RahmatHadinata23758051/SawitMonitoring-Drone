import React from 'react';
import { createRoot } from 'react-dom/client';
import AppLaporanAI from './components/Laporan/AppLaporanAI';

const rootElement = document.getElementById('react-laporan-ai-root');

if (rootElement) {
    const rawProps = rootElement.getAttribute('data-props');
    let props = {};
    if (rawProps) {
        try {
            props = JSON.parse(rawProps);
        } catch (e) {
            console.error("Failed to parse Laporan AI props", e);
        }
    }

    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AppLaporanAI {...props} />
        </React.StrictMode>
    );
}
