import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPerangkat from './components/DataMaster/AppPerangkat';

const el = document.getElementById('react-perangkat-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppPerangkat {...props} /></React.StrictMode>);
}
