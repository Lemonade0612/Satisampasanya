import { useEffect, useState , type ReactNode } from 'react';
import './daily.css';
import { DailyHome, type Launch } from './screens/DailyHome';
import { EndScreen } from './screens/EndScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { StoryGame, type GameResult } from './games/StoryGame';
import { RealOrScam } from './games/RealOrScam';
import { LinkDetective } from './games/LinkDetective';
import { ScamDash } from './games/ScamDash';
import { ScamDetective } from './games/ScamDetective';
import { ScamCall } from './games/ScamCall';
import { track } from './lib/analytics';
import { finishSession } from './lib/progress';
import { playable, scenarioOfTheDay, useLiveScenarios, weeklyLevel } from './lib/scenarios';
import { useBand } from '../../lib/band';
import type { Lang, Scenario } from './types';

// Sub-routes live in the hash (#/daily, #/daily/progress) because the app has no router. #/daily/stats is the old address.
// Scenario review and organisation-wide impact are staff-only and live in the separate admin app, never in this bundle.
type Route = 'home' | 'progress';
const readRoute = (): Route => /^#\/daily\/(progress|stats)/.test(location.hash) ? 'progress' : 'home';
const go = (r: Route) => { location.hash = r === 'home' ? '#/daily' : `#/daily/${r}`; };

// `homeHeader` is shown in the home header (e.g. the language switch for guests), `homeFooter` floats at the
// bottom of the home screen (e.g. the offline chip). Neither shows inside a game.
export function DailyScreen({ lang, onCheckOnSati, homeHeader, homeFooter }: { lang: Lang; onCheckOnSati: () => void; homeHeader?: ReactNode; homeFooter?: ReactNode }) {
  const [route, setRoute] = useState<Route>(readRoute);
  const [play, setPlay] = useState<Launch | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const band = useBand();
  useLiveScenarios(band);

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
    if (play.game === 'detective') return <ScamDetective key={round} {...props} />;
    if (play.game === 'call') return <ScamCall key={round} {...props} />;
    if (play.game === 'dash') return <ScamDash key={round} {...props} />;
    const list = play.scope === 'daily' ? [scenarioOfTheDay(band)] : play.scope === 'weekly' ? weeklyLevel(band) : playable(band);
    return <StoryGame key={round} {...props} scenarios={list.filter((s): s is Scenario => !!s)} mode={play.game === 'flags' ? 'flags' : 'full'} />;
  }
  if (route === 'progress') return <ProgressScreen lang={lang} onBack={() => go('home')} />;
  return <DailyHome lang={lang} onLaunch={launch} onNav={go} header={homeHeader} footer={homeFooter} />;
}
