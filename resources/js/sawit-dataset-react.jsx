import React from 'react';
import { createRoot } from 'react-dom/client';
import AppSawitDataset from './components/Dataset/AppSawitDataset';
import AppSawitDatasetForm from './components/Dataset/AppSawitDatasetForm';

const el = document.getElementById('react-sawit-dataset-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppSawitDataset {...props} /></React.StrictMode>);
}

const formEl = document.getElementById('react-sawit-dataset-form-root');
if (formEl) {
    let props = {};
    try { props = JSON.parse(formEl.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(formEl).render(<React.StrictMode><AppSawitDatasetForm {...props} /></React.StrictMode>);
}

