# Sati Screening Training Set (v2: natural posts)

Labelled examples for `scripts/eval.ts` and the vitest cases.
Format: `text | expected | must_include_flags | notes`
States: clean, flagged, false, blocked. "≥flagged" = flagged OR false is acceptable.
Posts are written the way people really post on Lao Facebook / TikTok: mixed Lao-English, emoji, typos, line breaks shown as " / ".

## 1. Lures: study / course / scholarship
| text | expected | flags | notes |
|---|---|---|---|
| 📢 Free Chinese Language Course! 🇨🇳 / Starts Nov 15 17:30–19:00 / 📍 China Cultural Center, Vientiane / ⚠️ Limited seats! / 📞 WhatsApp: 020 5555 5555 or scan the QR 👇 | blocked | free_offer,urgency,private_contact,qr_only,phone | the original bug |
| 📢 ຮຽນພາສາຈີນຟຣີ 🇨🇳 ເລີ່ມ 15/11 ທີ່ສູນວັດທະນະທຳຈີນ / ຮັບຈຳນວນຈຳກັດ!! ສົນໃຈທັກ WhatsApp ຫຼື ສະແກນ QR ເລີຍ 👇 | ≥flagged | free_offer,urgency,private_contact,qr_only | Lao version |
| ທຶນຮຽນຟຣີ ປະເທດຍີ່ປຸ່ນ 🇯🇵 ສຳລັບນ້ອງໆ ມ.7 ຈົບໃໝ່ / ກິນຢູ່ຟຣີ ມີເງິນໃຊ້ຈ່າຍ / ເຫຼືອບໍ່ຫຼາຍ ib ມາເດີ້ 💌 | ≥flagged | free_offer,urgency,private_contact | fake scholarship |
| Korean scholarship from the embassy 🇰🇷 100% free, only 10 seats, DM me for the form | ≥flagged | free_offer,urgency,private_contact,authority_name | |
| ສະໝັກຮຽນພາສາອັງກິດຟຣີ ກັບມູນນິທິສາກົນ / ຢ່າພາດ! ໂທມາ ຫຼື ທັກໄລໄດ້ເລີຍ | ≥flagged | free_offer,urgency,private_contact,authority_name | |
| Free coding bootcamp in Bangkok, flights + room paid, apply now via Telegram @jobs_th | ≥flagged | free_offer,urgency,private_contact | |

## 2. Lures: jobs abroad / trafficking
| text | expected | flags | notes |
|---|---|---|---|
| ຮັບສະໝັກດ່ວນ!! ພະນັກງານໄປເຮັດວຽກໄທ 🇹🇭 ເງິນເດືອນ 15,000 ບາດ ບໍ່ຕ້ອງມີປະສົບການ ກິນຢູ່ຟຣີ ທັກມາເລີຍ | false | job_abroad,urgency,free_offer,private_contact | classic |
| Hiring customer service online 💻 work in Cambodia, salary $1000/month, no experience, free food and room. Telegram only | false | job_abroad,free_offer,private_contact | scam compound |
| ວຽກງ່າຍເງິນດີ 💰 ພິມງານອອນລາຍຢູ່ເຂດເສດຖະກິດພິເສດ ສາມຫຼ່ຽມຄຳ ທາງເຮົາຈັດການເອກະສານໃຫ້ໝົດ | false | job_abroad | Golden Triangle |
| 急招 高薪 包吃包住 / casino staff needed, Laos SEZ, girls 18-25, ib | false | job_abroad,free_offer | Chinese mix |
| ຕ້ອງການສາວໆເຮັດວຽກຮ້ານອາຫານຢູ່ມາເລເຊຍ ເງິນດີ ຜ່ານແດນໃຫ້ ບໍ່ຕ້ອງມີພາສປອດ | false | job_abroad | no passport = red flag |
| Factory job in Korea 🇰🇷 easy job big money, visa fee first then fly next week | false | job_abroad,money_ask | |
| ໃຜຢາກໄປເຮັດວຽກຈີນ ບໍ່ຕ້ອງໃຊ້ພາສາ ລາຍໄດ້ດີ ທັກມາຖາມໄດ້ 😊 | false | job_abroad,private_contact | friendly tone, still a lure |

