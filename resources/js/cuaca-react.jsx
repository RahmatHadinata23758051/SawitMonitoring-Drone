import React from 'react';
import { createRoot } from 'react-dom/client';
import AppCuaca from './components/Pengaturan/AppCuaca';

const el = document.getElementById('react-cuaca-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppCuaca {...props} /></React.StrictMode>);
}
