import React from 'react';
import { createRoot } from 'react-dom/client';
import AppKebunDataset from './components/Dataset/AppKebunDataset';

const el = document.getElementById('react-kebun-dataset-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppKebunDataset {...props} /></React.StrictMode>);
}
