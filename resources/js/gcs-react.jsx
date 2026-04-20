import React from 'react';
import { createRoot } from 'react-dom/client';
import DashboardApp from './components/GCS/DashboardApp';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('react-gcs-root');
    if (container) {
        const root = createRoot(container);
        root.render(<DashboardApp />);
    }
});
