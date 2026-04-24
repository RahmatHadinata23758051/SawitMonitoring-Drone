import React from 'react';
import { createRoot } from 'react-dom/client';
import AppLahan from './components/DataMaster/AppLahan';

const el = document.getElementById('react-lahan-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppLahan {...props} /></React.StrictMode>);
}
