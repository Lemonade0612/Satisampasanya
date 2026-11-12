# Suspected Thai-isms in Lao strings

Generated 2026-11-09 by scanning every Lao string in `frontend/src`, `shared`, `backend` and `admin/src`.
**Nothing has been replaced.** This list is for review with a native Lao speaker. When a change is agreed, edit the string, mark it `// REVIEW-LO`, and tick it here.

Status:
- **suggest replace**: a clear Thai word or Thai spelling where a common Lao word exists.
- **review**: probably Thai-influenced, but Lao usage varies.
- **native speaker decides**: common in spoken or written Lao. Keep or replace by your call.

The rules for new copy are in [lao-style.md](lao-style.md).

## Summary

| Current | Suggested | Why | Status | Hits |
|---|---|---|---|---|
| ຟຣີ | keep, or ບໍ່ເສຍເງິນ | common in Lao, Thai-style ຣ | native speaker decides | 68 |
| ດາຣາ | ດາລາ | ຣ in a character name | review | 42 |
| ແຊຣ໌ | ແບ່ງປັນ | Thai แชร์ (ຣ + ໌) | suggest replace | 37 |
| ຈິງ | ແທ້ | Thai จริง (Lao also has ຄວາມຈິງ, ຕົວຈິງ) | native speaker decides | 31 |
| ຣ | ລ, or drop | other ຣ spelling (Thai-style cluster) | review | 17 |
| ພີ່ | ອ້າຍ / ເອື້ອຍ | Thai พี่ used as "I/you" | suggest replace | 9 |
| ເຊີໄພຣສ໌ | ຂອງຂວັນລັບ / ເຊີໄພສ | Thai spelling (ຣ + ໌) | suggest replace | 8 |
| ຣີເຊັດ | ຕັ້ງ…ໃໝ່ | Thai-English รีเซ็ต | suggest replace | 8 |
| ຄຣິບໂຕ | one spelling (ຄຣິບໂຕ?) | three spellings in use | review | 6 |
| ໂປຣໄຟລ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | Thai spelling โปรไฟล์ | review | 6 |
| ໂອເຄ | ໄດ້ / ຕົກລົງ | Thai-English โอเค | native speaker decides | 4 |
| ເທຣດ | ຊື້ຂາຍ | Thai-English เทรด | suggest replace | 4 |
| ຮີບ | ຟ້າວ | Thai รีบ | suggest replace | 4 |
| ຄອມເມັນ | ຄຳເຫັນ | Thai-English คอมเมนต์ | suggest replace | 3 |
| ໂປຣໄຟລ໌ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | Thai spelling โปรไฟล์ | review | 2 |
| ມິດສາຊີບ | ຄົນຫຼອກລວງ | Thai มิจฉาชีพ (also seen in Lao media) | native speaker decides | 2 |
| ຄຣີບໂຕ | one spelling (ຄຣິບໂຕ?) | three spellings in use | review | 2 |
| ຊົມຣົມ | ຊົມລົມ / ສະໂມສອນ | Thai ชมรม | suggest replace | 1 |
| ຄຣິສໂຕ | one spelling (ຄຣິບໂຕ?) | three spellings in use | review | 1 |
| ແຄັບ | ຖ່າຍຮູບໜ້າຈໍ | Thai แคป | suggest replace | 1 |

No Thai script (U+0E00–U+0E7F) was found.

Not listed: Lao words that only look like a hit (ເພີ່ມ, ບັງຄັບ, ມາກວດ), and ດ່ວນ, which is shared Lao/Thai vocabulary.

## Every hit

