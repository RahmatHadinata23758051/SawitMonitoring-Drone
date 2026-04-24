import React from 'react';
import { createRoot } from 'react-dom/client';
import AppLogPenerbangan from './components/Laporan/AppLogPenerbangan';

const rootElement = document.getElementById('react-log-penerbangan-root');

if (rootElement) {
    const rawProps = rootElement.getAttribute('data-props');
    let props = {};
    if (rawProps) {
        try {
            props = JSON.parse(rawProps);
        } catch (e) {
            console.error("Failed to parse Log Penerbangan props", e);
        }
    }

    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AppLogPenerbangan {...props} />
        </React.StrictMode>
    );
}