## 3. Lures: money / investment / romance
| text | expected | flags | notes |
|---|---|---|---|
| ໂອນເງິນມັດຈຳ 200,000 ກີບ ກ່ອນເພື່ອຈອງບ່ອນເດີ້ ບ່ອນມີຈຳກັດ | false | money_ask,urgency | |
| ລົງທຶນ 1 ລ້ານ ໄດ້ຄືນ 3 ລ້ານ ພາຍໃນ 7 ມື້ ກຳໄລແນ່ນອນ 100% 📈 | false | money_ask | ponzi |
| Double your money in 24h with crypto 🚀 guaranteed profit, send to my BCEL account | false | money_ask | |
| ພັດສະດຸຂອງທ່ານຕິດດ່ານ 📦 ກະລຸນາໂອນຄ່າທຳນຽມ 150,000 ກີບ ເພື່ອປ່ອຍເຄື່ອງ | false | money_ask,romance_scam | parcel scam |
| Babe I'm stuck at customs at Wattay, need 3 million kip for tax, I'll pay you back I promise ❤️ | false | money_ask,romance_scam | romance scam |
| ຂໍສົ່ງເງິນມາກ່ອນ ຄ່າເອກະສານ + ຄ່າກວດສຸຂະພາບ ແລ້ວຈະໄດ້ໄປເຮັດວຽກເລີຍ | false | money_ask | |

## 4. Lures: kids bait
| text | expected | flags | notes |
|---|---|---|---|
| FREE ROBUX 😱😱 click bit.ly/rbx-free and login your account fast before it ends!! | ≥flagged | free_offer,urgency,suspicious_link | |
| ແຈກເພັດ Free Fire ຟຣີ 💎 ແອັດໄລມາເອົາ ມື້ນີ້ເທົ່ານັ້ນ!! | ≥flagged | free_offer,urgency,private_contact | |
| Free UC for PUBG 🔫 just send your ID and password to me | ≥flagged | free_offer | credential theft |
| ນ້ອງໆໃຜຢາກໄດ້ໂທລະສັບຟຣີ 📱 ສົ່ງຮູບມາໃຫ້ອ້າຍທາງ inbox | ≥flagged | free_offer,private_contact | grooming signal |

## 5. Emotional manipulation / misinformation
| text | expected | flags | notes |
|---|---|---|---|
| ດ່ວນທີ່ສຸດ!!! ຊ່ວຍແຊຣ໌ແດ່ ຖ້າບໍ່ແຊຣ໌ຈະໂຊກຮ້າຍ 7 ປີ 😨 | ≥flagged | emotional_manipulation | chain message |
| BREAKING!! They don't want you to know this, share before deleted 😱 | ≥flagged | emotional_manipulation | |
| ຈິງ 100% ນ້ຳມັນຈະຂຶ້ນລາຄາ 50% ມື້ອື່ນ ແຊຣ໌ໄປ | ≥flagged | emotional_manipulation | unverified claim |
| Congratulations 🎉 you won an iPhone 17! Claim at http://claim-prize.win now | ≥flagged | suspicious_link | |

## 6. Profanity
| text | expected | flags | notes |
|---|---|---|---|
| fuck this app | false | profanity | |
| f*ck u | false | profanity | leetspeak |
| wtf is this lmao | false | profanity | |
| s h i t | false | profanity | spaced |
| ເຢັດແມ່ມຶງ | false | profanity | Lao high |
| ອີ່ຫ່າ ຂີ້ຕົວະ | false | profanity | |
| ໄປຕາຍສາ ໄອ້ບ້າ | false | profanity | |
| ไอ้เหี้ย กาก | false | profanity | Thai mixed in |

## 7. Animal insults / bullying
| text | expected | flags | notes |
|---|---|---|---|
| ມຶງແມ່ນໝາ | ≥flagged | animal_insults | |
| ໂງ່ຄືຄວາຍ 🐃 | ≥flagged | animal_insults | |
| ໜ້າຄືໝູ ຮ່າໆໆ | ≥flagged | animal_insults | |
| you fat pig nobody wants you here | ≥flagged | animal_insults,bullying | |
| everyone unfollow her, she is so ugly and fake 🤮 | flagged | bullying | |
| ຄົນນີ້ຂີ້ທູດຫຼາຍ ຢ່າໄປລົມນຳ | ≥flagged | bullying | |
| ໝາຂອງຂ້ອຍໜ້າຮັກຫຼາຍ 🐶 | clean | — | NOT an insult |
| Our buffalo had a baby today 🐃❤️ | clean | — | NOT an insult |
| ໄປຕະຫຼາດຊື້ໝູ ກັບເປັດ ມາເຮັດກິນ | clean | — | NOT an insult |

## 8. Political
| text | expected | flags | notes |
|---|---|---|---|
| ລັດຖະບານໂກງ ຮ່າໆ ເຂົາບໍ່ສົນໃຈປະຊາຊົນດອກ | flagged | political_claims | |
| yeah right the minister really cares about us 🙄 | flagged | political_claims | sarcasm |
| ໃຜຢາກປະທ້ວງ ມາລວມກັນວັນເສົາ | flagged | political_claims | |