| ✓ | File | Current | In context | Suggested | Status |
|---|---|---|---|---|---|
| ☐ | [backend/intelligence.mjs:39](../backend/intelligence.mjs#L39) | ຈິງ | ້ບໍ່ແມ່ນການຢືນຢັນຂໍ້ເທັດຈິງໂດຍ | ແທ້ | native speaker decides |
| ☐ | [backend/scenario-drafts.json:9](../backend/scenario-drafts.json#L9) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [backend/scenario-drafts.json:38](../backend/scenario-drafts.json#L38) | ຟຣີ | ເພັດຟຣີສຳລັບເກມບໍ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [backend/scenario-drafts.json:39](../backend/scenario-drafts.json#L39) | ຟຣີ | ສັນຍາໃຫ້ເພັດເກມຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [backend/scenario-drafts.json:45](../backend/scenario-drafts.json#L45) | ຟຣີ | ເຈົ້າໄດ້ຮັບເພັດຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [backend/scenario-drafts.json:55](../backend/scenario-drafts.json#L55) | ຟຣີ | ບໍ່ມີໃຜແຈກເພັດຟຣີແລກກັບລະຫັດຜ່ານ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [backend/seed.json:67](../backend/seed.json#L67) | ຈິງ | ສະເໜີສິນຄ້າທີ່ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [backend/seed.json:167](../backend/seed.json#L167) | ຟຣີ | ໃນລາວໃຫ້ການຊ່ວຍເຫຼືອຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/components/feed/CommunityScore.tsx:8](../frontend/src/components/feed/CommunityScore.tsx#L8) | ຈິງ | ດ້ພິສູດວ່າຂໍ້ມູນເປັນຄວາມຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:12](../frontend/src/components/feed/DailySafetyTip.tsx#L12) | ຈິງ | ຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:14](../frontend/src/components/feed/DailySafetyTip.tsx#L14) | ຈິງ | ຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:16](../frontend/src/components/feed/DailySafetyTip.tsx#L16) | ຈິງ | ຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:18](../frontend/src/components/feed/DailySafetyTip.tsx#L18) | ຈິງ | ຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:20](../frontend/src/components/feed/DailySafetyTip.tsx#L20) | ມິດສາຊີບ | ມີແຕ່ມິດສາຊີບທີ່ຕ້ອງການໃຫ້ຖືສາຍໄວ້ | ຄົນຫຼອກລວງ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:20](../frontend/src/components/feed/DailySafetyTip.tsx#L20) | ຈິງ | ຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:22](../frontend/src/components/feed/DailySafetyTip.tsx#L22) | ຈິງ | ຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:24](../frontend/src/components/feed/DailySafetyTip.tsx#L24) | ມິດສາຊີບ | ມິດສາຊີບມັກບອກວ່າ | ຄົນຫຼອກລວງ | native speaker decides |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:24](../frontend/src/components/feed/DailySafetyTip.tsx#L24) | ຈິງ | ຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:34](../frontend/src/features/daily/data/bandSessions.ts#L34) | ຟຣີ | ສະກິນຟຣີ ແລກກັບລະຫັດຜ່ານ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:37](../frontend/src/features/daily/data/bandSessions.ts#L37) | ຟຣີ | ຢາກໄດ້ສະກິນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:43](../frontend/src/features/daily/data/bandSessions.ts#L43) | ຟຣີ | ສະກິນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:67](../frontend/src/features/daily/data/bandSessions.ts#L67) | ໂອເຄ | ໂອເຄບໍ | ໄດ້ / ຕົກລົງ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:177](../frontend/src/features/daily/data/bandSessions.ts#L177) | ຟຣີ | ເດີນທາງຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:183](../frontend/src/features/daily/data/bandSessions.ts#L183) | ຟຣີ | ຄວາມລັບ ບວກ ການເດີນທາງຟຣີ ແມ່ນເຫຍື່ອລໍ້ແບບເກົ່າ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:224](../frontend/src/features/daily/data/bandSessions.ts#L224) | ຟຣີ | ກີບ ຫໍພັກ ແລະ ອາຫານຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:230](../frontend/src/features/daily/data/bandSessions.ts#L230) | ຟຣີ | ກີບ ຫໍພັກ ແລະ ອາຫານຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:34](../frontend/src/features/daily/data/callDays.ts#L34) | ຟຣີ | ນ້ອງໄດ້ເພັດຟຣີ ໜຶ່ງໝື່ນເມັດໃນເກມ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:45](../frontend/src/features/daily/data/callDays.ts#L45) | ຟຣີ | ໃຫ້ໃຜ ແມ່ນແຕ່ເພື່ອລາງວັນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:258](../frontend/src/features/daily/data/callDays.ts#L258) | ຟຣີ | ມີອາຫານຟຣີ ຫ້ອງພັກຟຣີ ຢູ່ຫ້ອງການໃກ້ຊາ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:258](../frontend/src/features/daily/data/callDays.ts#L258) | ຟຣີ | ມີອາຫານຟຣີ ຫ້ອງພັກຟຣີ ຢູ່ຫ້ອງການໃກ້ຊາຍແດນ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:263](../frontend/src/features/daily/data/callDays.ts#L263) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:268](../frontend/src/features/daily/data/callDays.ts#L268) | ຟຣີ | ຫ້ອງ ແລະ ຄ່າເດີນທາງຟຣີ ອາດກາຍເປັນໜີ້ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:285](../frontend/src/features/daily/data/callDays.ts#L285) | ຈິງ | ເຮັດວຽກຕົວຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:420](../frontend/src/features/daily/data/callDays.ts#L420) | ຟຣີ | ພາດການລົມຟຣີ ທີ່ອາດປົກປ້ອງລູກຊາຍ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:561](../frontend/src/features/daily/data/callDays.ts#L561) | ຈິງ | ່ງທີ່ສັ່ງແທ້ ແລະ ຈ່າຍຕົວຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/callDays.ts:672](../frontend/src/features/daily/data/callDays.ts#L672) | ຟຣີ | ເງິນເດືອນຄືເກົ່າ ຫໍພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:32](../frontend/src/features/daily/data/dashJourney.ts#L32) | ຟຣີ | ປີ້ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:117](../frontend/src/features/daily/data/dashJourney.ts#L117) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:135](../frontend/src/features/daily/data/dashJourney.ts#L135) | ຟຣີ | ສະກິນ ຫຼື ເພັດຟຣີຈາກຄົນແປກໜ້າ ແມ່ນກົນຫຼອກ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:30](../frontend/src/features/daily/data/detectiveCases.ts#L30) | ຈິງ | ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:30](../frontend/src/features/daily/data/detectiveCases.ts#L30) | ຟຣີ | ອັນ ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:30](../frontend/src/features/daily/data/detectiveCases.ts#L30) | ຟຣີ | ຂອງຫາຍາກຟຣີ ໂດຍບໍ່ໄດ້ເຮັດຫຍັງ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:40](../frontend/src/features/daily/data/detectiveCases.ts#L40) | ຟຣີ | ໃຫ້ໃຜ ແມ່ນແຕ່ເພື່ອລາງວັນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:84](../frontend/src/features/daily/data/detectiveCases.ts#L84) | ຈິງ | ການບອກຄວາມຈິງ ຊະນະກົນຫຼອກທຸກເທື່ອ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:92](../frontend/src/features/daily/data/detectiveCases.ts#L92) | ຈິງ | ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:109](../frontend/src/features/daily/data/detectiveCases.ts#L109) | ຈິງ | ນັດພົບຄອບຄົວຕົວຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:157](../frontend/src/features/daily/data/detectiveCases.ts#L157) | ຟຣີ | ມ ນ້ອຍເຫັນຂໍ້ສະເໜີລາງວັນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:159](../frontend/src/features/daily/data/detectiveCases.ts#L159) | ຟຣີ | ເພັດຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:159](../frontend/src/features/daily/data/detectiveCases.ts#L159) | ຟຣີ | ລາງວັນຟຣີແມ່ນເຫຍື່ອ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:175](../frontend/src/features/daily/data/detectiveCases.ts#L175) | ຟຣີ | ອາຫານຟຣີ ຫ້ອງພັກຟຣີ ທີ່ຫ້ອງການໃກ້ຊາ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:175](../frontend/src/features/daily/data/detectiveCases.ts#L175) | ຟຣີ | ອາຫານຟຣີ ຫ້ອງພັກຟຣີ ທີ່ຫ້ອງການໃກ້ຊາຍແດນ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:175](../frontend/src/features/daily/data/detectiveCases.ts#L175) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:184](../frontend/src/features/daily/data/detectiveCases.ts#L184) | ຟຣີ | ທີ່ພັກ ແລະ ຄ່າເດີນທາງຟຣີ ອາດກາຍເປັນໜີ້ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:215](../frontend/src/features/daily/data/detectiveCases.ts#L215) | ຈິງ | ສະຖານທີ່ແທ້ ພົບກັນຕົວຈິງ ທ່ານເກັບເອກະສານເອງ ແລະ ເຂົ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:357](../frontend/src/features/daily/data/detectiveCases.ts#L357) | ໂອເຄ | ໂອເຄ ພົບກັນ | ໄດ້ / ຕົກລົງ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:401](../frontend/src/features/daily/data/detectiveCases.ts#L401) | ຈິງ | ຈ່າຍຕົວຈິງ ບ່ອນທີ່ຮູ້ຈັກ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:408](../frontend/src/features/daily/data/detectiveCases.ts#L408) | ຈິງ | ່ທ່ານເຮັດ ແລະ ໃຫ້ຈ່າຍຕົວຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:450](../frontend/src/features/daily/data/detectiveCases.ts#L450) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:450](../frontend/src/features/daily/data/detectiveCases.ts#L450) | ຟຣີ | ຟຣີ ມາດ້ວຍຕົນເອງ ບໍ່ມີລິ້ງ ບໍ່ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:464](../frontend/src/features/daily/data/detectiveCases.ts#L464) | ຟຣີ | ເງິນເດືອນຄືເກົ່າ ຫໍພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:464](../frontend/src/features/daily/data/detectiveCases.ts#L464) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:57](../frontend/src/features/daily/data/minigames.json#L57) | ຟຣີ | ເຂົ້າຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:151](../frontend/src/features/daily/data/minigames.json#L151) | ຈິງ | ພົບກັນຕົວຈິງ ແລະ ບໍ່ຂໍເງິນ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:253](../frontend/src/features/daily/data/minigames.json#L253) | ຟຣີ | ເດືອນ ອາຫານຟຣີ ຫ້ອງພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:253](../frontend/src/features/daily/data/minigames.json#L253) | ຟຣີ | ເດືອນ ອາຫານຟຣີ ຫ້ອງພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:257](../frontend/src/features/daily/data/minigames.json#L257) | ຟຣີ | ຄີຍປ່ຽນຫ້ອງພັກ ແລະ ອາຫານຟຣີ ເປັນໜີ້ ພ້ອມເປົ້າໝາຍທີ່ບໍ່ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:313](../frontend/src/features/daily/data/minigames.json#L313) | ຟຣີ | ທີ່ພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:392](../frontend/src/features/daily/data/minigames.json#L392) | ຈິງ | ພົບກັນຕົວຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:481](../frontend/src/features/daily/data/minigames.json#L481) | ຟຣີ | ສະກິນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:485](../frontend/src/features/daily/data/minigames.json#L485) | ຟຣີ | ຂອງຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:533](../frontend/src/features/daily/data/minigames.json#L533) | ຟຣີ | ກົດເພື່ອຮັບໂທລະສັບຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:674](../frontend/src/features/daily/data/minigames.json#L674) | ຈິງ | ພົບຕົວຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:832](../frontend/src/features/daily/data/minigames.json#L832) | ຟຣີ | ລາງວັນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:872](../frontend/src/features/daily/data/minigames.json#L872) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/minigames.json:876](../frontend/src/features/daily/data/minigames.json#L876) | ຟຣີ | ທີ່ພັກຟຣີ ອາດກາຍເປັນໜີ້ທີ່ຖືກບັງຄັບໃ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scamCalls.ts:40](../frontend/src/features/daily/data/scamCalls.ts#L40) | ຈິງ | ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scamCalls.ts:46](../frontend/src/features/daily/data/scamCalls.ts#L46) | ຟຣີ | ຟຣີດຽວນີ້ ໜີ້ພາຍຫຼັງ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scamCalls.ts:47](../frontend/src/features/daily/data/scamCalls.ts#L47) | ຟຣີ | ຫ້ອງ ຫຼື ອາຫານຟຣີ ອາດຖືກປ່ຽນເປັນໜີ້ທີ່ຖືກບັງ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scamCalls.ts:173](../frontend/src/features/daily/data/scamCalls.ts#L173) | ໂອເຄ | ໂອເຄ ພົບກັນຫົກໂມງ | ໄດ້ / ຕົກລົງ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scamCalls.ts:176](../frontend/src/features/daily/data/scamCalls.ts#L176) | ໂອເຄ | ວົງຕອບກັບວ່າໂອເຄ | ໄດ້ / ຕົກລົງ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scenarios.json:225](../frontend/src/features/daily/data/scenarios.json#L225) | ຟຣີ | ປີ້ຍົນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scenarios.json:225](../frontend/src/features/daily/data/scenarios.json#L225) | ຟຣີ | ທີ່ພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scenarios.json:252](../frontend/src/features/daily/data/scenarios.json#L252) | ຟຣີ | ປີ້ຟຣີ ທີ່ພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/data/scenarios.json:252](../frontend/src/features/daily/data/scenarios.json#L252) | ຟຣີ | ປີ້ຟຣີ ທີ່ພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/daily/i18n.ts:71](../frontend/src/features/daily/i18n.ts#L71) | ຈິງ | ລ້ວແກ້ຄະດີຫຼອກລວງໃນຊີວິດຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/daily/i18n.ts:117](../frontend/src/features/daily/i18n.ts#L117) | ຈິງ | ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/features/kids/baitPosts.ts:24](../frontend/src/features/kids/baitPosts.ts#L24) | ຟຣີ | ຊົມຣົມຫຼຽນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/kids/baitPosts.ts:27](../frontend/src/features/kids/baitPosts.ts#L27) | ຟຣີ | ຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/kids/baitPosts.ts:37](../frontend/src/features/kids/baitPosts.ts#L37) | ຟຣີ | ເຄື່ອງແຈກຫຼຽນຟຣີ ແມ່ນປອມສະເໝີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/kids/baitPosts.ts:45](../frontend/src/features/kids/baitPosts.ts#L45) | ຟຣີ | ແຈກສະກິນຟຣີ ທຸກຄົນ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/features/kids/baitPosts.ts:55](../frontend/src/features/kids/baitPosts.ts#L55) | ຟຣີ | ລິ້ງແຈກຂອງຟຣີ ໃນແອັບວິດີໂອ ແມ່ນກັບດັກ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/lib/constants.ts:178](../frontend/src/lib/constants.ts#L178) | ຈິງ | ຖ້າມັນດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/lib/constants.ts:178](../frontend/src/lib/constants.ts#L178) | ຟຣີ | ເງິນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/lib/data.ts:57](../frontend/src/lib/data.ts#L57) | ຈິງ | ສະເໜີສິນຄ້າທີ່ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/lib/data.ts:126](../frontend/src/lib/data.ts#L126) | ຟຣີ | ໃນລາວໃຫ້ການຊ່ວຍເຫຼືອຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/lib/feed-data.ts:44](../frontend/src/lib/feed-data.ts#L44) | ຈິງ | ສະເໜີສິນຄ້າທີ່ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/lib/feed-data.ts:79](../frontend/src/lib/feed-data.ts#L79) | ຟຣີ | ໃນລາວໃຫ້ການຊ່ວຍເຫຼືອຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/lib/translations.ts:111](../frontend/src/lib/translations.ts#L111) | ຈິງ | ຖ້າມັນດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [frontend/src/lib/translations.ts:111](../frontend/src/lib/translations.ts#L111) | ຟຣີ | ເງິນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/screens/AssistantScreen.tsx:34](../frontend/src/screens/AssistantScreen.tsx#L34) | ຈິງ | ບໍ່ແມ່ນການຢືນຢັນຂໍ້ເທັດຈິງ | ແທ້ | native speaker decides |
| ☐ | [shared/ai-screening.ts:120](../shared/ai-screening.ts#L120) | ຟຣີ | ສາຍໂທຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [shared/ai-screening.ts:162](../shared/ai-screening.ts#L162) | ຟຣີ | ເງິນຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [shared/ai-screening.ts:164](../shared/ai-screening.ts#L164) | ຈິງ | ດີເກີນຈິງ | ແທ້ | native speaker decides |
| ☐ | [shared/ai-screening.ts:185](../shared/ai-screening.ts#L185) | ຟຣີ | ທີ່ພັກຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [shared/ai-screening.ts:185](../shared/ai-screening.ts#L185) | ຟຣີ | ເດີນທາງຟຣີ | keep, or ບໍ່ເສຍເງິນ | native speaker decides |
| ☐ | [frontend/src/components/feed/PeoplePanel.tsx:18](../frontend/src/components/feed/PeoplePanel.tsx#L18) | ໂປຣໄຟລ໌ | ໂປຣໄຟລ໌ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:171](../frontend/src/features/daily/data/bandSessions.ts#L171) | ຣ | ຕົວແທນແບຣນ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:175](../frontend/src/features/daily/data/bandSessions.ts#L175) | ຣ | ເຮົາຕ້ອງການຕົວແທນແບຣນຢູ່ບາງກອກ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:208](../frontend/src/features/daily/data/bandSessions.ts#L208) | ຣ | ໂຮງງານເອເລັກໂຕຣນິກ ເດືອນລະ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:178](../frontend/src/features/daily/data/callDays.ts#L178) | ຣ | ອັບເກຣດ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:271](../frontend/src/features/daily/data/callDays.ts#L271) | ຣ | ໄປຝາກຮ້ານເບເກີຣີໃນຊອຍ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:274](../frontend/src/features/daily/data/callDays.ts#L274) | ຣ | ນາງເພັດ ຈາກຮ້ານເບເກີຣີເດີ້ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:566](../frontend/src/features/daily/data/callDays.ts#L566) | ດາຣາ | ມື້ວານດາຣາຊື້ປີ້ລົດເມທີ່ເຄົາເຕີສະຖານ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:575](../frontend/src/features/daily/data/callDays.ts#L575) | ດາຣາ | ດາຣາເຫັນລົດຢູ່ປະຕູສາມ ໄດ້ບ່ອນນ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:577](../frontend/src/features/daily/data/callDays.ts#L577) | ດາຣາ | ດາຣາລໍຢູ່ປະຕູໜຶ່ງ ເກືອບພາດລົດ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:580](../frontend/src/features/daily/data/callDays.ts#L580) | ດາຣາ | ກົງກັບປີ້ທີ່ດາຣາຊື້ແທ້ ແລະ ບໍ່ຂໍຫຍັງ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:583](../frontend/src/features/daily/data/callDays.ts#L583) | ດາຣາ | ດາຣາຢາກໄປເຮັດວຽກຕ່າງປະເທດ ແລະ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:594](../frontend/src/features/daily/data/callDays.ts#L594) | ດາຣາ | ດາຣາຮັກສາເງິນ ແລະ ໜັງສືຜ່ານແດນ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:600](../frontend/src/features/daily/data/callDays.ts#L600) | ດາຣາ | ອາທິດແລ້ວດາຣາຖາມຫ້ອງການແຮງງານແຂວງ ເລື່ອ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:603](../frontend/src/features/daily/data/callDays.ts#L603) | ດາຣາ | ສະບາຍດີດາຣາ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:609](../frontend/src/features/daily/data/callDays.ts#L609) | ດາຣາ | ທີ່ການແນະນຳ ດາຣາຮູ້ວ່າບໍລິສັດໃດມີໃບອະນຸຍາດ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:610](../frontend/src/features/daily/data/callDays.ts#L610) | ດາຣາ | ດາຣາລົງຊື່ວັນພະຫັດ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:611](../frontend/src/features/daily/data/callDays.ts#L611) | ດາຣາ | ດາຣາພາດການແນະນຳ ເຫຼືອແຕ່ຕົວແທນ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:617](../frontend/src/features/daily/data/callDays.ts#L617) | ດາຣາ | ດາຣາມີໜັງສືຜ່ານແດນ ແຕ່ບໍ່ເຄີຍໃ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:627](../frontend/src/features/daily/data/callDays.ts#L627) | ດາຣາ | ໜັງສືຜ່ານແດນດາຣາບໍ່ເປັນຫຍັງ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:628](../frontend/src/features/daily/data/callDays.ts#L628) | ດາຣາ | ດາຣາກິນເຂົ້າຕໍ່ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:634](../frontend/src/features/daily/data/callDays.ts#L634) | ດາຣາ | ແມ່ຂອງດາຣາເປັນຫ່ວງທຸກເທື່ອທີ່ເດີນທາງ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:637](../frontend/src/features/daily/data/callDays.ts#L637) | ດາຣາ | ດາຣາ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:643](../frontend/src/features/daily/data/callDays.ts#L643) | ດາຣາ | ດາຣາເຫັນເຂົ້າໜຽວຕອນຈອດຕໍ່ໄປ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:651](../frontend/src/features/daily/data/callDays.ts#L651) | ດາຣາ | ດາຣາບໍ່ໄດ້ລົມກັບໝູ່ມັດທະຍົມຫຼາ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:654](../frontend/src/features/daily/data/callDays.ts#L654) | ດາຣາ | ດາຣາ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:655](../frontend/src/features/daily/data/callDays.ts#L655) | ຄຣິບໂຕ | ດ້ອາທິດລະສອງລ້ານ ຈາກເທຣດຄຣິບໂຕ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:662](../frontend/src/features/daily/data/callDays.ts#L662) | ດາຣາ | ດາຣາຮອດເມືອງ ເງິນເກັບຍັງຢູ່ຄົບ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:668](../frontend/src/features/daily/data/callDays.ts#L668) | ດາຣາ | ດາຣາຮັບວຽກບໍລິການລູກຄ້າຢູ່ບາງກ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:671](../frontend/src/features/daily/data/callDays.ts#L671) | ດາຣາ | ປ່ຽນແຜນໜ້ອຍໜຶ່ງເດີ້ດາຣາ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:677](../frontend/src/features/daily/data/callDays.ts#L677) | ດາຣາ | ແມ່ນບ່ອນທີ່ດາຣາບໍ່ໄດ້ຮັບອະນຸຍາດໃຫ້ອອກ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:678](../frontend/src/features/daily/data/callDays.ts#L678) | ດາຣາ | ເຂົາບອກດາຣາວ່າ ການປ່ຽນແບບນີ້ແມ່ນຮູບແບ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:679](../frontend/src/features/daily/data/callDays.ts#L679) | ດາຣາ | ດາຣາຢູ່ເທິງລົດ ພ້ອມໜັງສືຜ່ານແດ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:685](../frontend/src/features/daily/data/callDays.ts#L685) | ດາຣາ | ດາຣາໄປສະໝັກເອງ ກັບບໍລິສັດທີ່ພົ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:688](../frontend/src/features/daily/data/callDays.ts#L688) | ດາຣາ | ສະບາຍດີດາຣາ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:694](../frontend/src/features/daily/data/callDays.ts#L694) | ດາຣາ | ດາຣາອ່ານສັນຍາກັບແມ່ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:695](../frontend/src/features/daily/data/callDays.ts#L695) | ດາຣາ | ດາຣາໄປເອົາສັນຍາຢ່າງໝັ້ນໃຈ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/callDays.ts:696](../frontend/src/features/daily/data/callDays.ts#L696) | ດາຣາ | ດາຣາເສຍທາງເລືອກທີ່ປອດໄພ ແລະ ຖື | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:70](../frontend/src/features/daily/data/dashJourney.ts#L70) | ຣ | ຄາເມຣອນ ໄຮແລນ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:76](../frontend/src/features/daily/data/dashJourney.ts#L76) | ຣ | ມາຣີນາ ເບ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:82](../frontend/src/features/daily/data/dashJourney.ts#L82) | ຣ | ບໍໂຣບູດູ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:83](../frontend/src/features/daily/data/dashJourney.ts#L83) | ຣ | ພູໄຟໂບຣໂມ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:96](../frontend/src/features/daily/data/dashJourney.ts#L96) | ຣ | ອູລູ ເຕັມບູຣົງ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:99](../frontend/src/features/daily/data/dashJourney.ts#L99) | ຄຣິສໂຕ | ຄຣິສໂຕ ເຣ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:99](../frontend/src/features/daily/data/dashJourney.ts#L99) | ຣ | ຄຣິສໂຕ ເຣ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:100](../frontend/src/features/daily/data/dashJourney.ts#L100) | ຣ | ເກາະອາຕາອູໂຣ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/dashJourney.ts:101](../frontend/src/features/daily/data/dashJourney.ts#L101) | ຣ | ພູຣາເມເລົາ | ລ, or drop | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:413](../frontend/src/features/daily/data/detectiveCases.ts#L413) | ດາຣາ | ດາຣາ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:417](../frontend/src/features/daily/data/detectiveCases.ts#L417) | ດາຣາ | ດາຣາເຂົ້າກຸ່ມວຽກ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:432](../frontend/src/features/daily/data/detectiveCases.ts#L432) | ດາຣາ | ນແປກໜ້າທີ່ເປັນມິດ ລົມກັບດາຣາມາສອງອາທິດ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:447](../frontend/src/features/daily/data/detectiveCases.ts#L447) | ດາຣາ | ດາຣາໄປຫ້ອງການແຮງງານມື້ວານ ແລະ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:449](../frontend/src/features/daily/data/detectiveCases.ts#L449) | ດາຣາ | ກົງກັບສິ່ງທີ່ດາຣາເຮັດແທ້ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:461](../frontend/src/features/daily/data/detectiveCases.ts#L461) | ດາຣາ | ດາຣາຮັບວຽກບໍລິການລູກຄ້າຢູ່ບາງກ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:471](../frontend/src/features/daily/data/detectiveCases.ts#L471) | ດາຣາ | ສຳເນົາບໍ່ໄດ້ຊ່ວຍໃຫ້ດາຣາອອກມາໄດ້ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:477](../frontend/src/features/daily/data/detectiveCases.ts#L477) | ດາຣາ | ແລ ໝູ່ຂອງດາຣາ ໄປເຮັດວຽກ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:493](../frontend/src/features/daily/data/detectiveCases.ts#L493) | ດາຣາ | ດາຣາພົບບໍລິສັດນີ້ໃນລາຍຊື່ຂອງຫ້ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:495](../frontend/src/features/daily/data/detectiveCases.ts#L495) | ດາຣາ | ເປັນພາສາຂອງດາຣາ ແລະ ແມ່ນວຽກດຽວກັບທີ່ສະໝັກ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:497](../frontend/src/features/daily/data/detectiveCases.ts#L497) | ດາຣາ | ດາຣາຄວບຄຸມເອກະສານຂອງຕົນເອງ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/minigames.json:268](../frontend/src/features/daily/data/minigames.json#L268) | ຄຣິບໂຕ | ແພລດຟອມຄຣິບໂຕຂອງລຸງໃຫ້ກຳໄລ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [frontend/src/features/daily/data/minigames.json:911](../frontend/src/features/daily/data/minigames.json#L911) | ຄຣິບໂຕ | ຄຣິບໂຕ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [frontend/src/features/daily/data/scamCalls.ts:257](../frontend/src/features/daily/data/scamCalls.ts#L257) | ດາຣາ | ດາຣາຂີ່ລົດເມເຂົ້າເມືອງ ແລະ ຫວັ | ດາລາ | review |
| ☐ | [frontend/src/features/daily/data/scenarios.json:21](../frontend/src/features/daily/data/scenarios.json#L21) | ໂປຣໄຟລ | ພວກເຮົາເຫັນໂປຣໄຟລທ່ານ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [frontend/src/features/daily/data/scenarios.json:48](../frontend/src/features/daily/data/scenarios.json#L48) | ໂປຣໄຟລ | ເຫັນໂປຣໄຟລທ່ານ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [frontend/src/features/daily/lib/dashPlayer.ts:33](../frontend/src/features/daily/lib/dashPlayer.ts#L33) | ຣ | ບຣູໄນ | ລ, or drop | review |
| ☐ | [frontend/src/features/kids/baitPosts.ts:45](../frontend/src/features/kids/baitPosts.ts#L45) | ໂປຣໄຟລ໌ | ກົດລິ້ງໃນໂປຣໄຟລ໌ ກ່ອນມັນໝົດ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [frontend/src/lib/constants.ts:144](../frontend/src/lib/constants.ts#L144) | ໂປຣໄຟລ | ໂປຣໄຟລ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [frontend/src/lib/constants.ts:154](../frontend/src/lib/constants.ts#L154) | ໂປຣໄຟລ | ແກ້ໄຂໂປຣໄຟລ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [frontend/src/lib/translations.ts:77](../frontend/src/lib/translations.ts#L77) | ໂປຣໄຟລ | ໂປຣໄຟລ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [frontend/src/lib/translations.ts:87](../frontend/src/lib/translations.ts#L87) | ໂປຣໄຟລ | ແກ້ໄຂໂປຣໄຟລ | ໂປໄຟລ໌ / ຂໍ້ມູນສ່ວນຕົວ | review |
| ☐ | [shared/ai-screening.ts:91](../shared/ai-screening.ts#L91) | ຣ | ທຣິບ | ລ, or drop | review |
| ☐ | [shared/ai-screening.ts:166](../shared/ai-screening.ts#L166) | ຄຣິບໂຕ | ຄຣິບໂຕຄັນ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [shared/ai-screening.ts:167](../shared/ai-screening.ts#L167) | ຄຣິບໂຕ | ຄຣິບໂຕ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [shared/ai-screening.ts:167](../shared/ai-screening.ts#L167) | ຄຣິບໂຕ | ຄຣິບໂຕຄັນ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [shared/ai-screening.ts:167](../shared/ai-screening.ts#L167) | ຄຣີບໂຕ | ຄຣີບໂຕ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [shared/ai-screening.ts:167](../shared/ai-screening.ts#L167) | ຄຣີບໂຕ | ຄຣີບໂຕຄັນ | one spelling (ຄຣິບໂຕ?) | review |
| ☐ | [shared/ai-screening.ts:168](../shared/ai-screening.ts#L168) | ຣ | ໄວຣັດ | ລ, or drop | review |
| ☐ | [backend/push.mjs:10](../backend/push.mjs#L10) | ແຊຣ໌ | ແຊຣ໌ຄຳເຕືອນ | ແບ່ງປັນ | suggest replace |
| ☐ | [backend/seed.json:13](../backend/seed.json#L13) | ແຊຣ໌ | ຢ່າກົດລິ້ງ ຫຼື ແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [backend/seed.json:144](../backend/seed.json#L144) | ແຊຣ໌ | ແຊຣ໌ເພື່ອເຕືອນ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/assistant/AssistantComposer.tsx:14](../frontend/src/components/assistant/AssistantComposer.tsx#L14) | ແຊຣ໌ | ກວດໂພສກ່ອນແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/CommunityScore.tsx:8](../frontend/src/components/feed/CommunityScore.tsx#L8) | ແຊຣ໌ | ການມັກແລະແຊຣ໌ບໍ່ໄດ້ພິສູດວ່າຂໍ້ມູນເປັນຄວ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:14](../frontend/src/components/feed/DailySafetyTip.tsx#L14) | ແຊຣ໌ | ກ່ອນແຊຣ໌ຄຳເຕືອນ ກວດແຫຼ່ງຂໍ້ມູນ ແລະ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/DailySafetyTip.tsx:22](../frontend/src/components/feed/DailySafetyTip.tsx#L22) | ແຊຣ໌ | ຢ່າແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/PeoplePanel.tsx:14](../frontend/src/components/feed/PeoplePanel.tsx#L14) | ແຊຣ໌ | ແຊຣ໌ໂພສ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/PeoplePanel.tsx:20](../frontend/src/components/feed/PeoplePanel.tsx#L20) | ແຊຣ໌ | ແຊຣ໌ໂພສ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/PeoplePanel.tsx:20](../frontend/src/components/feed/PeoplePanel.tsx#L20) | ແຊຣ໌ | ແຊຣ໌ໂພສ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/PostCard.tsx:80](../frontend/src/components/feed/PostCard.tsx#L80) | ແຊຣ໌ | ແຊຣ໌ໂພສ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/feed/PostCard.tsx:160](../frontend/src/components/feed/PostCard.tsx#L160) | ແຊຣ໌ | ແຊຣ໌ໂພສ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/modals/RepostModal.tsx:25](../frontend/src/components/modals/RepostModal.tsx#L25) | ແຊຣ໌ | ກຳລັງແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/modals/RepostModal.tsx:41](../frontend/src/components/modals/RepostModal.tsx#L41) | ແຊຣ໌ | ແຊຣ໌ຕໍ່ວັນ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/components/safety/CheckResultCard.tsx:11](../frontend/src/components/safety/CheckResultCard.tsx#L11) | ແຊຣ໌ | ຄຳຄິດເຫັນ ແລະການແຊຣ໌ຖືກລັອກ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:75](../frontend/src/features/daily/data/bandSessions.ts#L75) | ເຊີໄພຣສ໌ | ຄວາມລັບດີແມ່ນເຊີໄພຣສ໌ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/bandSessions.ts:142](../frontend/src/features/daily/data/bandSessions.ts#L142) | ຄອມເມັນ | ພຈສົ່ງຂໍ້ຄວາມມາ ຫຼັງທ່ານຄອມເມັນໂພສຮຽນຕ່າງປະເທດ | ຄຳເຫັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/callDays.ts:35](../frontend/src/features/daily/data/callDays.ts#L35) | ພີ່ | ພີ່ຫາກໍ່ສົ່ງລະຫັດຫົກຕົວ ໄປໂທລະ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/callDays.ts:35](../frontend/src/features/daily/data/callDays.ts#L35) | ພີ່ | ອ່ານໃຫ້ພີ່ຟັງແດ່ເດີ້ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/callDays.ts:36](../frontend/src/features/daily/data/callDays.ts#L36) | ເຊີໄພຣສ໌ | ໍ່ຕ້ອງຖາມແມ່ເດີ້ ເອົາໄວ້ເຊີໄພຣສ໌ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/callDays.ts:121](../frontend/src/features/daily/data/callDays.ts#L121) | ເຊີໄພຣສ໌ | ເອົາໄວ້ເຊີໄພຣສ໌ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/callDays.ts:535](../frontend/src/features/daily/data/callDays.ts#L535) | ເຊີໄພຣສ໌ | ຢ່າໃຫ້ເສຍເຊີໄພຣສ໌ເດີ້ ຢ່າບອກພໍ່ແມ່ລາວ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/callDays.ts:655](../frontend/src/features/daily/data/callDays.ts#L655) | ເທຣດ | ຍຫາໄດ້ອາທິດລະສອງລ້ານ ຈາກເທຣດຄຣິບໂຕ | ຊື້ຂາຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:33](../frontend/src/features/daily/data/detectiveCases.ts#L33) | ຮີບ | ເລັ່ງໃຫ້ຮີບ ເພື່ອບໍ່ໃຫ້ທ່ານຢຸດຖາມຜູ້ໃຫ | ຟ້າວ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:61](../frontend/src/features/daily/data/detectiveCases.ts#L61) | ພີ່ | ພີ່ເລືອກນ້ອງໄດ້ກ່ອງຂອງຂວັນ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:68](../frontend/src/features/daily/data/detectiveCases.ts#L68) | ເຊີໄພຣສ໌ | ຄວາມລັບດີແມ່ນເຊີໄພຣສ໌ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:94](../frontend/src/features/daily/data/detectiveCases.ts#L94) | ເຊີໄພຣສ໌ | ໃຫ້ເປັນເຊີໄພຣສ໌ ຢ່າບອກພໍ່ແມ່ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:94](../frontend/src/features/daily/data/detectiveCases.ts#L94) | ເຊີໄພຣສ໌ | ເຊີໄພຣສ໌ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:101](../frontend/src/features/daily/data/detectiveCases.ts#L101) | ແຊຣ໌ | ຢ່າແຊຣ໌ຮູບ ຫຼື ເບີຂອງຄອບຄົວໃຫ້ໝູ່ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:105](../frontend/src/features/daily/data/detectiveCases.ts#L105) | ພີ່ | ພີ່ແກ້ວ ທີ່ເຮັດວຽກຢູ່ວຽງຈັນ ຂຽ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:107](../frontend/src/features/daily/data/detectiveCases.ts#L107) | ພີ່ | ພີ່ຈະກັບບ້ານງານບຸນທາດຫຼວງ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:108](../frontend/src/features/daily/data/detectiveCases.ts#L108) | ພີ່ | ຕົ້ນ ພີ່ຊື້ບານໃຫ້ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:109](../frontend/src/features/daily/data/detectiveCases.ts#L109) | ພີ່ | ປ້າ ພີ່ຈະມາຫາວັນອາທິດຕອນບ່າຍ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:113](../frontend/src/features/daily/data/detectiveCases.ts#L113) | ພີ່ | ບລັອກພີ່ແກ້ວ ອາດແມ່ນປອມ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:114](../frontend/src/features/daily/data/detectiveCases.ts#L114) | ພີ່ | ຂໍເງິນພີ່ແກ້ວຊື້ເກມໃໝ່ | ອ້າຍ / ເອື້ອຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:166](../frontend/src/features/daily/data/detectiveCases.ts#L166) | ແຊຣ໌ | ແຊຣ໌ໃຫ້ໝູ່ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:196](../frontend/src/features/daily/data/detectiveCases.ts#L196) | ແຄັບ | ຢຸດ ບໍ່ຈ່າຍ ແຄັບໜ້າຈໍ ແລ້ວລາຍງານບັນຊີ | ຖ່າຍຮູບໜ້າຈໍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:235](../frontend/src/features/daily/data/detectiveCases.ts#L235) | ແຊຣ໌ | ຢ່າແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:263](../frontend/src/features/daily/data/detectiveCases.ts#L263) | ແຊຣ໌ | ຢ່າແຊຣ໌ຂໍ້ມູນເກີນ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:370](../frontend/src/features/daily/data/detectiveCases.ts#L370) | ເຊີໄພຣສ໌ | ເຮັດເປັນເຊີໄພຣສ໌ໃຫ້ເຂົາ | ຂອງຂວັນລັບ / ເຊີໄພສ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:377](../frontend/src/features/daily/data/detectiveCases.ts#L377) | ຮີບ | ້ອງໃຫ້ຄອບຄົວກວດນຳກັນ ບໍ່ຮີບຮ້ອນ | ຟ້າວ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:384](../frontend/src/features/daily/data/detectiveCases.ts#L384) | ເທຣດ | ແອັບເທຣດຄຳຂອງຂ້ອຍ ໃຫ້ກຳໄລ | ຊື້ຂາຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:400](../frontend/src/features/daily/data/detectiveCases.ts#L400) | ຮີບ | ບໍ່ຮີບ | ຟ້າວ | suggest replace |
| ☐ | [frontend/src/features/daily/data/detectiveCases.ts:496](../frontend/src/features/daily/data/detectiveCases.ts#L496) | ຮີບ | ບໍ່ຮີບ ແລະ ເຊີນຄອບຄົວໄດ້ | ຟ້າວ | suggest replace |
| ☐ | [frontend/src/features/daily/data/minigames.json:87](../frontend/src/features/daily/data/minigames.json#L87) | ແຊຣ໌ | ສຳລັບທ່ານເທົ່ານັ້ນ ຢ່າແຊຣ໌ກຸ່ມນີ້ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/minigames.json:162](../frontend/src/features/daily/data/minigames.json#L162) | ເທຣດ | ລ້ານ ຈາກແອັບເທຣດນີ້ | ຊື້ຂາຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/minigames.json:771](../frontend/src/features/daily/data/minigames.json#L771) | ແຊຣ໌ | ຢ່າແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/daily/data/scenarios.json:174](../frontend/src/features/daily/data/scenarios.json#L174) | ເທຣດ | ນັກເທຣດທີ່ເປັນມິດ | ຊື້ຂາຍ | suggest replace |
| ☐ | [frontend/src/features/daily/data/scenarios.json:175](../frontend/src/features/daily/data/scenarios.json#L175) | ຄອມເມັນ | ຄົນທີ່ຮູ້ຈັກໃນຄອມເມັນຢາກຊ່ວຍໃຫ້ທ່ານ | ຄຳເຫັນ | suggest replace |
| ☐ | [frontend/src/features/kids/baitPosts.ts:24](../frontend/src/features/kids/baitPosts.ts#L24) | ຊົມຣົມ | ຊົມຣົມຫຼຽນຟຣີ | ຊົມລົມ / ສະໂມສອນ | suggest replace |
| ☐ | [frontend/src/features/kids/baitPosts.ts:116](../frontend/src/features/kids/baitPosts.ts#L116) | ແຊຣ໌ | ແຊຣ໌ໃຫ້ໝູ່ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/kids/baitPosts.ts:118](../frontend/src/features/kids/baitPosts.ts#L118) | ແຊຣ໌ | ແຊຣ໌ໃຫ້ໝູ່ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/features/kids/baitPosts.ts:125](../frontend/src/features/kids/baitPosts.ts#L125) | ແຊຣ໌ | ຢ່າແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/alertText.ts:5](../frontend/src/lib/alertText.ts#L5) | ແຊຣ໌ | ແຊຣ໌ຄຳເຕືອນ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:137](../frontend/src/lib/constants.ts#L137) | ຣີເຊັດ | ຣີເຊັດລະຫັດຜ່ານ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:138](../frontend/src/lib/constants.ts#L138) | ຣີເຊັດ | ານ ແລ້ວພວກເຮົາຈະສົ່ງລິ້ງຣີເຊັດ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:139](../frontend/src/lib/constants.ts#L139) | ຣີເຊັດ | ສົ່ງລິ້ງຣີເຊັດ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:140](../frontend/src/lib/constants.ts#L140) | ຣີເຊັດ | ສົ່ງລິ້ງຣີເຊັດແລ້ວ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:148](../frontend/src/lib/constants.ts#L148) | ຄອມເມັນ | ຄອມເມັນຕໍ່ວັນ | ຄຳເຫັນ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:150](../frontend/src/lib/constants.ts#L150) | ແຊຣ໌ | ມີຫຍັງໃຈຢາກແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:169](../frontend/src/lib/constants.ts#L169) | ແຊຣ໌ | ແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/constants.ts:174](../frontend/src/lib/constants.ts#L174) | ແຊຣ໌ | ຢ່າແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/data.ts:21](../frontend/src/lib/data.ts#L21) | ແຊຣ໌ | ຢ່າກົດລິ້ງ ຫຼື ແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/data.ts:111](../frontend/src/lib/data.ts#L111) | ແຊຣ໌ | ແຊຣ໌ເພື່ອເຕືອນ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/feed-data.ts:25](../frontend/src/lib/feed-data.ts#L25) | ແຊຣ໌ | ຢ່າກົດລິ້ງ ຫຼື ແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/feed-data.ts:72](../frontend/src/lib/feed-data.ts#L72) | ແຊຣ໌ | ແຊຣ໌ເພື່ອເຕືອນ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:70](../frontend/src/lib/translations.ts#L70) | ຣີເຊັດ | ຣີເຊັດລະຫັດຜ່ານ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:71](../frontend/src/lib/translations.ts#L71) | ຣີເຊັດ | ານ ແລ້ວພວກເຮົາຈະສົ່ງລິ້ງຣີເຊັດ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:72](../frontend/src/lib/translations.ts#L72) | ຣີເຊັດ | ສົ່ງລິ້ງຣີເຊັດ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:73](../frontend/src/lib/translations.ts#L73) | ຣີເຊັດ | ສົ່ງລິ້ງຣີເຊັດແລ້ວ | ຕັ້ງ…ໃໝ່ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:81](../frontend/src/lib/translations.ts#L81) | ແຊຣ໌ | ແຊຣ໌ຕໍ່ວັນ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:83](../frontend/src/lib/translations.ts#L83) | ແຊຣ໌ | ມີຫຍັງໃຈຢາກແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:102](../frontend/src/lib/translations.ts#L102) | ແຊຣ໌ | ແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [frontend/src/lib/translations.ts:107](../frontend/src/lib/translations.ts#L107) | ແຊຣ໌ | ຢ່າແຊຣ໌ | ແບ່ງປັນ | suggest replace |
| ☐ | [shared/ai-screening.ts:93](../shared/ai-screening.ts#L93) | ແຊຣ໌ | ກົດແຊຣ໌ | ແບ່ງປັນ | suggest replace |
