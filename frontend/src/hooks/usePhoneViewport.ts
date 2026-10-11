import { useEffect } from 'react';

/** Keep the composer and reply button above the software keyboard. */
export function usePhoneViewport() {
  useEffect(() => {
    const viewport=window.visualViewport;
    const update=()=>{
      document.documentElement.style.setProperty('--app-height',`${viewport?.height || window.innerHeight}px`);
      const active=document.activeElement;
      if(active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) requestAnimationFrame(()=>active.scrollIntoView({block:'nearest'}));
    };
    update();viewport?.addEventListener('resize',update);window.addEventListener('resize',update);
    return()=>{viewport?.removeEventListener('resize',update);window.removeEventListener('resize',update);};
  },[]);
}
