import React from 'react';
import { createRoot } from 'react-dom/client';
import AppDroneDataset from './components/Dataset/AppDroneDataset';

const rootElement = document.getElementById('react-drone-dataset-root');

if (rootElement) {
    const rawProps = rootElement.getAttribute('data-props');
    let props = {};
    if (rawProps) {
        try {
            props = JSON.parse(rawProps);
        } catch (e) {
            console.error("Failed to parse Drone Dataset props", e);
        }
    }

    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AppDroneDataset {...props} />
        </React.StrictMode>
    );
}
