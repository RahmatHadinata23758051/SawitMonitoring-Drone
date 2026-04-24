import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPanen from './components/Manajemen/AppPanen';

const el = document.getElementById('react-panen-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppPanen {...props} /></React.StrictMode>);
}
