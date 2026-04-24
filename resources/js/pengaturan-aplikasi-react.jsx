import React from 'react';
import { createRoot } from 'react-dom/client';
import AppPengaturanAplikasi from './components/Pengaturan/AppPengaturanAplikasi';

const el = document.getElementById('react-pengaturan-aplikasi-root');
if (el) {
    let props = {};
    try { props = JSON.parse(el.getAttribute('data-props') || '{}'); } catch(e) {}
    createRoot(el).render(<React.StrictMode><AppPengaturanAplikasi {...props} /></React.StrictMode>);
}