## 9. Privacy / location (must be BLOCKED)
| text | expected | flags | notes |
|---|---|---|---|
| ໃຜສົນໃຈໂທມາ 020 5555 1234 ເດີ້ | blocked | phone | |
| ຕິດຕໍ່ +856 20 9876 5432 | blocked | phone | |
| contact me 0305551234 | blocked | phone | 030 format |
| Thai number 081 234 5678 | blocked | phone | |
| my email is noy.lao@gmail.com msg me | blocked | email | |
| ໜັງສືຜ່ານແດນ P1234567 ຂອງຂ້ອຍເສຍ ໃຜເຫັນບອກແດ່ | blocked | passport_no | |
| ບັດປະຈຳຕົວ ເລກ 0123456789 | blocked | id_card | |
| BCEL account 010 12 00 123456789 send here | blocked | bank_account,money_ask | |
| I'm at 17.9757, 102.6331 come now 🏃 | blocked | location_sharing | GPS |
| meet here 👉 https://maps.app.goo.gl/abc123 | blocked | location_sharing | maps link |
| ເຮືອນຂ້ອຍຢູ່ບ້ານໂພນໄຊ ໜ່ວຍ 5 ເຮືອນເລກທີ 12 ມາຫາໄດ້ | blocked | location_sharing | address |
| live location 📍 ຢູ່ທີ່ຫ້ອງການ ຖະໜົນລ້ານຊ້າງ | blocked | location_sharing | |

## 10. Short / off-topic
| text | expected | flags | notes |
|---|---|---|---|
| lol | flagged | very_short_content | low |
| 555 | flagged | very_short_content | low |
| ok ເດີ້ | flagged | very_short_content | low |
| ກິນເຂົ້າປຽກມື້ນີ້ແຊບຫຼາຍ 🍜 | flagged | off_topic | low, kept out of feed |
| Selling my used Honda Click, good condition | flagged | off_topic | low |

## 11. Clean (must NOT be flagged: zero false-reds here)
| text | expected | flags | notes |
|---|---|---|---|
| ຖ້າເຫັນປະກາດວຽກໜ້າສົງໄສ ໃຫ້ໂທ 1300 ເດີ້ 🙏 | clean | — | hotline allowed |
| If someone offers you a job abroad with no experience and free room, call 1300 before you go | clean | — | mentions lure words AS ADVICE |
| ຢ່າໂອນເງິນມັດຈຳໃຫ້ຄົນທີ່ບໍ່ຮູ້ຈັກ ບໍລິສັດແທ້ບໍ່ເອົາເງິນຈາກພະນັກງານ | clean | — | negated money_ask |
| Tip: real scholarships never ask you to pay a fee or message on WhatsApp | clean | — | negation |
| ລາຍງານໃໝ່ກ່ຽວກັບການຄ້າມະນຸດໃນລາວ https://www.unodc.org/report | clean | source_link_provided | trusted source |
| ມື້ນີ້ຮຽນຮູ້ວິທີກວດເພຈປອມ: ເບິ່ງວັນທີສ້າງ ແລະ ປະຫວັດຜູ້ຕິດຕາມ 👀 | clean | — | |
| Played Sati Daily, got 9/10 on spotting romance scams 💪 | clean | — | |
| My cousin almost went to work in Thailand, glad we checked with the labour office first | clean | — | personal story, warning tone |
| ລະວັງ! ມີຄົນປອມເປັນພະນັກງານທະນາຄານ ໂທມາຂໍລະຫັດ OTP ຢ່າໃຫ້ເດັດຂາດ | clean | — | warning post |
| Lao Women's Union is running a free safe-migration workshop, info on https://www.iom.int | clean | source_link_provided | free + trusted source = OK |

## 12. Required Lao bad words (each must be caught) + look-alikes (must stay clean)
| text | expected | flags | notes |
|---|---|---|---|
| ຫໍາ | false | profanity | |
| ຫີ | false | profanity | |
| ແຕດ | false | profanity | |
| ເຫີ້ຍ ຫຍັງວະ | false | profanity | |
| ໄອ້ເຫີ້ຍ ມຶງ | false | profanity | |
| ອີ່ສັດ ໜ້າດ້ານ | false | profanity | |
| ສັດ!! ເຮັດແນວນີ້ໄດ້ຈັ່ງໃດ | ≥flagged | profanity | ສັດ used as a swear |
| ເອົາເຄື່ອງໃສ່ຫີບໄວ້ເດີ້ 📦 | clean | — | ຫີບ = box |
| ຫີນກ້ອນນີ້ໃຫຍ່ຫຼາຍ | clean | — | ຫີນ = stone |
| ພາໝາໄປຫາສັດຕະວະແພດ 🐶 | clean | — | vet |
| ສັດປ່າໃນລາວຕ້ອງໄດ້ຮັບການປົກປ້ອງ | clean | — | wildlife |
| ລາວເປັນຄົນຊື່ສັດ | clean | — | honest |
