import type { SVGProps } from "react";

// Stroke icons used across the site (24x24 grid). Decorative by default.
const PATHS = {
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M5 5l14 14M19 5L5 19",
  search: "M21 21l-4.3-4.3M18 11a7 7 0 11-14 0 7 7 0 0114 0z",
  phone: "M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z",
  mail: "M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
  list: "M4 6h16M4 12h16M4 18h10",
  lines: "M4 6h16M4 12h10M4 18h7",
  gamepad: "M8 12h3M9.5 10.5v3M15 11h.01M17 13h.01M7 6h10a4 4 0 014 4v4a4 4 0 01-4 4H7a4 4 0 01-4-4v-4a4 4 0 014-4z",
  chat: "M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z",
  face: "M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  shieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  home: "M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z",
  briefcase: "M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  flag: "M4 22V4h12l-2 4 2 4H4",
  lock: "M8 11V7a4 4 0 018 0v4M6 11h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z",
  eyeOff: "M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 5 9 7a12 12 0 01-2.3 3.3M6.6 6.6C4.3 8 3 10.5 3 12c0 2 4 7 9 7 1.6 0 3-.4 4.3-1",
  pin: "M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11zM14.5 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  userCheck: "M2 21a7 7 0 0114 0M16 11l2 2 4-4M13 8a4 4 0 11-8 0 4 4 0 018 0z",
  plus: "M12 5v14M5 12h14",
  share: "M8.6 13.5l6.8 4M15.4 6.5l-6.8 4M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zM21 19a3 3 0 11-6 0 3 3 0 016 0z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  user: "M4 21a8 8 0 0116 0M16 8a4 4 0 11-8 0 4 4 0 018 0z",
  warning: "M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01",
  heart: "M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0012 5.5 5.5 5.5 0 002 8.5c0 2.3 1.5 4 3 5.5l7 7z",
  bell: "M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0",
  globe: "M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20M22 12a10 10 0 11-20 0 10 10 0 0120 0z",
  chevron: "M6 9l6 6 6-6",
  scan: "M11 8h6M21 21l-4.3-4.3M18 11a7 7 0 11-14 0 7 7 0 0114 0z",
  phoneMock: "M11 18h2M9 2h6a3 3 0 013 3v14a3 3 0 01-3 3H9a3 3 0 01-3-3V5a3 3 0 013-3z",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, size = 22, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  );
}

export function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
    </svg>
  );
}
