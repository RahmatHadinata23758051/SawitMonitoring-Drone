import React from 'react';
import { createRoot } from 'react-dom/client';
import AppUser from './components/DataMaster/AppUser';
import AppUserForm from './components/DataMaster/AppUserForm';

const el = document.getElementById('react-user-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppUser {...props} /></React.StrictMode>);
}

const formEl = document.getElementById('react-user-form-root');
if (formEl) {
    let props = {};
    try { props = JSON.parse(formEl.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(formEl).render(<React.StrictMode><AppUserForm {...props} /></React.StrictMode>);
}

