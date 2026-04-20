/**
 * useAppSettings.js
 * Hook untuk fetch branding/pengaturan aplikasi dari Laravel API.
 * Mensinkronkan title tab browser secara otomatis.
 */

import { useState, useEffect } from 'react';

export function useAppSettings() {
  const [appSettings, setAppSettings] = useState({
    name: 'Drone CPS',
    image: null,
    version: '1.0.0',
    tab_name: 'GCS — Drone CPS',
    copyright: 'MakeSens',
    copyright_year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetch('/api/pengaturan-aplikasi')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setAppSettings(prev => ({ ...prev, ...data }));
          if (data.tab_name) document.title = `GCS · ${data.tab_name}`;
          else if (data.name) document.title = `GCS · ${data.name}`;
        }
      })
      .catch(() => {});
  }, []);

  return { appSettings };
}
