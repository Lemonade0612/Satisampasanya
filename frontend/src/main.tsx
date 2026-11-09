import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './styles/index.css';
createRoot(document.getElementById('root')!).render(<App />);

// Web build only: cache the app and the Lao read-aloud clips so they work offline (public/sw.js).
// The iOS/Android apps already carry every file, and dev builds must never serve stale code from a cache.
if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* unsupported or blocked */ }); });
}
