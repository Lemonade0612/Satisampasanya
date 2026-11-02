import { useEffect, useState } from 'react';
import './daily.css';
import { DailyHome, type Launch } from './screens/DailyHome';
import { EndScreen } from './screens/EndScreen';
import { StatsScreen } from './screens/StatsScreen';
import { AdminScreen } from './screens/AdminScreen';
import { StoryGame, type GameResult } from './games/StoryGame';
import { RealOrScam } from './games/RealOrScam';
import { LinkDetective } from './games/LinkDetective';
import { ScamDash } from './games/ScamDash';
import { track } from './lib/analytics';
import { finishSession } from './lib/progress';
import { playable, scenarioOfTheDay, weeklyLevel } from './lib/scenarios';
import type { Lang } from './types';

// Sub-routes live in the hash (#/daily, #/daily/stats, #/daily/admin) because the app has no router.
type Route = 'home' | 'stats' | 'admin';
const readRoute = (): Route => location.hash.startsWith('#/daily/stats') ? 'stats' : location.hash.startsWith('#/daily/admin') ? 'admin' : 'home';
const go = (r: Route) => { location.hash = r === 'home' ? '#/daily' : `#/daily/${r}`; };

export function DailyScreen({ lang, verifier, onCheckOnSati }: { lang: Lang; verifier: string; onCheckOnSati: () => void }) {
  const [route, setRoute] = useState<Route>(readRoute);
  const [play, setPlay] = useState<Launch | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!location.hash.startsWith('#/daily')) go('home');
    const on = () => setRoute(readRoute());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const launch = (l: Launch) => { track({ type: 'session_start', mode: `${l.game}:${l.scope}` }); setResult(null); setPlay(l); setRound(r => r + 1); };
  const exit = () => { setPlay(null); setResult(null); };
  const done = (r: GameResult) => {
    if (!play) return;
    setStreak(finishSession(play.game, r.score, r.failed ? r.scenarioIds.slice(0, -1) : r.scenarioIds).streak);
    setResult(r);
  };

  if (play && result) return <EndScreen lang={lang} game={play.game} result={result} streak={streak} onAgain={() => launch(play)} onHome={exit} onCheck={onCheckOnSati} />;
  if (play) {
    const props = { lang, onExit: exit, onFinish: done };
    if (play.game === 'realorscam') return <RealOrScam key={round} {...props} />;
    if (play.game === 'links') return <LinkDetective key={round} {...props} />;
    if (play.game === 'dash') return <ScamDash key={round} {...props} />;
    const list = play.scope === 'daily' ? [scenarioOfTheDay()] : play.scope === 'weekly' ? weeklyLevel() : playable();
    return <StoryGame key={round} {...props} scenarios={list.filter(Boolean)} mode={play.game === 'flags' ? 'flags' : 'full'} />;
  }
  if (route === 'stats') return <StatsScreen lang={lang} onBack={() => go('home')} />;
  if (route === 'admin') return <AdminScreen lang={lang} verifier={verifier} onBack={() => go('home')} />;
  return <DailyHome lang={lang} onLaunch={launch} onNav={go} />;
}
