import { useEffect, useState } from 'react';
import { request } from './api';
import type { Lang } from '../types';

// Text that was written in one language (AI notes, check summaries) is shown in the app language:
// if its script does not match, it is machine-translated once and remembered for the session.
const LAO = /[຀-໿]/, LATIN = /[A-Za-z]{3,}/;
const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();
let running = 0;
const waiting: (() => void)[] = [];
const slot = () => new Promise<void>(go => { if (running < 3) { running++; go(); } else waiting.push(() => { running++; go(); }); });
const free = () => { running--; waiting.shift()?.(); };

export const needsTranslation = (text: string, lang: Lang) => lang === 'lo' ? !LAO.test(text) && LATIN.test(text) : LAO.test(text);

export function useTranslated(text: string | undefined, lang: Lang): string {
  const source = text ?? '';
  const key = `${lang}|${source}`;
  const [done, setDone] = useState<string | undefined>(() => cache.get(key));
  const wanted = !!source && needsTranslation(source, lang);
  useEffect(() => {
    if (!wanted) { setDone(undefined); return; }
    const hit = cache.get(key);
    if (hit) { setDone(hit); return; }
    setDone(undefined);
    let alive = true;
    let job = inflight.get(key);
    if (!job) {
      job = slot().then(() => request<{ text: string }>('/translate', 'POST', { text: source.slice(0, 2000), target: lang }, 30000))
        .then(r => { cache.set(key, r.text); return r.text; })
        .finally(() => { free(); inflight.delete(key); });
      inflight.set(key, job);
    }
    job.then(t => { if (alive) setDone(t); }).catch(() => { /* keep the original text */ });
    return () => { alive = false; };
  }, [key, wanted]);
  return wanted ? (done ?? source) : source;
}

/** Renders `text` in the app language (see useTranslated). */
export function Tr({ text, lang }: { text: string; lang: Lang }) { return <>{useTranslated(text, lang)}</>; }
