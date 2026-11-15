import { useSyncExternalStore } from 'react';
const subs = (f: () => void) => { window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); };
export const useHash = () => useSyncExternalStore(subs, () => location.hash, () => '');
