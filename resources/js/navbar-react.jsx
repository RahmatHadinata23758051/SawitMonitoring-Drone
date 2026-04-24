import React from 'react';
import { createRoot } from 'react-dom/client';
import AppNavbar from './components/Navigation/AppNavbar';

const rootElement = document.getElementById('react-navbar-root');

if (rootElement) {
    const rawProps = rootElement.getAttribute('data-props');
    let props = {};
    if (rawProps) {
        try {
            props = JSON.parse(rawProps);
        } catch (e) {
            console.error("Failed to parse Navbar props", e);
        }
    }

    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AppNavbar {...props} />
        </React.StrictMode>
    );
}
