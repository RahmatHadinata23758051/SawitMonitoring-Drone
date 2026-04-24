import React from 'react';
import { createRoot } from 'react-dom/client';
import AppSawitDataset from './components/Dataset/AppSawitDataset';

const el = document.getElementById('react-sawit-dataset-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppSawitDataset {...props} /></React.StrictMode>);
}
