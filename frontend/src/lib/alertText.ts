import type { Lang, Notification } from '../types';

const VERBS: Record<Lang, Record<Notification['kind'] | 'approved', string>> = {
  en: { review_requested: 'requested a post review', review_overdue: 'has a review overdue by 48 hours', review: 'reviewed your post', approved: 'approved your post', news: 'published a news update', safety: 'shared a safety alert', comment: 'commented on your post', like: 'liked your post', warned: 'found your warning helpful', repost: 'reposted your post' },
  lo: { review_requested: 'ມີໂພສລໍຖ້າການກວດ', review_overdue: 'ໂພສລໍຖ້າເກີນ 48 ຊົ່ວໂມງ', review: 'ກວດໂພສຂອງທ່ານແລ້ວ', approved: 'ອະນຸມັດໂພສຂອງທ່ານແລ້ວ', news: 'ເຜີຍແຜ່ຂ່າວໃໝ່', safety: 'ແຊຣ໌ຄຳເຕືອນ', comment: 'ສະແດງຄຳຄິດເຫັນໃນໂພສຂອງທ່ານ', like: 'ມັກໂພສຂອງທ່ານ', warned: 'ໄດ້ຮັບຄຳເຕືອນຈາກໂພສຂອງທ່ານ', repost: 'ແບ່ງປັນໂພສຂອງທ່ານ' },
};

// Mirrors backend/push.mjs so the in-app banner and the lock-screen push read the same.
export const alertVerb = (alert: Notification, lang: Lang) =>
  VERBS[lang][alert.kind === 'review' && alert.review_state === 'clean' ? 'approved' : alert.kind];
