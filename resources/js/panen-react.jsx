import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPanen from './components/Manajemen/AppPanen';
import AppPanenForm from './components/Manajemen/AppPanenForm';

const el = document.getElementById('react-panen-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppPanen {...props} /></React.StrictMode>);
}

const formEl = document.getElementById('react-panen-form-root');
if (formEl) {
    let props = {};
    try { props = JSON.parse(formEl.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(formEl).render(<React.StrictMode><AppPanenForm {...props} /></React.StrictMode>);
}

