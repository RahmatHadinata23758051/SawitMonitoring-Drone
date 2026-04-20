import React from 'react';
import { createRoot } from 'react-dom/client';
import AppGCS from './components/GCS/AppGCS';

const container = document.getElementById('react-gcs-root');
if (container) createRoot(container).render(<AppGCS />);
