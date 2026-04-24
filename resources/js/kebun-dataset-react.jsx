import React from 'react';
import { createRoot } from 'react-dom/client';
import AppKebunDataset from './components/Dataset/AppKebunDataset';
import AppKebunDatasetForm from './components/Dataset/AppKebunDatasetForm';

const el = document.getElementById('react-kebun-dataset-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppKebunDataset {...props} /></React.StrictMode>);
}

const formEl = document.getElementById('react-kebun-dataset-form-root');
if (formEl) {
    let props = {};
    try { props = JSON.parse(formEl.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(formEl).render(<React.StrictMode><AppKebunDatasetForm {...props} /></React.StrictMode>);
}

