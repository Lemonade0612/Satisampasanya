// Emergency numbers on the feed hotline card and at the end of each game. Edit numbers HERE only.
// `tel` is the dial string for tel: links. 1362 is always shown; the card also features one of the others in turn.
export const ALWAYS_SHOWN = {
  id: '1362', number: '1362', tel: '1362', tone: 'violet',
  name: { en: "Lao Women's Union", lo: 'ສະຫະພັນແມ່ຍິງລາວ' },
  note: { en: 'Counselling for women and children · 24/7 · WhatsApp 020 9613 1362', lo: 'ໃຫ້ຄຳປຶກສາແມ່ຍິງ ແລະ ເດັກ · 24/7 · WhatsApp 020 9613 1362' },
};

// Rotated as the featured line, one per card.
export const FEATURED_ROTATION = [
  { id: 'imac', number: '+856 20 97631319', tel: '+8562097631319', tone: 'blue',
    name: { en: 'iMAC (IOM)', lo: 'iMAC (IOM)' }, note: { en: 'Help for migrants and trafficking survivors', lo: 'ຊ່ວຍແຮງງານຍ້າຍຖິ່ນ ແລະ ຜູ້ເຄາະຮ້າຍຈາກການຄ້າມະນຸດ' } },
  { id: 'police', number: '1191', tel: '1191', tone: 'blue', name: { en: 'Police', lo: 'ຕຳຫຼວດ' }, note: { en: 'Emergency · someone is in danger now', lo: 'ສຸກເສີນ · ມີຄົນຢູ່ໃນອັນຕະລາຍ' } },
  { id: 'village-focus', number: '021 312519', tel: '+85621312519', tone: 'blue',
    name: { en: 'Village Focus', lo: 'Village Focus' }, note: { en: 'Support and advice', lo: 'ການຊ່ວຍເຫຼືອ ແລະ ຄຳແນະນຳ' } },
  { id: 'ambulance', number: '1195', tel: '1195', tone: 'rose', name: { en: 'Ambulance', lo: 'ລົດໂຮງໝໍ' }, note: { en: 'Medical emergency', lo: 'ເຈັບປ່ວຍສຸກເສີນ' } },
  { id: 'fire', number: '1190', tel: '1190', tone: 'rose', name: { en: 'Fire', lo: 'ດັບເພີງ' }, note: { en: 'Fire emergency', lo: 'ໄຟໄໝ້' } },
];

// Every number on the card, for the small tap-to-call row.
export const ALL_NUMBERS = [ALWAYS_SHOWN, ...FEATURED_ROTATION];

// The feed shows a card after every 10 to 20 posts, chosen at random.
export const FEED_GAP = { min: 10, max: 20 };

// Post indexes (0-based) after which a card goes, for a feed of `total` posts.
export const hotlineSlots = (total, rng = Math.random, gap = FEED_GAP) => {
  const slots = []; let at = -1;
  for (;;) {
    at += gap.min + Math.floor(rng() * (gap.max - gap.min + 1));
    if (at >= total) return slots;
    slots.push(at);
  }
};

// Which hotline is featured on the nth card (rotates).
export const featuredAt = n => FEATURED_ROTATION[((n % FEATURED_ROTATION.length) + FEATURED_ROTATION.length) % FEATURED_ROTATION.length];
