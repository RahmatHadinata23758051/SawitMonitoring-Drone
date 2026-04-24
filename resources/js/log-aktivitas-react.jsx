import React from 'react';
import { createRoot } from 'react-dom/client';
import AppLogAktivitas from './components/DataMaster/AppLogAktivitas';

const el = document.getElementById('react-log-aktivitas-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppLogAktivitas {...props} /></React.StrictMode>);
}
