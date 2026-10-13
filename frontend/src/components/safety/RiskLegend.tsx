import type {Lang} from '../../types';
export function RiskLegend({lang}:{lang:Lang}){
 const items=[['#157f3b','#e8f7ee',lang==='lo'?'ຄວາມສ່ຽງຕ່ຳ':'Low risk'],['#8a4b00','#fff1da',lang==='lo'?'ຄວນລະວັງ':'Caution'],['#c0292b','#fdeaea',lang==='lo'?'ຕ້ອງກວດຄືນ':'Needs review']];
 return <aside aria-label={lang==='lo'?'ຄວາມໝາຍຂອງສີ':'Risk color guide'} className="flex justify-center gap-2 px-3 pb-3 font-lao">{items.map(([color,background,label])=><span key={color} style={{color,background}} className="rounded-full px-3 py-1.5 text-xs font-semibold"><span aria-hidden="true">● </span>{label}</span>)}</aside>;
}
