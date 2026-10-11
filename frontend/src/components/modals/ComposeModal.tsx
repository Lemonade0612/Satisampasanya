import { request } from '../../lib/api';
import { useState } from 'react';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { TOPICS, TOPIC_LABELS } from '../../lib/constants';
import { readPhoto } from '../../lib/images';
import type { Lang, PostDraft } from '../../types';

export function ComposeModal({lang,onClose,onPost}: {lang:Lang;onClose:()=>void;onPost:(post:PostDraft)=>Promise<void>}) {
  const label=(en:string,lo:string)=>lang==='lo'?lo:en;
  const [english,setEnglish]=useState(''),[lao,setLao]=useState('');
  const [tags,setTags]=useState<string[]>([]),[source,setSource]=useState('');
  const [news,setNews]=useState(false),[photo,setPhoto]=useState<string>();
  const [busy,setBusy]=useState(false),[reading,setReading]=useState(false),[error,setError]=useState('');
  const [customTag,setCustomTag]=useState('');
  const [translating,setTranslating]=useState(false);
  const addTag=()=>{const tag=customTag.trim().replace(/^#+/,'');if(!/^[\p{L}\p{M}\p{N}_]{1,40}$/u.test(tag)){setError(label('Use letters, numbers or underscores (up to 40 characters).','ໃຊ້ຕົວອັກສອນ, ຕົວເລກ ຫຼື _ (ບໍ່ເກີນ 40 ຕົວ).'));return;}if(tags.length>=10){setError(label('Choose up to 10 hashtags.','ເລືອກໄດ້ບໍ່ເກີນ 10 ແຮັດແທັກ.'));return;}setTags(prev=>prev.some(t=>t.toLowerCase()===tag.toLowerCase())?prev:[...prev,tag]);setCustomTag('');setError('');};
  const translate=async(target:'en'|'lo')=>{setTranslating(true);setError('');try{const result=await request<{text:string}>('/translate','POST',{text:target==='lo'?english:lao,target});if(target==='lo')setLao(result.text);else setEnglish(result.text);}catch(e){setError((e as Error).message);}finally{setTranslating(false);}};
  const valid=!!(english.trim()||lao.trim())&&tags.length>0&&(!news||!!source.trim());
  const submit=async()=>{
    if(!valid||busy||reading||translating)return;
    setBusy(true);setError('');
    try {await onPost({content:english.trim(),contentLo:lao.trim()||undefined,tags,link:source.trim()||undefined,image:photo,isNews:news});onClose();}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  };
  return <section role="dialog" aria-modal="true" aria-label={label('New post','ໂພສໃໝ່')} className="phone-modal fixed inset-0 z-50 flex flex-col bg-background">
    <header className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
      <button aria-label={label('Close','ປິດ')} disabled={busy} onClick={onClose} className="touch-target"><X size={22}/></button>
      <h2 className="font-semibold">{label('New post','ໂພສໃໝ່')}</h2>
      <button onClick={submit} disabled={!valid||busy||reading||translating} className="touch-target bg-primary text-white rounded-full px-5 disabled:opacity-40">{busy?<Loader2 className="animate-spin" size={18}/>:label('Post','ໂພສ')}</button>
    </header>
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
      <p className="text-sm text-muted-foreground">{label('Write in either language, or add both versions. Switching languages shows the version you provide; missing translations display the original.','ຂຽນເປັນພາສາລາວ ຫຼື ອັງກິດ ຫຼື ທັງສອງພາສາ. ຖ້າບໍ່ມີຄຳແປ ຈະສະແດງຂໍ້ຄວາມຕົ້ນສະບັບ.')}</p>
      {[{id:'english',title:'English',value:english,set:setEnglish},{id:'lao',title:'ພາສາລາວ',value:lao,set:setLao}].sort((a)=>lang==='lo'?(a.id==='lao'?-1:1):(a.id==='english'?-1:1)).map(field=><div key={field.id}>
        <label htmlFor={'post-'+field.id} className="block font-semibold text-sm mb-2">{field.title}</label>
        <textarea id={'post-'+field.id} lang={field.id==='lao'?'lo':'en'} value={field.value} onChange={e=>field.set(e.target.value)} maxLength={2000} placeholder={label('What would you like to share?','ທ່ານຕ້ອງການແບ່ງປັນຫຍັງ?')} className="w-full rounded-2xl border border-border bg-muted/30 p-3 min-h-[110px] resize-y font-lao"/>
        {!field.value.trim() && (field.id==='lao'?english.trim():lao.trim()) && <button type="button" disabled={busy||translating} className="touch-target text-primary text-sm" onClick={()=>void translate(field.id==='lao'?'lo':'en')}>{translating?label('Translating…','ກຳລັງແປ…'):field.id==='lao'?label('Translate English → Lao','ແປອັງກິດ → ລາວ'):label('Translate Lao → English','ແປລາວ → ອັງກິດ')}</button>}
        <p className="text-xs text-muted-foreground text-right">{field.value.length}/2000</p>
      </div>)}
      <label className="flex items-center gap-3 min-h-11"><input type="checkbox" checked={news} onChange={e=>setNews(e.target.checked)}/>{label('News report (source required)','ລາຍງານຂ່າວ (ຕ້ອງມີແຫຼ່ງຂໍ້ມູນ)')}</label>
      <div><label htmlFor="post-source" className="block text-sm font-semibold mb-2">{label('Source link','ລິ້ງແຫຼ່ງຂໍ້ມູນ')} {news?'*':label('(optional)','(ບໍ່ບັງຄັບ)')}</label><input id="post-source" type="url" inputMode="url" value={source} onChange={e=>setSource(e.target.value)} placeholder="https://" className="w-full rounded-xl border border-border bg-muted/30 px-3 py-3"/></div>
      <fieldset><legend className="text-sm font-semibold mb-2">{label('Choose topics','ເລືອກຫົວຂໍ້')} *</legend><div className="flex flex-wrap gap-2">{[...new Set([...TOPICS,...tags])].map(tag=><button type="button" key={tag} aria-pressed={tags.includes(tag)} onClick={()=>setTags(prev=>prev.includes(tag)?prev.filter(t=>t!==tag):[...prev,tag])} className={`min-h-11 px-3 rounded-full border text-sm ${tags.includes(tag)?'bg-primary text-white border-primary':'border-border bg-muted/30'}`}>#{TOPIC_LABELS[tag]?.[lang] || tag}</button>)}</div><div className="flex gap-2 mt-3"><input aria-label={label('Custom hashtag','ແຮັດແທັກໃໝ່')} value={customTag} onChange={e=>setCustomTag(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addTag();}}} placeholder={label('#YourTopic or #ຫົວຂໍ້','#ຫົວຂໍ້ໃໝ່')} className="flex-1 min-w-0 rounded-xl border border-border px-3 py-2"/><button type="button" onClick={addTag} disabled={!customTag.trim()||busy} className="touch-target px-4 rounded-xl bg-primary text-white">{label('Add','ເພີ່ມ')}</button></div></fieldset>
      <div><label className="flex items-center justify-center gap-2 min-h-12 border border-dashed border-border rounded-xl cursor-pointer"><ImagePlus size={20}/>{reading?label('Preparing photo…','ກຳລັງກະກຽມຮູບ…'):label('Attach a photo','ແນບຮູບພາບ')}<input type="file" accept="image/*" disabled={busy||reading} className="sr-only" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setReading(true);setError('');try{setPhoto(await readPhoto(f));}catch(err){setError((err as Error).message);}finally{setReading(false);e.target.value='';}}}/></label>{photo&&<div className="relative mt-3"><img src={photo} alt={label('Attachment preview','ຮູບທີ່ແນບ')} className="w-full max-h-60 object-contain rounded-xl"/><button aria-label={label('Remove photo','ລຶບຮູບ')} className="absolute right-2 top-2 touch-target rounded-full bg-black/60 text-white" onClick={()=>setPhoto(undefined)}><X size={20}/></button></div>}</div>
      <p className="text-xs text-muted-foreground">{label('Limit: 2 posts per 24 hours. Community posts are not automatically expert-verified.','ຈຳກັດ: 2 ໂພສຕໍ່ 24 ຊົ່ວໂມງ. ໂພສຊຸມຊົນບໍ່ໄດ້ຮັບການຢືນຢັນໂດຍຜູ້ຊ່ຽວຊານອັດຕະໂນມັດ.')}</p>
      {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  </section>;
}
