import React from 'react';
import ReactDOM from 'react-dom/client';
import AppDashboard from './components/Dashboard/AppDashboard';

const rootElement = document.getElementById('react-dashboard-root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    let props = {};

    try {
        const rawProps = rootElement.getAttribute('data-props');
        if (rawProps) {
            props = JSON.parse(rawProps);
        }
    } catch (e) {
        console.error("Failed to parse Dashboard props:", e);
    }

    root.render(
        <React.StrictMode>
            <AppDashboard {...props} />
        </React.StrictMode>
    );
}
