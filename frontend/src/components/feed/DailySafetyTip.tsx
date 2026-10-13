import type {Lang} from '../../types';
const tips=[
 ['Never share your OTP or password, even with someone claiming to be your bank.','ຢ່າແຊຣ໌ລະຫັດ OTP ຫຼື ລະຫັດຜ່ານ ແມ່ນແຕ່ຄົນທີ່ອ້າງວ່າເປັນທະນາຄານ.'],
 ['Pause before transferring money. Verify the request through a separate, trusted channel.','ຢຸດຄິດກ່ອນໂອນເງິນ. ກວດສອບຄຳຂໍຜ່ານຊ່ອງທາງທີ່ໄວ້ໃຈ.'],
 ['Before sharing a warning, check its source and hide personal information.','ກ່ອນແຊຣ໌ຄຳເຕືອນ ກວດແຫຼ່ງຂໍ້ມູນ ແລະ ປິດບັງຂໍ້ມູນສ່ວນຕົວ.']
];
export function DailySafetyTip({lang}:{lang:Lang}){
 const tip=tips[Math.floor(Date.now()/86400000)%tips.length];
 return <aside className="m-3 rounded-2xl bg-primary/5 border border-border p-3"><p className="text-xs font-semibold text-primary mb-1">{lang==='lo'?'ຄຳແນະນຳຄວາມປອດໄພປະຈຳວັນ':'Daily safety tip'}</p><p className="text-sm font-lao leading-relaxed">{tip[lang==='lo'?1:0]}</p></aside>;
}
