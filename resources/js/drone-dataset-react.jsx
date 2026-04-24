import React from 'react';
import { createRoot } from 'react-dom/client';
import AppDroneDataset from './components/Dataset/AppDroneDataset';
import AppDroneDatasetForm from './components/Dataset/AppDroneDatasetForm';

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

const formEl = document.getElementById('react-drone-dataset-form-root');
if (formEl) {
    let props = {};
    try { props = JSON.parse(formEl.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(formEl).render(<React.StrictMode><AppDroneDatasetForm {...props} /></React.StrictMode>);
}
