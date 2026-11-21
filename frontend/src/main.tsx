import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import { AboutAi } from './screens/AboutAi';
import './styles/index.css';
// /about-ai is a plain page (how Sati checks content); everything else is the app.
const aboutAi = location.pathname.replace(/\/$/, '') === '/about-ai';
createRoot(document.getElementById('root')!).render(aboutAi ? <AboutAi /> : <App />);

// Web build only: cache the app and the Lao read-aloud clips so they work offline (public/sw.js).
// The iOS/Android apps already carry every file, and dev builds must never serve stale code from a cache.
if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* unsupported or blocked */ }); });
}

// On phones the on-screen keyboard can cover the field being typed in: bring it back into view after the keyboard opens.
document.addEventListener('focusin', event => {
  const el = event.target;
  if (el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !['checkbox', 'radio', 'button', 'submit'].includes(el.type))) setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320);
});
