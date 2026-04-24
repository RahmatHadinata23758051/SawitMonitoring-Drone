import React from 'react';
import { createRoot } from 'react-dom/client';
import AppUser from './components/DataMaster/AppUser';

const el = document.getElementById('react-user-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppUser {...props} /></React.StrictMode>);
}
