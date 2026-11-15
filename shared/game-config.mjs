// Tuning knobs for the Daily games, in one place. Plain .mjs so the tests can import it without a build.

// Real or Scam: seconds per card by age band (0 = no timer). Youth and adults were 6 s and 8 s; now about 25% more.
export const REAL_OR_SCAM_SECONDS = { kids: 0, youth: 7.5, adult: 10, elder: 0 };
// Pause after every answer before "Next" works, so the result card can be read.
export const ANSWER_PAUSE_MS = 1500;
// Confetti on this many right answers in a row (and every one after).
export const STREAK_CONFETTI = 5;
// Link Hunt: links per game. Half real, half fake.
export const LINK_HUNT_ROUNDS = 10;

export const shuffle = (list, rng = Math.random) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};

// Picks `count` links, half real and half fake (real gets the extra one when count is odd), in a fresh order each game.
export const pickLinkRounds = (pool, count = LINK_HUNT_ROUNDS, rng = Math.random) => {
  const real = shuffle(pool.filter(l => l.isReal), rng), fake = shuffle(pool.filter(l => !l.isReal), rng);
  const nReal = Math.min(real.length, Math.ceil(count / 2)), nFake = Math.min(fake.length, count - nReal);
  return shuffle([...real.slice(0, nReal), ...fake.slice(0, nFake)], rng);
};

// The part of a link that decides who owns it: what sits between "//" and the first single "/" (port and login part removed).
export const realDomain = url => {
  try { return new URL(url).hostname; } catch { return url.replace(/^[a-z]+:\/\//i, '').split(/[/?#]/)[0]; }
};
