import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPerangkat from './components/DataMaster/AppPerangkat';
import AppPerangkatForm from './components/DataMaster/AppPerangkatForm';

const el = document.getElementById('react-perangkat-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppPerangkat {...props} /></React.StrictMode>);
}

const formEl = document.getElementById('react-perangkat-form-root');
if (formEl) {
    let props = {};
    try { props = JSON.parse(formEl.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(formEl).render(<React.StrictMode><AppPerangkatForm {...props} /></React.StrictMode>);
}

