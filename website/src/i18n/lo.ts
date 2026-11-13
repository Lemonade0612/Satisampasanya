import type { Dict } from "./en";

// Lao copy. Lines taken from the design are real Lao; everything marked
// TODO is still English and needs a Lao translation.
export const lo: Dict = {
  brand: "Satisampasanya", // TODO: Lao brand spelling if wanted
  logoAlt: "Sati logo",
  nav: {
    home: "ໜ້າຫຼັກ", // TODO: confirm
    about: "About us", // TODO
    app: "The app", // TODO
    impact: "Impact", // TODO
    help: "Get help", // TODO
    feedback: "Feedback", // TODO
    getApp: "Get the app", // TODO
    langToggle: "ລາວ / EN",
    langToggleLabel: "ປ່ຽນພາສາ ລາວ / English", // TODO: confirm
    menuOpen: "Open menu", // TODO
    menuClose: "Close menu", // TODO
    mainNav: "Main navigation", // TODO
  },
  footer: {
    blurb:
      "A bilingual anti-scam and anti-trafficking platform, started by Lao youth in Vientiane.", // TODO
    sati: "Sati",
    app: "App", // TODO
    connect: "Connect", // TODO
    features: "Features", // TODO
    emailUs: "Email us", // TODO
    rights: "© 2026 Satisampasanya. All rights reserved.", // TODO
    privacy: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ",
    guidelines: "ກົດລະບຽບຊຸມຊົນ",
    terms: "ເງື່ອນໄຂການນຳໃຊ້",
  },
  home: {
    badge: "Started by Lao youth, for Lao youth", // TODO
    h1a: "ມີສະຕິ ກ່ອນຄລິກ", // from design tagline
    h1b: "ປອດໄພ",
    h1c: "ໄປນຳກັນ",
    tagline: "ມີສະຕິ ກ່ອນຄລິກ — ປອດໄພໄປນຳກັນ",
    lead: "Sati is a bilingual app that helps young people in Laos spot online scams and trafficking traps — through a checked community feed, daily games, an AI safety assistant and official help in one place.", // TODO
    download: "Download Sati", // TODO
    story: "Our story →", // TODO
    appStoreSmall: "Download on the",
    appStore: "App Store",
    playSmall: "Get it on",
    play: "Google Play",
    phone: {
      forYou: "For you", // TODO
      post1: "“Send 200,000 kip to unlock your prize” — real?", // TODO
      post3: "Scholarship page verified by expert.", // TODO
      yellow: "YELLOW", // TODO
      red: "RED", // TODO
      green: "GREEN", // TODO
      tabs: ["Feed", "Play", "Ask AI", "Help", "Me"], // TODO
      mock: "Illustration of the Sati app feed", // TODO
    },
    badgeVerified: "Expert verified", // TODO
    badgeVerifiedTime: "✓ 48h",
    badgeStreak: "Sati Daily · streak", // TODO
    badgeStreakUnit: "days", // TODO
    featuresEyebrow: "Inside the app", // TODO
    featuresTitle: "Everything from our mobile app, made for every age.", // TODO
    features: [
      {
        kicker: "Community feed", // TODO
        title: "Posts that get checked", // TODO
        body: "Share suspicious offers. Sati AI moderates each post and experts verify within 48 hours: green, yellow or red.", // TODO
      },
      {
        kicker: "Sati Daily",
        title: "Games with fresh scenarios", // TODO
        body: "Short daily games for Kids, Youth, Adults and Elders — learn red flags by playing.", // TODO
      },
      {
        kicker: "AI assistant", // TODO
        title: "Ask before you act", // TODO
        body: "Youth and adults can ask Sati AI whether an offer, link or message is safe — in Lao or English.", // TODO
      },
    ],
    agesEyebrow: "Who is playing?", // TODO
    agesTitle: "Youth at the heart. Family all around.", // TODO
    ages: [
      { name: "Kids", band: "6–14 · Lao-first", body: "Interactive fake bait posts and 3 games." }, // TODO
      { name: "Youth", band: "15–24 · core", body: "Jobs, money, romance and labour scams. AI chat + 5 games." }, // TODO
      { name: "Adults", band: "25–59 · protectors", body: "Help parents protect the young people at home." }, // TODO
      { name: "Elders", band: "60+ · simple mode", body: "Big text, few buttons: money, trust and internet basics." }, // TODO
    ],
    statLabels: ["Active users", "Posts checked", "Scams flagged", "Expert verification"], // TODO
    ctaTitle: "ເບິ່ງຕົວເລກ ແລະ ລົງມືເຮັດ",
    ctaLao: "ເບິ່ງຕົວເລກ ແລະ ລົງມືເຮັດ",
    ctaImpact: "View our impact", // TODO
    ctaFeedback: "Give feedback", // TODO
  },
  soon: {
    title: "Coming next", // TODO
    body: "This page is built after Home is approved.", // TODO
  },
};
